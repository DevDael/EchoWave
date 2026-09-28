import type { NormalizedTarget } from "../../domain/target.js";
import type { PingMeasurements } from "../../domain/ping-result.js";

export interface PingExecutor {
  execute(target: NormalizedTarget): Promise<PingMeasurements>;
}
