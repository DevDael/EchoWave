import type { HttpResult } from "../domain/http-result.js";
import type { HttpTheme } from "../settings/http-settings.js";
import { getHexazaBackground } from "./themes/hexaza-background.js";
import { escapeSvg, svg, targetText } from "./themes/shared.js";

export type HttpViewStatus = "ready" | "checking" | "result" | "error";
export type HttpLocale = "en" | "es";

export interface HttpKeyView {
  theme: HttpTheme;
  status: HttpViewStatus;
  target?: string;
  result?: HttpResult;
  frame?: number;
  metricPage?: number;
  locale: HttpLocale;
}

const colorByOutcome = { ok: "#4ade80", redirect: "#fbbf24", "http-error": "#fb7185", "network-error": "#f472b6" } as const;
export const httpMetricPageCount = 4;

export function renderHttpKey(view: HttpKeyView): string {
  const color = view.result ? colorByOutcome[view.result.outcome] : view.status === "error" ? "#fb7185" : "#38bdf8";
  const label = view.metricPage === undefined ? httpPrimaryLabel(view) : httpMetricLabel(view.result, view.metricPage, view.locale);
  const target = view.result?.displayTarget ?? view.target ?? (view.locale === "es" ? "FALTA URL" : "SET URL");
  const phase = (view.frame ?? 0) % 24;
  const progress = phase / 24;
  if (view.theme === "hexaza") {
    const accent = view.status === "ready" || view.status === "checking" ? "#FECF07" : color;
    const hexazaPhase = (view.frame ?? 0) % 20;
    const rings = [0, 5, 10, 15].map((offset) => {
      const p = ((hexazaPhase + offset) % 20) / 20;
      return `<circle cx="72" cy="52" r="${(7 + p * 42).toFixed(1)}" fill="none" stroke="${accent}" stroke-width="${(4 - p * 2).toFixed(1)}" opacity="${view.status === "checking" ? (Math.pow(1 - p, 1.45) * .82).toFixed(2) : ".15"}"/>`;
    }).join("");
    const pointRadius = view.status === "checking" ? 5 + Math.sin((hexazaPhase % 5) / 5 * Math.PI) * 3.6 : 7;
    return svg(`<defs>
      <radialGradient id="hexaza-web-point"><stop stop-color="#fff"/><stop offset=".35" stop-color="#fff4a3"/><stop offset="1" stop-color="${accent}"/></radialGradient>
      <linearGradient id="hexaza-web-tl-h" gradientUnits="userSpaceOnUse" x1="59" y1="11.5" x2="11.5" y2="11.5"><stop stop-color="${accent}" stop-opacity="0"/><stop offset=".42" stop-color="${accent}" stop-opacity=".26"/><stop offset=".77" stop-color="${accent}" stop-opacity=".92"/><stop offset="1" stop-color="${accent}"/></linearGradient>
      <linearGradient id="hexaza-web-tl-v" gradientUnits="userSpaceOnUse" x1="11.5" y1="20.7" x2="11.5" y2="59"><stop stop-color="${accent}"/><stop offset=".47" stop-color="${accent}" stop-opacity=".88"/><stop offset=".76" stop-color="${accent}" stop-opacity=".30"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/></linearGradient>
      <linearGradient id="hexaza-web-br-h" gradientUnits="userSpaceOnUse" x1="85" y1="132.5" x2="123.3" y2="132.5"><stop stop-color="${accent}" stop-opacity="0"/><stop offset=".24" stop-color="${accent}" stop-opacity=".30"/><stop offset=".53" stop-color="${accent}" stop-opacity=".88"/><stop offset="1" stop-color="${accent}"/></linearGradient>
      <linearGradient id="hexaza-web-br-v" gradientUnits="userSpaceOnUse" x1="132.5" y1="123.3" x2="132.5" y2="85"><stop stop-color="${accent}"/><stop offset=".47" stop-color="${accent}" stop-opacity=".88"/><stop offset=".76" stop-color="${accent}" stop-opacity=".30"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/></linearGradient>
      </defs>
      <image href="${getHexazaBackground()}" width="144" height="144" preserveAspectRatio="xMidYMid slice"/>
      <g fill="none" stroke-width="2.6" stroke-linecap="butt" opacity=".92">
        <path d="M59 11.5H22.5Q11.5 11.5 11.5 22.5" stroke="url(#hexaza-web-tl-h)"/>
        <path d="M11.5 20.7V59" stroke="url(#hexaza-web-tl-v)"/>
        <path d="M85 132.5H123.3" stroke="url(#hexaza-web-br-h)"/>
        <path d="M121.5 132.5Q132.5 132.5 132.5 121.5V85" stroke="url(#hexaza-web-br-v)"/>
      </g>
      ${rings}<circle cx="72" cy="52" r="${(pointRadius + 5).toFixed(1)}" fill="${accent}" opacity=".16"/>
      <circle cx="72" cy="52" r="${pointRadius.toFixed(1)}" fill="url(#hexaza-web-point)"/>
      <text x="72" y="99" text-anchor="middle" font-family="Arial,sans-serif" font-size="17" font-weight="800" fill="#f8fafc">${escapeSvg(label)}</text>
      ${targetText(target, "#d6dee7", "Arial,sans-serif", view.frame)}`);
  }
  if (view.theme === "sonar") {
    const sweepColor = view.status === "ready" || view.status === "checking" ? "#4ade80" : color;
    const angle = ((view.frame ?? 0) % 16) * 22.5 - 90;
    const radians = angle * Math.PI / 180;
    const x = 72 + Math.cos(radians) * 39;
    const y = 53 + Math.sin(radians) * 39;
    const blips = [[101, 39, 4], [47, 34, 3], [42, 65, 2.5], [87, 76, 3], [64, 43, 2], [111, 62, 2.5]]
      .map(([blipX, blipY, radius]) => `<circle cx="${blipX}" cy="${blipY}" r="${radius}" fill="${sweepColor}" opacity=".75"/>`).join("");
    return svg(`<defs><radialGradient id="web-sonar-bg"><stop stop-color="#102d22"/><stop offset="1" stop-color="#020b08"/></radialGradient></defs>
      <rect width="144" height="144" rx="20" fill="url(#web-sonar-bg)"/>
      <g fill="none" stroke="#225e44" stroke-width="2"><circle cx="72" cy="53" r="14"/><circle cx="72" cy="53" r="28"/><circle cx="72" cy="53" r="42"/></g>
      <path d="M72 53 L${x.toFixed(1)} ${y.toFixed(1)} A42 42 0 0 0 ${(72 + Math.cos(radians - .65) * 42).toFixed(1)} ${(53 + Math.sin(radians - .65) * 42).toFixed(1)} Z" fill="${sweepColor}" opacity="${view.status === "checking" ? ".28" : ".10"}"/>
      <line x1="72" y1="53" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="${sweepColor}" stroke-width="3" stroke-linecap="round"/>
      ${blips}<text x="72" y="99" text-anchor="middle" font-family="Arial,sans-serif" font-size="17" font-weight="800" fill="#ecfdf5">${escapeSvg(label)}</text>
      ${targetText(target, "#a7d7bd", "Arial,sans-serif", view.frame)}`);
  }
  if (view.theme === "blueprint-light") {
    const ink = view.result ? { ok: "#15803d", redirect: "#a16207", "http-error": "#be123c", "network-error": "#a21caf" }[view.result.outcome] : view.status === "error" ? "#be123c" : "#2563eb";
    const grid = Array.from({ length: 8 }, (_, index) => {
      const position = 9 + index * 18;
      return `<path d="M${position} 0V144M0 ${position}H144"/>`;
    }).join("");
    return svg(`<rect width="144" height="144" rx="20" fill="#eef7ff"/>
      <g id="web-blueprint-grid" fill="none" stroke="#bdd9f2" stroke-width="1" opacity=".62">${grid}</g>
      <g fill="none" stroke="#7aaed6" stroke-width="2"><path d="M24 65L45 35 72 53 96 28 120 56"/><path d="M45 35L51 73 72 53 99 72 120 56"/></g>
      <path d="M24 65L45 35 72 53 96 28 120 56" fill="none" stroke="${ink}" stroke-width="3" stroke-dasharray="7 7" stroke-dashoffset="${(-progress * 42).toFixed(1)}"/>
      ${[[24,65],[45,35],[51,73],[72,53],[96,28],[99,72],[120,56]].map(([x,y]) => `<circle cx="${x}" cy="${y}" r="4" fill="#fff" stroke="${ink}" stroke-width="2"/>`).join("")}
      <text x="72" y="99" text-anchor="middle" font-family="Arial,sans-serif" font-size="17" font-weight="800" fill="#173b63">${escapeSvg(label)}</text>
      ${targetText(target, "#315a7d", "Arial,sans-serif", view.frame)}`);
  }
  if (view.theme === "terminal") {
    return svg(`<rect width="144" height="144" rx="18" fill="#070f13"/><rect x="7" y="8" width="130" height="129" rx="11" fill="none" stroke="#164e42" stroke-width="2"/>
      <text x="16" y="30" font-family="monospace" font-size="13" fill="#5eead4">&gt; GET</text><path d="M17 37H127" stroke="#164e42"/>
      <text x="72" y="76" text-anchor="middle" font-family="monospace" font-size="17" font-weight="bold" fill="${color}">${escapeSvg(label)}</text>
      <text x="72" y="96" text-anchor="middle" font-family="monospace" font-size="10" fill="#5eead4">${view.status === "checking" ? `${"▮".repeat((phase % 6) + 1)}` : view.result?.protocol.toUpperCase() ?? "HTTP / HTTPS"}</text>
      ${targetText(target, "#a7f3d0", "monospace", view.frame)}`);
  }
  if (view.theme === "neon") {
    const ring = view.status === "checking" ? 16 + progress * 34 : 27;
    return svg(`<defs><filter id="glow"><feGaussianBlur stdDeviation="5"/></filter><radialGradient id="bg"><stop stop-color="#25143e"/><stop offset="1" stop-color="#080817"/></radialGradient></defs>
      <rect width="144" height="144" rx="18" fill="url(#bg)"/><circle cx="72" cy="51" r="${ring.toFixed(1)}" fill="none" stroke="#f0abfc" stroke-width="7" opacity=".6" filter="url(#glow)"/>
      <circle cx="72" cy="51" r="${ring.toFixed(1)}" fill="none" stroke="#f0abfc" stroke-width="2" opacity="${view.status === "checking" ? (1 - progress).toFixed(2) : ".8"}"/>
      <circle cx="72" cy="51" r="6" fill="${color}"/><text x="72" y="99" text-anchor="middle" font-family="Arial,sans-serif" font-size="17" font-weight="800" fill="#fff">${escapeSvg(label)}</text>
      ${targetText(target, "#e9d5ff", "Arial,sans-serif", view.frame)}`);
  }
  const rings = [0, 8, 16].map((offset) => {
    const p = ((phase + offset) % 24) / 24;
    return `<circle cx="72" cy="51" r="${(7 + p * 40).toFixed(1)}" fill="none" stroke="#67e8f9" stroke-width="${(4 - 2 * p).toFixed(1)}" opacity="${view.status === "checking" ? (1 - p).toFixed(2) : ".16"}"/>`;
  }).join("");
  return svg(`<defs><radialGradient id="bg"><stop stop-color="#152a54"/><stop offset="1" stop-color="#030817"/></radialGradient></defs>
    <rect width="144" height="144" rx="20" fill="url(#bg)"/>${rings}<circle cx="72" cy="51" r="7" fill="${color}"/>
    <text x="72" y="99" text-anchor="middle" font-family="Arial,sans-serif" font-size="17" font-weight="800" fill="#f4fbff">${escapeSvg(label)}</text>
    ${targetText(target, "#b8d5ee", "Arial,sans-serif", view.frame)}`);
}

