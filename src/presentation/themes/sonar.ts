import type { Theme } from "./theme.js";
import { escapeSvg, metricLabel, metricPageLabel, statusColor, svg, targetText } from "./shared.js";

export const sonarTheme: Theme = {
  render(view) {
    const color = view.status === "ready" || view.status === "pinging" ? "#4ade80" : statusColor[view.status];
    const phase = (view.frame ?? 0) % 16;
    const angle = phase * 22.5 - 90;
    const radians = angle * Math.PI / 180;
    const x = 72 + Math.cos(radians) * 39;
    const y = 53 + Math.sin(radians) * 39;
    const label = view.result && view.metricPage !== undefined ? metricPageLabel(view.result, view.metricPage) : metricLabel(view.status, view.result?.avgLatencyMs);
    const blips = [
      [101, 39, 4, 1],
      [47, 34, 3, .82],
      [42, 65, 2.5, .68],
      [87, 76, 3, .76],
      [64, 43, 2, .62],
      [111, 62, 2.5, .72]
    ].map(([blipX, blipY, radius, opacity]) => `<circle cx="${blipX}" cy="${blipY}" r="${radius}" fill="${color}" opacity="${opacity}"/>`).join("");

    return svg(`<defs><radialGradient id="sonar-bg"><stop stop-color="#102d22"/><stop offset="1" stop-color="#020b08"/></radialGradient></defs>
      <rect width="144" height="144" rx="20" fill="url(#sonar-bg)"/>
      <g fill="none" stroke="#225e44" stroke-width="2"><circle cx="72" cy="53" r="14"/><circle cx="72" cy="53" r="28"/><circle cx="72" cy="53" r="42"/></g>
      <path d="M72 53 L${x.toFixed(1)} ${y.toFixed(1)} A42 42 0 0 0 ${(72 + Math.cos(radians - .65) * 42).toFixed(1)} ${(53 + Math.sin(radians - .65) * 42).toFixed(1)} Z" fill="${color}" opacity="${view.status === "pinging" ? ".28" : ".10"}"/>
      <line x1="72" y1="53" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="${color}" stroke-width="3" stroke-linecap="round"/>
      ${blips}
      <text x="72" y="99" text-anchor="middle" font-family="Arial,sans-serif" font-size="17" font-weight="800" fill="#ecfdf5">${escapeSvg(label)}</text>
      ${targetText(view.target, "#a7d7bd", "Arial,sans-serif", view.frame)}`);
  }
};
