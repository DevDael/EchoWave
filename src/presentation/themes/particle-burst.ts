import type { Theme } from "./theme.js";
import { escapeSvg, metricLabel, metricPageLabel, statusColor, svg, targetText } from "./shared.js";

export const particleBurstTheme: Theme = {
  render(view) {
    const color = statusColor[view.status];
    const phase = ((view.frame ?? 0) % 18) / 18;
    const label = view.result && view.metricPage !== undefined ? metricPageLabel(view.result, view.metricPage) : metricLabel(view.status, view.result?.avgLatencyMs);
    const particles = Array.from({ length: 14 }, (_, index) => {
      const localProgress = (phase + (index % 3) * .12) % 1;
      const angle = index / 14 * Math.PI * 2 + (index % 2) * .17;
      const distance = 8 + localProgress * 42;
      const x = 72 + Math.cos(angle) * distance;
      const y = 52 + Math.sin(angle) * distance;
      const radius = 1.8 + (1 - localProgress) * 2.5;
      return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${radius.toFixed(1)}" fill="${index % 2 ? "#f0abfc" : color}" opacity="${((1 - localProgress) * .9).toFixed(2)}"/>`;
    }).join("");

    return svg(`<defs><radialGradient id="particle-bg"><stop stop-color="#3a164b"/><stop offset=".5" stop-color="#17112f"/><stop offset="1" stop-color="#070713"/></radialGradient></defs>
      <rect width="144" height="144" rx="20" fill="url(#particle-bg)"/>
      ${particles}
      <circle cx="72" cy="52" r="8" fill="${color}" opacity=".24"/>
      <circle cx="72" cy="52" r="4" fill="#fff"/>
      <text x="72" y="99" text-anchor="middle" font-family="Arial,sans-serif" font-size="17" font-weight="800" fill="#fdf4ff">${escapeSvg(label)}</text>
      ${targetText(view.target, "#e9d5ff", "Arial,sans-serif", view.frame)}`);
  }
};
