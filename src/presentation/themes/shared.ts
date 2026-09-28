import type { PingStatus } from "../../domain/ping-status.js";
import type { PingResult } from "../../domain/ping-result.js";

export type PresentationLocale = "en" | "es";
type KeyCopy = "setTarget" | "invalidTarget" | "error" | "noResult" | "targetRequired" | "targetInvalid";

let presentationLocale: PresentationLocale = "en";

const copy = {
  en: {
    setTarget: "SET TARGET",
    invalidTarget: "INVALID TARGET",
    error: "ERROR",
    noResult: "NO RESULT",
    targetRequired: "Enter a target.",
    targetInvalid: "Enter a valid hostname, IP address, or URL.",
    pinging: "PINGING",
    ready: "READY",
    reachable: "REACHABLE",
    degraded: "DEGRADED",
    unreachable: "NO REPLY",
    average: "AVG",
    loss: "LOSS",
    minMax: "MIN/MAX"
  },
  es: {
    setTarget: "FALTA DESTINO",
    invalidTarget: "DESTINO INVÁLIDO",
    error: "ERROR",
    noResult: "SIN DATOS",
    targetRequired: "Introduce un destino.",
    targetInvalid: "Introduce un hostname, una IP o una URL válida.",
    pinging: "ENVIANDO",
    ready: "LISTO",
    reachable: "CONECTADO",
    degraded: "DEGRADADO",
    unreachable: "SIN RESPUESTA",
    average: "PROM",
    loss: "PÉRD",
    minMax: "MÍN/MÁX"
  }
} as const;

export function setPresentationLocale(locale: PresentationLocale): void {
  presentationLocale = locale;
}

export function keyCopy(key: KeyCopy, locale = presentationLocale): string {
  return copy[locale][key];
}

export function withPresentationLocale<T>(locale: PresentationLocale, render: () => T): T {
  const previous = presentationLocale;
  presentationLocale = locale;
  try {
    return render();
  } finally {
    presentationLocale = previous;
  }
}

export const statusColor: Record<PingStatus, string> = {
  ready: "#38bdf8",
  pinging: "#fbbf24",
  reachable: "#4ade80",
  degraded: "#fb923c",
  unreachable: "#f87171",
  error: "#f472b6"
};

export function escapeSvg(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[character] ?? character);
}

export function targetLabel(target: string | undefined): string {
  if (!target) return keyCopy("setTarget");
  const displayTarget = normalizeDisplayTarget(target);
  return displayTarget.length > 32 ? `${displayTarget.slice(0, 31)}…` : displayTarget;
}

export function targetLines(target: string | undefined): readonly string[] {
  const label = targetLabel(target);
  if (label.length <= 16) return [label];

  const splitAt = findReadableSplit(label, 16);
  return [label.slice(0, splitAt), label.slice(splitAt)].filter(Boolean);
}

export function targetText(target: string | undefined, color = "#cbd5e1", fontFamily = "Arial,sans-serif", frame?: number): string {
  const fullLabel = target ? normalizeDisplayTarget(target) : keyCopy("setTarget");
  if (frame !== undefined && fullLabel.length > 16) {
    const separator = "   •   ";
    const characterWidth = fontFamily.includes("mono") ? 8.35 : 7.75;
    const cycleWidth = (fullLabel.length + separator.length) * characterWidth;
    const offset = (frame * 2.4) % cycleWidth;
    return `<defs><clipPath id="target-marquee-clip"><rect x="9" y="107" width="126" height="30" rx="3"/></clipPath></defs>
      <g clip-path="url(#target-marquee-clip)"><text x="${(10 - offset).toFixed(1)}" y="127" font-family="${fontFamily}" font-size="15" font-weight="700" fill="${color}">${escapeSvg(`${fullLabel}${separator}${fullLabel}`)}</text></g>`;
  }
  const lines = targetLines(target);
  const firstY = lines.length > 1 ? 117 : 126;
  return `<text x="72" y="${firstY}" text-anchor="middle" font-family="${fontFamily}" font-size="15" font-weight="700" fill="${color}">${lines
    .map((line, index) => `<tspan x="72" dy="${index === 0 ? 0 : 16}">${escapeSvg(line)}</tspan>`)
    .join("")}</text>`;
}

export function targetNeedsMarquee(target: string | undefined): boolean {
  return Boolean(target && normalizeDisplayTarget(target).length > 16);
}

export function metricLabel(status: PingStatus, average?: number): string {
  if (status === "pinging") return copy[presentationLocale].pinging;
  if (average !== undefined) return `${average} ms`;
  if (status === "error") return copy[presentationLocale].error;
  return copy[presentationLocale][status];
}

export function metricPageLabel(result: PingResult, page: number): string {
  const labels = [
    `${copy[presentationLocale].average} ${formatMetric(result.avgLatencyMs, "ms")}`,
    `${copy[presentationLocale].loss} ${result.packetLoss}%`,
    `RX ${result.received}/${result.sent}`,
    `${copy[presentationLocale].minMax} ${formatPair(result.minLatencyMs, result.maxLatencyMs)}`,
    `TTL ${result.ttl ?? "—"}`
  ];
  return labels[((page % labels.length) + labels.length) % labels.length] ?? labels[0] ?? "NO DATA";
}

export const metricPageCount = 5;

function normalizeDisplayTarget(target: string): string {
  const trimmed = target.trim();
  if (!trimmed.includes("://")) return trimmed;
  try {
    return new URL(trimmed).hostname.replace(/^\[(.*)]$/, "$1");
  } catch {
    return trimmed;
  }
}

function findReadableSplit(value: string, preferred: number): number {
  const candidates = [value.lastIndexOf(".", preferred), value.lastIndexOf("-", preferred), value.lastIndexOf(":", preferred)];
  const readable = Math.max(...candidates);
  if (readable >= 8 && value.length - (readable + 1) <= preferred) return readable + 1;
  return preferred;
}

function formatMetric(value: number | undefined, unit: string): string {
  return value === undefined ? "—" : `${value} ${unit}`;
}

function formatPair(minimum: number | undefined, maximum: number | undefined): string {
  return minimum === undefined || maximum === undefined ? "—" : `${minimum}/${maximum}`;
}

export function svg(body: string): string {
  const source = `<svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">${body}</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(source).toString("base64")}`;
}
