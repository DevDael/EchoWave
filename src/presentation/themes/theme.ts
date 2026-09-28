import type { PingResult } from "../../domain/ping-result.js";
import type { PingStatus } from "../../domain/ping-status.js";

export interface KeyView {
  status: PingStatus;
  target?: string;
  result?: PingResult;
  frame?: number;
  metricPage?: number;
}

export interface Theme {
  render(view: KeyView): string;
}
