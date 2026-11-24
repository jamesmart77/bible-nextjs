import { createElement, Fragment } from "react";
import Link from "next/link";
import parse, { domToReact, type DOMNode, type HTMLReactParserOptions } from "html-react-parser";

const allowedTags = new Set(["p", "em", "strong", "a", "h3", "h4"]);
const discardedTags = new Set(["script", "style", "iframe", "object", "embed", "svg", "math", "template"]);

function scriptureHref(href: string | undefined): string | undefined {
  if (!href) return;
  try {
    const url = new URL(href, "https://www.justscripture.app");
    if (url.origin !== "https://www.justscripture.app" || url.username || url.password) return;
    if (!/^\/passages\/[a-z0-9-]+\/\d+(?:\/\d+(?:-\d+)?)?\/?$/i.test(url.pathname)) return;
    return url.pathname;
  } catch {
    return;
  }
}

// Model output and historical responses are untrusted. Rebuild only the supported
// markup, with no source attributes except validated local scripture links.
export function parseAssistedHtml(html: string) {
  const options: HTMLReactParserOptions = {
    replace(node) {
      if (node.type === "script" || node.type === "style") return <></>;
      if (node.type !== "tag") return;
      if (discardedTags.has(node.name)) return <></>;
      const children = domToReact(node.children as DOMNode[], options);
      if (!allowedTags.has(node.name)) return <Fragment>{children}</Fragment>;
      if (node.name === "a") {
        const href = scriptureHref(node.attribs.href);
        return href ? (
          <Link href={href} style={{ color: "var(--js-accent-solid)", textDecoration: "underline", textUnderlineOffset: "2px" }}>
            {children}
          </Link>
        ) : <Fragment>{children}</Fragment>;
      }
      return createElement(node.name, {}, children);
    },
  };
  return parse(html, options);
}
