import { readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const pluginDir = join(root, "com.devdael.echowave.sdPlugin");
const manifest = JSON.parse(await readFile(join(pluginDir, "manifest.json"), "utf8"));
if (manifest.UUID !== "com.devdael.echowave") {
  throw new Error("Refusing to clean a directory for another plugin.");
}
await rm(join(pluginDir, "bin"), { recursive: true, force: true });
