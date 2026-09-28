import { mkdir, writeFile } from "node:fs/promises";
import { renderKey } from "../src/presentation/renderer.js";
import type { PingResult } from "../src/domain/ping-result.js";
import { themes } from "../src/settings/ping-settings.js";

const result: PingResult = {
  target: "https://status.internal.example.com/health",
  host: "status.internal.example.com",
  resolvedIp: "192.0.2.10",
  sent: 4,
  received: 4,
  packetLoss: 0,
  minLatencyMs: 11,
  avgLatencyMs: 14,
  maxLatencyMs: 18,
  ttl: 117,
  timestamp: new Date().toISOString(),
  status: "reachable"
};

const cards = themes.map((theme) => `<article>
  <h2>${theme}</h2>
  <div><img src="${renderKey(theme, "pinging", result.target, undefined, 5)}"><img src="${renderKey(theme, "reachable", result.host, result)}"></div>
  <p>animating / result</p>
</article>`).join("");

const html = `<!doctype html><html><head><meta charset="utf-8"><title>EchoWave theme preview</title><style>
  body{margin:0;padding:32px;background:#080d17;color:#f8fafc;font:14px system-ui,sans-serif}h1{letter-spacing:.08em;color:#8edfff}.grid{display:grid;grid-template-columns:repeat(3,minmax(250px,1fr));gap:20px}article{padding:18px;border:1px solid #243958;border-radius:14px;background:#101827}h2{margin:0 0 12px;text-transform:capitalize}article div{display:flex;gap:14px}img{width:144px;height:144px;border-radius:20px;box-shadow:0 10px 30px #0008}p{margin:10px 0 0;color:#93a9c5}
</style></head><body><h1>EchoWave V0.6 themes</h1><div class="grid">${cards}</div></body></html>`;

await mkdir("artifacts", { recursive: true });
await Promise.all([
  writeFile("artifacts/theme-preview.html", html, "utf8"),
  ...themes.flatMap((theme) => [
    writeFile(`artifacts/${theme}-pinging.svg`, decodeSvg(renderKey(theme, "pinging", result.target, undefined, 5)), "utf8"),
    writeFile(`artifacts/${theme}-result.svg`, decodeSvg(renderKey(theme, "reachable", result.host, result)), "utf8")
  ])
]);
console.log("Created artifacts/theme-preview.html and SVG reference frames");

function decodeSvg(dataUri: string): string {
  return Buffer.from(dataUri.split(",", 2)[1] ?? "", "base64").toString("utf8");
}
