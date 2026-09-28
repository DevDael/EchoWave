import type { Theme } from "./theme.js";
import { escapeSvg, metricLabel, metricPageLabel, statusColor, svg, targetText } from "./shared.js";

export const terminalTheme: Theme = {
  render(view) {
    const color = statusColor[view.status];
    const line = view.status === "pinging"
      ? `reply ${".".repeat(((view.frame ?? 0) % 3) + 1)}`
      : view.result && view.metricPage !== undefined
        ? metricPageLabel(view.result, view.metricPage)
        : metricLabel(view.status, view.result?.avgLatencyMs);
    return svg(`<rect width="144" height="144" rx="20" fill="#07120c"/>
      <rect x="13" y="17" width="118" height="78" rx="7" fill="#0d2215" stroke="#1e5130" stroke-width="2"/>
      <text x="24" y="42" font-family="Consolas,monospace" font-size="13" fill="#4ade80">&gt; ping</text>
      <text x="24" y="65" font-family="Consolas,monospace" font-size="15" font-weight="700" fill="${color}">${escapeSvg(line)}</text>
      <rect x="24" y="74" width="${view.status === "pinging" ? 22 + ((view.frame ?? 0) % 4) * 15 : 62}" height="3" fill="#4ade80"/>
      ${targetText(view.target, "#9ef0b6", "Consolas,monospace", view.frame)}`);
  }
};
