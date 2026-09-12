"use client";

import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import { useServerInsertedHTML } from "next/navigation";
import { useState, type ReactNode } from "react";

export function EmotionRegistry({ children }: { children: ReactNode }) {
  const [{ cache, flush }] = useState(() => {
    const cache = createCache({ key: "css" });
    // Collect styles instead of inserting style tags into the component tree.
    cache.compat = true;
    const originalInsert = cache.insert;
    let pending: { name: string; global: boolean }[] = [];

    cache.insert = (...args) => {
      const [selector, serialized] = args;
      if (cache.inserted[serialized.name] === undefined) {
        pending.push({ name: serialized.name, global: !selector });
      }
      return originalInsert(...args);
    };

    return {
      cache,
      flush: () => {
        const styles = pending;
        pending = [];
        return styles;
      },
    };
  });

  useServerInsertedHTML(() => {
    const pending = flush();
    if (!pending.length) return null;
    const names: string[] = [];
    let styles = "";
    const globals: { name: string; styles: string }[] = [];

    for (const entry of pending) {
      const css = cache.inserted[entry.name];
      if (typeof css !== "string") continue;
      if (entry.global) globals.push({ name: entry.name, styles: css });
      else {
        names.push(entry.name);
        styles += css;
      }
    }

    return (
      <>
        {globals.map((entry) => (
          <style
            key={entry.name}
            data-emotion={`${cache.key}-global ${entry.name}`}
            dangerouslySetInnerHTML={{ __html: entry.styles }}
          />
        ))}
        {names.length > 0 && (
          <style
            data-emotion={`${cache.key} ${names.join(" ")}`}
            dangerouslySetInnerHTML={{ __html: styles }}
          />
        )}
      </>
    );
  });

  return <CacheProvider value={cache}>{children}</CacheProvider>;
}
