import { build } from "esbuild";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import "./generate-icon.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const pluginDir = join(root, "com.devdael.echowave.sdPlugin");
const manifest = JSON.parse(await readFile(join(pluginDir, "manifest.json"), "utf8"));
if (manifest.UUID !== "com.devdael.echowave") {
  throw new Error("Refusing to build into a directory for another plugin.");
}

await build({
  entryPoints: [join(root, "src/plugin.ts")],
  bundle: true,
  platform: "node",
  target: "node24",
  format: "cjs",
  outfile: join(pluginDir, "bin/plugin.js"),
  sourcemap: false,
  logLevel: "info"
});
