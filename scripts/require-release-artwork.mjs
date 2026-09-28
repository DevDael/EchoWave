import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const path = join(root, "com.devdael.echowave.sdPlugin", "imgs", "themes", "hexaza", "background.png");
const expectedSha256 = "54d89671dfc15c6a7a4f0a67895acb8c5afd27df3822492ba2d920a0b929efda";
let image;
try {
  image = await readFile(path);
} catch (error) {
  if (error?.code !== "ENOENT") throw error;
  throw new Error("The authorized Hexaza background is not present. This public source checkout can be built and tested, but cannot create the official Marketplace package without the separately supplied artwork.");
}
if (createHash("sha256").update(image).digest("hex") !== expectedSha256) {
  throw new Error("Hexaza background does not match the approved release artwork.");
}
