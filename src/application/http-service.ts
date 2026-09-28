import type { HttpErrorKind, HttpOutcome, HttpResult } from "../domain/http-result.js";
import { normalizeHttpTarget } from "../domain/http-target.js";
import type { HttpExecutor } from "../infrastructure/http/http-executor.js";

export class HttpService {
  constructor(private readonly executor: HttpExecutor) {}

  async run(value: string): Promise<HttpResult> {
    const target = normalizeHttpTarget(value);
    const identity = {
      target: target.original,
      url: target.url,
      displayTarget: target.displayTarget,
      host: target.host,
      protocol: target.protocol
    };
    try {
      const measurement = await this.executor.execute(target);
      return { ...identity, ...measurement, timestamp: new Date().toISOString(), outcome: classifyStatus(measurement.statusCode) };
    } catch (error) {
      return { ...identity, timestamp: new Date().toISOString(), outcome: "network-error", errorKind: classifyError(error) };
    }
  }
}

export function classifyStatus(code: number): HttpOutcome {
  if (code >= 200 && code < 300) return "ok";
  if (code >= 300 && code < 400) return "redirect";
  return "http-error";
}

export function classifyError(error: unknown): HttpErrorKind {
  if (!(error instanceof Error)) return "other";
  if (error.name === "TimeoutError" || error.name === "AbortError") return "timeout";
  const cause = (error as Error & { cause?: { code?: string } }).cause;
  const code = cause?.code ?? "";
  if (["ENOTFOUND", "EAI_AGAIN"].includes(code)) return "dns";
  if (/CERT|TLS|SSL|SELF_SIGNED/.test(code)) return "tls";
  if (["ECONNREFUSED", "ECONNRESET", "EHOSTUNREACH", "ENETUNREACH", "UND_ERR_CONNECT_TIMEOUT"].includes(code)) return "connection";
  return "other";
}
