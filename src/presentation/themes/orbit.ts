import type { Theme } from "./theme.js";
import { escapeSvg, metricLabel, metricPageLabel, statusColor, svg, targetText } from "./shared.js";

export const orbitTheme: Theme = {
  render(view) {
    const color = statusColor[view.status];
    const phase = ((view.frame ?? 0) % 24) / 24;
    const angle = phase * Math.PI * 2 - Math.PI / 2;
    const packetX = 72 + Math.cos(angle) * 39;
    const packetY = 52 + Math.sin(angle) * 23;
    const replyX = 72 + Math.cos(angle + Math.PI) * 39;
    const replyY = 52 + Math.sin(angle + Math.PI) * 23;
    const label = view.result && view.metricPage !== undefined ? metricPageLabel(view.result, view.metricPage) : metricLabel(view.status, view.result?.avgLatencyMs);

    return svg(`<defs><radialGradient id="orbit-bg"><stop stop-color="#2b1d52"/><stop offset=".55" stop-color="#10162e"/><stop offset="1" stop-color="#050814"/></radialGradient></defs>
      <rect width="144" height="144" rx="20" fill="url(#orbit-bg)"/>
      <ellipse cx="72" cy="52" rx="42" ry="26" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="4 5" opacity=".62"/>
      <ellipse cx="72" cy="52" rx="29" ry="17" fill="none" stroke="#334155" stroke-width="1.5"/>
      <circle cx="72" cy="52" r="10" fill="#111c3d" stroke="${color}" stroke-width="3"/>
      <circle cx="72" cy="52" r="3" fill="#fff"/>
      <circle cx="${packetX.toFixed(1)}" cy="${packetY.toFixed(1)}" r="5" fill="${color}"/>
      <circle cx="${replyX.toFixed(1)}" cy="${replyY.toFixed(1)}" r="3" fill="#c4b5fd" opacity=".75"/>
      <text x="72" y="99" text-anchor="middle" font-family="Arial,sans-serif" font-size="17" font-weight="800" fill="#f5f3ff">${escapeSvg(label)}</text>
      ${targetText(view.target, "#c4b5fd", "Arial,sans-serif", view.frame)}`);
  }
};
