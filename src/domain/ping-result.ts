import type { PingStatus } from "./ping-status.js";
import type { JsonObject } from "@elgato/utils";

export interface PingResult extends JsonObject {
  target: string;
  host: string;
  resolvedIp?: string;
  sent: number;
  received: number;
  packetLoss: number;
  minLatencyMs?: number;
  avgLatencyMs?: number;
  maxLatencyMs?: number;
  ttl?: number;
  timestamp: string;
  status: PingStatus;
  error?: string;
}

export type PingMeasurements = Pick<
  PingResult,
  "resolvedIp" | "sent" | "received" | "packetLoss" | "minLatencyMs" | "avgLatencyMs" | "maxLatencyMs" | "ttl"
>;
