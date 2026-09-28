import assert from "node:assert/strict";
import test from "node:test";
import type { PingResult } from "../src/domain/ping-result.js";
import { metricPageLabel } from "../src/presentation/themes/shared.js";

const result: PingResult = {
  target: "dns.google",
  host: "dns.google",
  sent: 4,
  received: 3,
  packetLoss: 25,
  minLatencyMs: 10,
  avgLatencyMs: 12,
  maxLatencyMs: 16,
  ttl: 117,
  timestamp: "2026-09-16T00:00:00.000Z",
  status: "degraded"
};

test("formats every long-press metric page", () => {
  assert.deepEqual(
    [0, 1, 2, 3, 4].map((page) => metricPageLabel(result, page)),
    ["AVG 12 ms", "LOSS 25%", "RX 3/4", "MIN/MAX 10/16", "TTL 117"]
  );
});

test("wraps metric pages and handles unavailable values", () => {
  assert.equal(metricPageLabel(result, 5), "AVG 12 ms");
  assert.equal(metricPageLabel({ ...result, ttl: undefined }, 4), "TTL —");
});
