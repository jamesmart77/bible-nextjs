import { createSerwistRoute } from "@serwist/turbopack";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const offlineRevisionFiles = [
  "app/layout.tsx",
  "app/offline/OfflineLibrary.tsx",
  "app/offline/page.tsx",
  "lib/offline/passageCache.ts",
  "package-lock.json",
];

function createOfflineRevision() {
  const hash = createHash("sha256");

  for (const file of offlineRevisionFiles) {
    hash.update(readFileSync(resolve(process.cwd(), file)));
  }

  return hash.digest("hex").slice(0, 16);
}

export const { dynamic, dynamicParams, revalidate, generateStaticParams, GET } =
  createSerwistRoute({
    additionalPrecacheEntries: [
      {
        url: "/offline",
        revision: createOfflineRevision(),
      },
    ],
    swSrc: "app/sw.ts",
    useNativeEsbuild: true,
  });
