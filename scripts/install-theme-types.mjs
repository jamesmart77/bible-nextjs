import { copyFileSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Keep the custom theme typings without installing Chakra CLI's unpatched
// braces dependency. These files were generated with Chakra CLI 3.37.0.
const require = createRequire(import.meta.url);
const source = fileURLToPath(new URL("../app/theme/generated/", import.meta.url));
const target = resolve(dirname(require.resolve("@chakra-ui/react")), "../types/styled-system/generated");
for (const name of readdirSync(source)) {
  if (name.endsWith(".d.ts")) copyFileSync(resolve(source, name), resolve(target, name));
}
