import assert from "node:assert/strict";
import test from "node:test";
import type { PingResult } from "../src/domain/ping-result.js";
import { parseSettings, withResultIfTargetUnchanged } from "../src/settings/ping-settings.js";

const result: PingResult = {
  target: "example.com",
  host: "example.com",
  sent: 4,
  received: 4,
  packetLoss: 0,
  avgLatencyMs: 12,
  timestamp: "2026-09-19T12:00:00.000Z",
  status: "reachable"
};

test("keeps theme and language changes made during a ping", () => {
  const started = parseSettings({ target: "example.com", theme: "minimal", language: "en" });
  const current = parseSettings({ target: "example.com", theme: "synthwave", language: "es" });
  assert.deepEqual(withResultIfTargetUnchanged(started, current, result), { ...current, lastResult: result });
});

test("does not save an old result over a newly selected target", () => {
  const started = parseSettings({ target: "example.com" });
  const current = parseSettings({ target: "localhost" });
  assert.equal(withResultIfTargetUnchanged(started, current, result), undefined);
});
