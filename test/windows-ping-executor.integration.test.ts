import assert from "node:assert/strict";
import test from "node:test";
import { WindowsPingExecutor } from "../src/infrastructure/ping/windows-ping-executor.js";

test("executes and parses the local Windows ping command", { skip: process.platform !== "win32" }, async () => {
  const result = await new WindowsPingExecutor().execute({ original: "127.0.0.1", host: "127.0.0.1" });
  assert.equal(result.sent, 4);
  assert.equal(result.received, 4);
  assert.equal(result.packetLoss, 0);
  assert.equal(result.resolvedIp, "127.0.0.1");
});
