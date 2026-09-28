import type { PingResult } from "../domain/ping-result.js";
import type { PingStatus } from "../domain/ping-status.js";
import { httpPrimaryLabel, type HttpKeyView } from "./http-renderer.js";
import { keyCopy, metricLabel, withPresentationLocale, type PresentationLocale } from "./themes/shared.js";

const pulse = ["○", "◎", "◉", "◎"] as const;
const targetWidth = 10;

/** Native Stream Deck titles remain visible over a user-selected key image. */
export function renderPingIconTitle(view: {
  status: PingStatus;
  target?: string;
  result?: PingResult;
  frame?: number;
  metricPage?: number;
  locale: PresentationLocale;
}): string {
  return withPresentationLocale(view.locale, () => {
    if (view.result && view.metricPage !== undefined) return pingMetricTitle(view.result, view.metricPage, view.locale);
    const label = view.status === "pinging"
      ? `${pulse[(view.frame ?? 0) % pulse.length]} PING`
      : metricLabel(view.status, view.result?.avgLatencyMs);
    const target = view.target || keyCopy("setTarget", view.locale);
    return `${label}\n${titleTarget(target, view.frame, true)}`;
  });
}

export function renderHttpIconTitle(view: HttpKeyView): string {
  if (view.result && view.metricPage !== undefined) return httpMetricTitle(view.result, view.metricPage, view.locale);
  const label = view.status === "checking" ? `${pulse[(view.frame ?? 0) % pulse.length]} GET` :
    view.status === "error" ? "URL ERROR" : httpPrimaryLabel(view);
  const target = view.result?.displayTarget ?? view.target ?? (view.locale === "es" ? "FALTA URL" : "SET URL");
  return `${label}\n${titleTarget(target, view.frame, false)}`;
}

function pingMetricTitle(result: PingResult, page: number, locale: PresentationLocale): string {
  const labels: readonly [string, string][] = locale === "es" ? [
    ["PROMEDIO", valueWithUnit(result.avgLatencyMs)],
    ["PÉRDIDA", `${result.packetLoss}%`],
    ["RECIBIDOS", `${result.received}/${result.sent}`],
    ["MÍN/MÁX", pairWithUnit(result.minLatencyMs, result.maxLatencyMs)],
    ["TTL", `${result.ttl ?? "—"}`]
  ] : [
    ["AVERAGE", valueWithUnit(result.avgLatencyMs)],
    ["LOSS", `${result.packetLoss}%`],
    ["PACKETS", `${result.received}/${result.sent}`],
    ["MIN/MAX", pairWithUnit(result.minLatencyMs, result.maxLatencyMs)],
    ["TTL", `${result.ttl ?? "—"}`]
  ];
  return (labels[((page % labels.length) + labels.length) % labels.length] ?? labels[0] ?? ["—", "—"]).join("\n");
}

function httpMetricTitle(result: NonNullable<HttpKeyView["result"]>, page: number, locale: PresentationLocale): string {
  const labels: readonly [string, string][] = [
    [locale === "es" ? "ESTADO" : "STATUS", result.statusCode ? `HTTP ${result.statusCode}` : result.errorKind?.toUpperCase() ?? "ERROR"],
    [locale === "es" ? "TIEMPO" : "TIME", valueWithUnit(result.latencyMs)],
    [locale === "es" ? "PROTOCOLO" : "PROTOCOL", result.protocol.toUpperCase()],
    [locale === "es" ? "HORA" : "CHECKED", new Date(result.timestamp).toLocaleTimeString(locale === "es" ? "es-CO" : "en-US", { hour: "2-digit", minute: "2-digit", hour12: false })]
  ];
  return (labels[((page % labels.length) + labels.length) % labels.length] ?? labels[0] ?? ["—", "—"]).join("\n");
}

function valueWithUnit(value: number | undefined): string {
  return value === undefined ? "— ms" : `${value} ms`;
}

function pairWithUnit(minimum: number | undefined, maximum: number | undefined): string {
  return minimum === undefined || maximum === undefined ? "— ms" : `${minimum}/${maximum} ms`;
}

function titleTarget(value: string, frame: number | undefined, hostOnly: boolean): string {
  let text = value.trim().replace(/[\r\n\t]+/g, " ");
  if (hostOnly && text.includes("://")) {
    try { text = new URL(text).hostname.replace(/^\[(.*)]$/, "$1"); }
    catch { /* Invalid targets are reported separately. */ }
  } else if (text.includes("://")) {
    try {
      const url = new URL(text);
      text = `${url.host}${url.pathname}${url.search}`;
    } catch { /* Invalid URLs are reported separately. */ }
  }
  if (text.length <= targetWidth) return text;
  if (frame === undefined) return `${text.slice(0, targetWidth - 1)}…`;
  const separator = "   ";
  const repeated = `${text}${separator}${text}`;
  const offset = frame % (text.length + separator.length);
  return repeated.slice(offset, offset + targetWidth);
}
