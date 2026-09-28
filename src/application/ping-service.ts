import type { PingResult } from "../domain/ping-result.js";
import type { PingStatus } from "../domain/ping-status.js";
import { normalizeTarget } from "../domain/target.js";
import type { PingExecutor } from "../infrastructure/ping/ping-executor.js";

export class PingService {
  public constructor(private readonly executor: PingExecutor) {}

  public async run(targetInput: string): Promise<PingResult> {
    const target = normalizeTarget(targetInput);
    try {
      const measurements = await this.executor.execute(target);
      return {
        target: target.original,
        host: target.host,
        ...measurements,
        timestamp: new Date().toISOString(),
        status: classify(measurements.received, measurements.packetLoss, measurements.avgLatencyMs)
      };
    } catch (error) {
      return {
        target: target.original,
        host: target.host,
        sent: 0,
        received: 0,
        packetLoss: 100,
        timestamp: new Date().toISOString(),
        status: "error",
        error: error instanceof Error ? error.message : "Ping execution failed."
      };
    }
  }
}

function classify(received: number, packetLoss: number, averageLatency: number | undefined): PingStatus {
  if (received === 0) return "unreachable";
  if (packetLoss > 0 || (averageLatency !== undefined && averageLatency >= 150)) return "degraded";
  return "reachable";
}
