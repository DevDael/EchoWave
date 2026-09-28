import type { Theme } from "./theme.js";
import { escapeSvg, metricLabel, metricPageLabel, statusColor, svg, targetText } from "./shared.js";

export const minimalTheme: Theme = {
  render(view) {
    const color = statusColor[view.status];
    const progress = ((view.frame ?? 0) % 16) / 15;
    const lift = view.status === "pinging" ? Math.sin(progress * Math.PI) : 0.46;
    const positionY = 66 - lift * 30;
    const shadowWidth = 18 - lift * 9;
    const label = view.result && view.metricPage !== undefined ? metricPageLabel(view.result, view.metricPage) : metricLabel(view.status, view.result?.avgLatencyMs);
    return svg(`<rect width="144" height="144" rx="20" fill="#0f172a"/>
      <path d="M39 71H105" stroke="#27364b" stroke-width="3" stroke-linecap="round"/>
      <ellipse cx="72" cy="72" rx="${shadowWidth.toFixed(1)}" ry="4" fill="${color}" opacity="${(0.16 + (1 - lift) * 0.24).toFixed(2)}"/>
      <circle cx="72" cy="${positionY.toFixed(1)}" r="8" fill="${color}"/>
      <circle cx="69" cy="${(positionY - 3).toFixed(1)}" r="2.2" fill="#fff" opacity=".72"/>
      <text x="72" y="101" text-anchor="middle" font-family="Arial,sans-serif" font-size="17" font-weight="700" fill="#f8fafc">${escapeSvg(label)}</text>
      ${targetText(view.target, "#a8b7ca", "Arial,sans-serif", view.frame)}`);
  }
};
