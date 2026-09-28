import assert from "node:assert/strict";
import test from "node:test";
import type { HttpResult } from "../src/domain/http-result.js";
import type { PingResult } from "../src/domain/ping-result.js";
import { renderHttpIconTitle, renderPingIconTitle } from "../src/presentation/icon-title.js";
import { parseHttpSettings, withHttpResultIfTargetUnchanged } from "../src/settings/http-settings.js";
import { parseSettings, withResultIfTargetUnchanged } from "../src/settings/ping-settings.js";

const pingResult: PingResult = {
  target: "https://status.internal.example.com/health",
  host: "status.internal.example.com",
  sent: 4,
  received: 4,
  packetLoss: 0,
  minLatencyMs: 10,
  avgLatencyMs: 12,
  maxLatencyMs: 15,
  ttl: 117,
  timestamp: "2026-09-20T12:00:00.000Z",
  status: "reachable"
};

const httpResult: HttpResult = {
  target: "https://status.example.com/health",
  url: "https://status.example.com/health",
  displayTarget: "status.example.com/health",
  host: "status.example.com",
  protocol: "https",
  statusCode: 200,
  latencyMs: 48,
  outcome: "ok",
  timestamp: "2026-09-20T12:00:00.000Z"
};

test("existing actions stay visual; custom icon mode is opt-in and survives a saved result", () => {
  assert.equal(parseSettings({}).displayMode, "visual");
  assert.equal(parseHttpSettings({}).displayMode, "visual");
  assert.equal(parseSettings({ displayMode: "invalid" }).displayMode, "visual");
  assert.equal(parseHttpSettings({ displayMode: "invalid" }).displayMode, "visual");
  const ping = parseSettings({ target: pingResult.target, displayMode: "custom-icon" });
  const http = parseHttpSettings({ target: httpResult.target, displayMode: "custom-icon" });
  assert.equal(withResultIfTargetUnchanged(ping, ping, pingResult)?.displayMode, "custom-icon");
  assert.equal(withHttpResultIfTargetUnchanged(http, http, httpResult)?.displayMode, "custom-icon");
});

test("ping title animates a text pulse over custom images and scrolls a long host", () => {
  const first = renderPingIconTitle({ status: "pinging", target: pingResult.target, frame: 0, locale: "es" });
  const next = renderPingIconTitle({ status: "pinging", target: pingResult.target, frame: 1, locale: "es" });
  assert.equal(first, "○ PING\nstatus.int");
  assert.equal(next, "◎ PING\ntatus.inte");
  assert.notEqual(first, next);
  assert.equal(renderPingIconTitle({ status: "reachable", target: "dns.google", result: { ...pingResult, host: "dns.google" }, locale: "es" }), "12 ms\ndns.google");
  assert.equal(renderPingIconTitle({ status: "reachable", target: "dns.google", result: pingResult, metricPage: 1, locale: "es" }), "PÉRDIDA\n0%");
  assert.equal(renderPingIconTitle({ status: "reachable", target: "dns.google", result: pingResult, metricPage: 3, locale: "es" }), "MÍN/MÁX\n10/15 ms");
});

test("HTTP title keeps a custom icon, shows status and metrics, and pulses during checks", () => {
  const checking = { theme: "echo-wave" as const, status: "checking" as const, target: httpResult.target, locale: "en" as const };
  assert.equal(renderHttpIconTitle({ ...checking, frame: 0 }), "○ GET\nstatus.exa");
  assert.equal(renderHttpIconTitle({ ...checking, frame: 1 }), "◎ GET\ntatus.exam");
  assert.equal(renderHttpIconTitle({ ...checking, status: "result", result: httpResult }), "HTTP 200\nstatus.ex…");
  assert.equal(renderHttpIconTitle({ ...checking, status: "result", result: httpResult, metricPage: 1 }), "TIME\n48 ms");
});
