import type { Theme } from "./theme.js";
import { escapeSvg, metricLabel, metricPageLabel, statusColor, svg, targetText } from "./shared.js";

export const blueprintLightTheme: Theme = {
  render(view) {
    const color = view.status === "ready" || view.status === "pinging" ? "#2563eb" : statusColor[view.status];
    const phase = ((view.frame ?? 0) % 20) / 20;
    const label = view.result && view.metricPage !== undefined ? metricPageLabel(view.result, view.metricPage) : metricLabel(view.status, view.result?.avgLatencyMs);
    const grid = Array.from({ length: 8 }, (_, index) => {
      const position = 9 + index * 18;
      return `<path d="M${position} 0V144M0 ${position}H144"/>`;
    }).join("");

    return svg(`<rect width="144" height="144" rx="20" fill="#eef7ff"/>
      <g id="blueprint-light-grid" fill="none" stroke="#bdd9f2" stroke-width="1" opacity=".62">${grid}</g>
      <g fill="none" stroke="#7aaed6" stroke-width="2"><path d="M24 65L45 35 72 53 96 28 120 56"/><path d="M45 35L51 73 72 53 99 72 120 56"/></g>
      <path d="M24 65L45 35 72 53 96 28 120 56" fill="none" stroke="${color}" stroke-width="3" stroke-dasharray="7 7" stroke-dashoffset="${(-phase * 42).toFixed(1)}"/>
      ${[[24,65],[45,35],[51,73],[72,53],[96,28],[99,72],[120,56]].map(([x,y]) => `<circle cx="${x}" cy="${y}" r="4" fill="#fff" stroke="${color}" stroke-width="2"/>`).join("")}
      <text x="72" y="99" text-anchor="middle" font-family="Arial,sans-serif" font-size="17" font-weight="800" fill="#173b63">${escapeSvg(label)}</text>
      ${targetText(view.target, "#315a7d", "Arial,sans-serif", view.frame)}`);
  }
};
