export type PingStatus = "ready" | "pinging" | "reachable" | "degraded" | "unreachable" | "error";

export const isResultStatus = (status: PingStatus): status is "reachable" | "degraded" | "unreachable" | "error" =>
  status !== "ready" && status !== "pinging";
