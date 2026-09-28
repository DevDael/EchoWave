import type { Theme } from "./theme.js";
import { escapeSvg, metricLabel, metricPageLabel, statusColor, svg, targetText } from "./shared.js";

export const networkMeshTheme: Theme = {
  render(view) {
    const color = statusColor[view.status];
    const phase = ((view.frame ?? 0) % 20) / 20;
    const dashOffset = (-phase * 48).toFixed(1);
    const label = view.result && view.metricPage !== undefined ? metricPageLabel(view.result, view.metricPage) : metricLabel(view.status, view.result?.avgLatencyMs);
    const nodes = [[25, 51, 5], [47, 29, 4], [51, 70, 4], [75, 44, 5], [96, 27, 4], [99, 69, 4], [119, 49, 6]];

    return svg(`<defs><linearGradient id="mesh-bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#071e2a"/><stop offset=".55" stop-color="#0b2230"/><stop offset="1" stop-color="#061018"/></linearGradient></defs>
      <rect width="144" height="144" rx="20" fill="url(#mesh-bg)"/>
      <g fill="none" stroke="#285269" stroke-width="2" opacity=".82">
        <path d="M25 51L47 29 75 44 96 27 119 49 99 69 75 44 51 70 25 51"/>
        <path d="M47 29L51 70M96 27L99 69"/>
      </g>
      <path d="M25 51L47 29 75 44 96 27 119 49" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-dasharray="8 7" stroke-dashoffset="${dashOffset}"/>
      ${nodes.map(([x, y, radius], index) => `<circle cx="${x}" cy="${y}" r="${radius}" fill="${index === 0 || index === nodes.length - 1 ? color : "#7dd3fc"}" stroke="#dff8ff" stroke-width="1"/>`).join("")}
      <text x="72" y="99" text-anchor="middle" font-family="Arial,sans-serif" font-size="17" font-weight="800" fill="#ecfeff">${escapeSvg(label)}</text>
      ${targetText(view.target, "#a5d7e8", "Arial,sans-serif", view.frame)}`);
  }
};