export function httpPrimaryLabel(view: HttpKeyView): string {
  if (view.status === "checking") return view.locale === "es" ? "PROBANDO" : "CHECKING";
  if (view.status === "error") return view.locale === "es" ? "URL INVÁLIDA" : "INVALID URL";
  if (view.status === "result" && !view.result) return view.locale === "es" ? "SIN DATOS" : "NO RESULT";
  if (!view.result) return view.target ? view.locale === "es" ? "LISTO" : "READY" : view.locale === "es" ? "FALTA URL" : "SET URL";
  if (view.result.statusCode) return `HTTP ${view.result.statusCode}`;
  const kind = view.result.errorKind;
  if (kind === "timeout") return "TIMEOUT";
  if (kind === "dns") return "DNS ERROR";
  if (kind === "tls") return "TLS ERROR";
  return view.locale === "es" ? "SIN CONEXIÓN" : "NO CONNECTION";
}

export function httpMetricLabel(result: HttpResult | undefined, page: number, locale: HttpLocale): string {
  if (!result) return locale === "es" ? "SIN DATOS" : "NO RESULT";
  const labels = [
    result.statusCode ? `HTTP ${result.statusCode}` : result.errorKind?.toUpperCase() ?? "ERROR",
    result.latencyMs === undefined ? "— ms" : `${result.latencyMs} ms`,
    result.protocol.toUpperCase(),
    new Date(result.timestamp).toLocaleTimeString(locale === "es" ? "es-CO" : "en-US", { hour: "2-digit", minute: "2-digit" })
  ];
  return labels[((page % labels.length) + labels.length) % labels.length] ?? labels[0] ?? "—";
}
