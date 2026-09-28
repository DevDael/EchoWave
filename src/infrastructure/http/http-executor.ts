import type { HttpTarget } from "../../domain/http-target.js";
import type { HttpMeasurements } from "../../domain/http-result.js";

export interface HttpExecutor {
  execute(target: HttpTarget): Promise<HttpMeasurements>;
}
