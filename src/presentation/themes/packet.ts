import type { Theme } from "./theme.js";
import { escapeSvg, metricLabel, metricPageLabel, statusColor, svg, targetText } from "./shared.js";

export const packetTheme: Theme = {
  render(view) {
    const color = statusColor[view.status];
    const progress = ((view.frame ?? 0) % 16) / 15;
    const packetX = view.status === "pinging" ? 18 + progress * 67 : 60;
    const label = view.result && view.metricPage !== undefined ? metricPageLabel(view.result, view.metricPage) : metricLabel(view.status, view.result?.avgLatencyMs);
    return svg(`<rect width="144" height="144" rx="20" fill="#172033"/>
      <path d="M22 62H103" stroke="#334155" stroke-width="4" stroke-linecap="round"/>
      <path d="M98 53l12 9-12 9" fill="none" stroke="#64748b" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="${packetX}" y="51" width="20" height="22" rx="4" fill="${color}"/>
      <path d="M${packetX + 4} 57h12M${packetX + 4} 63h8" stroke="#0f172a" stroke-width="2" stroke-linecap="round"/>
      <text x="72" y="98" text-anchor="middle" font-family="Arial,sans-serif" font-size="17" font-weight="700" fill="#f8fafc">${escapeSvg(label)}</text>
      ${targetText(view.target, "#a8b7ca", "Arial,sans-serif", view.frame)}`);
  }
};
