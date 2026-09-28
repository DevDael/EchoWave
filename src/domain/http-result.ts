import type { JsonObject } from "@elgato/utils";

export type HttpOutcome = "ok" | "redirect" | "http-error" | "network-error";
export type HttpErrorKind = "timeout" | "dns" | "tls" | "connection" | "other";

export interface HttpResult extends JsonObject {
  target: string;
  url: string;
  displayTarget: string;
  host: string;
  protocol: "http" | "https";
  statusCode?: number;
  latencyMs?: number;
  timestamp: string;
  outcome: HttpOutcome;
  errorKind?: HttpErrorKind;
}

export interface HttpMeasurements {
  statusCode: number;
  latencyMs: number;
}
