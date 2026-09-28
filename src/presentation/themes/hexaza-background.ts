import { readFileSync } from "node:fs";
import { join } from "node:path";

let cachedBackground: string | undefined;

export function getHexazaBackground(): string {
  cachedBackground ??= readBackground();
  return cachedBackground;
}

function readBackground(): string {
  const path = typeof __dirname === "string"
    ? join(__dirname, "..", "imgs", "themes", "hexaza", "background.png")
    : undefined;
  if (path) {
    try {
      return `data:image/png;base64,${readFileSync(path).toString("base64")}`;
    } catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
  }
  // The public source repository omits Piotezaza's PNG. A neutral, original
  // gradient keeps local previews buildable; the authorized release includes
  // the real background and is packaged only after it is supplied separately.
  const fallback = '<svg xmlns="http://www.w3.org/2000/svg" width="144" height="144"><defs><radialGradient id="g"><stop stop-color="#182635"/><stop offset="1" stop-color="#050e17"/></radialGradient></defs><rect width="144" height="144" fill="url(#g)"/></svg>';
  return `data:image/svg+xml;base64,${Buffer.from(fallback).toString("base64")}`;
}
