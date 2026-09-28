import { mkdir, writeFile } from "node:fs/promises";
import type { HttpResult } from "../src/domain/http-result.js";
import { renderHttpKey } from "../src/presentation/http-renderer.js";
import { httpThemes } from "../src/settings/http-settings.js";

const result: HttpResult = {
  target: "https://status.example.com/health",
  url: "https://status.example.com/health",
  displayTarget: "status.example.com/health",
  host: "status.example.com",
  protocol: "https",
  statusCode: 200,
  latencyMs: 42,
  timestamp: new Date().toISOString(),
  outcome: "ok"
};

const cards = httpThemes.map((theme) => `<article>
  <h2>${theme}</h2>
  <div>
    <img src="${renderHttpKey({ theme, status: "checking", target: result.target, frame: 5, locale: "en" })}" alt="${theme} checking" />
    <img src="${renderHttpKey({ theme, status: "result", result, locale: "en" })}" alt="${theme} result" />
    <img src="${renderHttpKey({ theme, status: "result", result, metricPage: 1, locale: "en" })}" alt="${theme} latency" />
  </div>
  <p>Checking · HTTP 200 · 42 ms</p>
</article>`).join("");

const html = `<!doctype html><html><head><meta charset="utf-8"><title>EchoWave web themes</title><style>
  body{margin:0;padding:32px;background:#080d17;color:#f8fafc;font:14px system-ui,sans-serif}
  h1{margin:0 0 24px;letter-spacing:.08em;color:#8edfff}
  .grid{display:grid;grid-template-columns:repeat(2,minmax(450px,1fr));gap:20px}
  article{padding:18px;border:1px solid #243958;border-radius:14px;background:#101827}
  h2{margin:0 0 12px;text-transform:capitalize}
  article div{display:flex;gap:14px}
  img{width:144px;height:144px;border-radius:20px;box-shadow:0 10px 30px #0008}
  p{margin:10px 0 0;color:#93a9c5}
</style></head><body><h1>EchoWave web check themes</h1><div class="grid">${cards}</div></body></html>`;

await mkdir("artifacts", { recursive: true });
await writeFile("artifacts/web-theme-preview.html", html, "utf8");
console.log("Created artifacts/web-theme-preview.html");
