import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import test from "node:test";
import { WindowsPingExecutor } from "../src/infrastructure/ping/windows-ping-executor.js";

const target = { original: "127.0.0.1", host: "127.0.0.1" };

test("limits abnormal ping output without invoking a shell", async () => {
  const executor = new WindowsPingExecutor((command, args, options) => {
    assert.equal(command, "ping.exe");
    assert.deepEqual(args, ["-n", "4", "-w", "1000", target.host]);
    assert.equal(options.shell, false);
    return spawn(process.execPath, ["-e", "process.stdout.write('x'.repeat(200))"], options);
  }, 5_000, 100);
  await assert.rejects(executor.execute(target), /too much output/i);
});

test("stops a ping process that does not finish", async () => {
  const executor = new WindowsPingExecutor((_command, _args, options) =>
    spawn(process.execPath, ["-e", "setInterval(() => {}, 1000)"], options), 500);
  await assert.rejects(executor.execute(target), /time limit/i);
});
