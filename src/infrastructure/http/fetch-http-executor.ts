import type { HttpTarget } from "../../domain/http-target.js";
import type { HttpMeasurements } from "../../domain/http-result.js";
import type { HttpExecutor } from "./http-executor.js";

export class FetchHttpExecutor implements HttpExecutor {
  constructor(private readonly request: typeof fetch = fetch, private readonly timeoutMs = 8_000) {}

  async execute(target: HttpTarget): Promise<HttpMeasurements> {
    const started = performance.now();
    const response = await this.request(target.url, {
      method: "GET",
      redirect: "manual",
      cache: "no-store",
      credentials: "omit",
      signal: AbortSignal.timeout(this.timeoutMs)
    });
    const latencyMs = Math.round(performance.now() - started);
    await response.body?.cancel().catch(() => undefined);
    return { statusCode: response.status, latencyMs };
  }
}
