import type { Theme } from "./theme.js";
import { escapeSvg, metricLabel, metricPageLabel, statusColor, svg, targetText } from "./shared.js";

export const prismTheme: Theme = {
  render(view) {
    const color = statusColor[view.status];
    const phase = ((view.frame ?? 0) % 20) / 19;
    const incomingX = 17 + phase * 39;
    const outgoingX = 88 + phase * 39;
    const label = view.result && view.metricPage !== undefined ? metricPageLabel(view.result, view.metricPage) : metricLabel(view.status, view.result?.avgLatencyMs);

    return svg(`<defs><linearGradient id="prism-bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#14172a"/><stop offset="1" stop-color="#060711"/></linearGradient><linearGradient id="prism-face" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#e0f2fe" stop-opacity=".72"/><stop offset="1" stop-color="#a78bfa" stop-opacity=".18"/></linearGradient></defs>
      <rect width="144" height="144" rx="20" fill="url(#prism-bg)"/>
      <path d="M15 52H58" stroke="${color}" stroke-width="4" stroke-linecap="round" opacity=".82"/>
      <circle cx="${incomingX.toFixed(1)}" cy="52" r="4" fill="#fff"/>
      <path d="M72 22L91 72H53Z" fill="url(#prism-face)" stroke="#dbeafe" stroke-width="2"/>
      <path d="M88 43L130 30" stroke="#f472b6" stroke-width="3"/><path d="M90 52H132" stroke="#fbbf24" stroke-width="3"/><path d="M88 61L130 75" stroke="#22d3ee" stroke-width="3"/>
      <circle cx="${outgoingX.toFixed(1)}" cy="${(43 - phase * 11).toFixed(1)}" r="3" fill="#f472b6"/><circle cx="${outgoingX.toFixed(1)}" cy="52" r="3" fill="#fbbf24"/><circle cx="${outgoingX.toFixed(1)}" cy="${(61 + phase * 12).toFixed(1)}" r="3" fill="#22d3ee"/>
      <text x="72" y="99" text-anchor="middle" font-family="Arial,sans-serif" font-size="17" font-weight="800" fill="#f8fafc">${escapeSvg(label)}</text>
      ${targetText(view.target, "#cbd5e1", "Arial,sans-serif", view.frame)}`);
  }
};
