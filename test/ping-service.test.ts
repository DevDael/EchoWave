import assert from "node:assert/strict";
import test from "node:test";
import { PingService } from "../src/application/ping-service.js";
import type { PingExecutor } from "../src/infrastructure/ping/ping-executor.js";

test("marks loss or high latency as degraded", async () => {
  const executor: PingExecutor = { execute: async () => ({ sent: 4, received: 4, packetLoss: 0, avgLatencyMs: 182 }) };
  const result = await new PingService(executor).run("example.com");
  assert.equal(result.status, "degraded");
  assert.equal(result.host, "example.com");
});

test("marks no replies as unreachable", async () => {
  const executor: PingExecutor = { execute: async () => ({ sent: 4, received: 0, packetLoss: 100 }) };
  const result = await new PingService(executor).run("192.0.2.1");
  assert.equal(result.status, "unreachable");
});
