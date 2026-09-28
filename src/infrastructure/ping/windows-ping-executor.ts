import { spawn, type ChildProcessWithoutNullStreams, type SpawnOptionsWithoutStdio } from "node:child_process";
import type { PingMeasurements } from "../../domain/ping-result.js";
import type { NormalizedTarget } from "../../domain/target.js";
import type { PingExecutor } from "./ping-executor.js";
import { parseWindowsPing } from "./windows-ping-parser.js";

export class WindowsPingExecutor implements PingExecutor {
  public constructor(
    private readonly startProcess: (command: string, args: string[], options: SpawnOptionsWithoutStdio) => ChildProcessWithoutNullStreams = spawn,
    private readonly timeoutMs = 15_000,
    private readonly maxOutputBytes = 64 * 1024
  ) {}

  public execute(target: NormalizedTarget): Promise<PingMeasurements> {
    return new Promise((resolve, reject) => {
      // `shell: false` and fixed arguments keep the configured target out of a command shell.
      const child = this.startProcess("ping.exe", ["-n", "4", "-w", "1000", target.host], {
        shell: false,
        windowsHide: true
      });
      let stdout = "";
      let stderr = "";
      let outputBytes = 0;
      let completed = false;
      const timeout = setTimeout(() => fail(new Error("Windows ping exceeded its execution time limit.")), this.timeoutMs);
      const fail = (error: Error): void => {
        if (completed) return;
        completed = true;
        clearTimeout(timeout);
        child.kill();
        reject(error);
      };
      const append = (chunk: string, stream: "stdout" | "stderr"): void => {
        if (completed) return;
        outputBytes += Buffer.byteLength(chunk);
        if (outputBytes > this.maxOutputBytes) {
          fail(new Error("Windows ping produced too much output."));
          return;
        }
        if (stream === "stdout") stdout += chunk;
        else stderr += chunk;
      };
      child.stdout.setEncoding("utf8");
      child.stderr.setEncoding("utf8");
      child.stdout.on("data", (chunk: string) => append(chunk, "stdout"));
      child.stderr.on("data", (chunk: string) => append(chunk, "stderr"));
      child.once("error", (error) => fail(error));
      child.once("close", () => {
        if (completed) return;
        completed = true;
        clearTimeout(timeout);
        try {
          resolve(parseWindowsPing(stdout));
        } catch (error) {
          const reason = stderr.trim() || (error instanceof Error ? error.message : "Unknown ping failure.");
          reject(new Error(reason, { cause: error }));
        }
      });
    });
  }
}
