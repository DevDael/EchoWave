import assert from "node:assert/strict";
import { createServer } from "node:http";
import test from "node:test";
import { AddressInfo } from "node:net";
import { HttpService } from "../src/application/http-service.js";
import { normalizeHttpTarget } from "../src/domain/http-target.js";
import { FetchHttpExecutor } from "../src/infrastructure/http/fetch-http-executor.js";
import { renderHttpKey } from "../src/presentation/http-renderer.js";
import { httpThemes, parseHttpSettings, withHttpResultIfTargetUnchanged } from "../src/settings/http-settings.js";

test("accepts full HTTP URLs and preserves path, query and IPv6", () => {
  const target = normalizeHttpTarget("  HTTPS://Example.COM:8443/health?q=1  ");
  assert.equal(target.url, "https://example.com:8443/health?q=1");
  assert.equal(target.host, "example.com");
  assert.equal(target.displayTarget, "example.com:8443/health?q=1");
  assert.equal(normalizeHttpTarget("http://[::1]:8080/status").host, "::1");
});

test("rejects non-web schemes, credentials, fragments and malformed input", () => {
  for (const value of ["", "example.com", "ftp://example.com", "https://user:pass@example.com", "https://example.com/#token", "http://example.com:0", "https://example.com/x y", "https://example.com\\@evil.test"]) {
    assert.throws(() => normalizeHttpTarget(value), value);
  }
});

test("GET reports 2xx, 3xx and 5xx without following redirects or reading bodies", async () => {
  const server = createServer((request, response) => {
    if (request.url === "/redirect") { response.writeHead(302, { Location: "/ok" }); response.end(); return; }
    if (request.url === "/fail") { response.writeHead(503); response.end("unavailable"); return; }
    response.writeHead(200); response.end("healthy");
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  try {
    const port = (server.address() as AddressInfo).port;
    const service = new HttpService(new FetchHttpExecutor());
    const ok = await service.run(`http://127.0.0.1:${port}/ok?source=deck`);
    assert.equal(ok.statusCode, 200);
    assert.equal(ok.outcome, "ok");
    assert.equal(ok.target, `http://127.0.0.1:${port}/ok?source=deck`);
    assert.equal(ok.displayTarget, `127.0.0.1:${port}/ok?source=deck`);
    assert.ok(ok.latencyMs !== undefined && ok.latencyMs >= 0);
    assert.ok(!Number.isNaN(Date.parse(ok.timestamp)));
    const redirect = await service.run(`http://127.0.0.1:${port}/redirect`);
    assert.equal(redirect.statusCode, 302);
    assert.equal(redirect.outcome, "redirect");
    const failure = await service.run(`http://127.0.0.1:${port}/fail`);
    assert.equal(failure.statusCode, 503);
    assert.equal(failure.outcome, "http-error");
  } finally { server.closeAllConnections(); await new Promise<void>((resolve) => server.close(() => resolve())); }
});

test("timeout and changed settings do not mislabel or overwrite saved results", async () => {
  const request: typeof fetch = async (_url, init) => {
    await new Promise<void>((_resolve, reject) => init?.signal?.addEventListener("abort", () => reject(init.signal?.reason), { once: true }));
    throw new Error("unreachable");
  };
  const service = new HttpService(new FetchHttpExecutor(request, 10));
  const result = await service.run("https://example.com/health");
  assert.equal(result.outcome, "network-error");
  assert.equal(result.errorKind, "timeout");
  const initial = parseHttpSettings({ target: "https://example.com/health" });
  const changed = parseHttpSettings({ target: "https://example.com/other", theme: "neon" });
  assert.equal(withHttpResultIfTargetUnchanged(initial, changed, result), undefined);
  assert.equal(withHttpResultIfTargetUnchanged(initial, { ...initial, theme: "neon", language: "es" }, result)?.theme, "neon");
  assert.equal(parseHttpSettings({ target: changed.target, lastResult: result }).lastResult, undefined);
});

test("six web themes render outcomes, animate checks, and preserve four readable metric pages", () => {
  const result = { target: "https://example.com/health", url: "https://example.com/health", displayTarget: "example.com/health", host: "example.com", protocol: "https" as const, statusCode: 503, latencyMs: 31, timestamp: "2026-09-19T10:00:00.000Z", outcome: "http-error" as const };
  assert.equal(httpThemes.length, 6);
  for (const theme of httpThemes) {
    assert.equal(parseHttpSettings({ theme }).theme, theme);
    const main = renderHttpKey({ theme, status: "result", result, locale: "es" });
    const decoded = Buffer.from(main.slice("data:image/svg+xml;base64,".length), "base64").toString();
    assert.match(decoded, /HTTP 503/);
    assert.match(decoded, /example.com/);
    assert.notEqual(renderHttpKey({ theme, status: "checking", target: result.target, frame: 0, locale: "es" }), renderHttpKey({ theme, status: "checking", target: result.target, frame: 1, locale: "es" }));
    for (let page = 0; page < 4; page++) assert.match(renderHttpKey({ theme, status: "result", result, metricPage: page, locale: "es" }), /^data:image\/svg\+xml;base64,/);
  }
  const hexaza = Buffer.from(renderHttpKey({ theme: "hexaza", status: "checking", target: result.target, frame: 1, locale: "es" }).slice("data:image/svg+xml;base64,".length), "base64").toString();
  assert.match(hexaza, /<image href="data:image\/(?:png|svg\+xml);base64,/);
  assert.match(hexaza, /M59 11\.5H22\.5Q11\.5 11\.5 11\.5 22\.5/);
  assert.doesNotMatch(hexaza, />HEXAZA</);
  const sonar = Buffer.from(renderHttpKey({ theme: "sonar", status: "checking", target: result.target, frame: 1, locale: "es" }).slice("data:image/svg+xml;base64,".length), "base64").toString();
  assert.match(sonar, /id="web-sonar-bg"/);
  const blueprint = Buffer.from(renderHttpKey({ theme: "blueprint-light", status: "checking", target: result.target, frame: 1, locale: "es" }).slice("data:image/svg+xml;base64,".length), "base64").toString();
  assert.match(blueprint, /id="web-blueprint-grid"/);
});
