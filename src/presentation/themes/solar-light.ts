import type { Theme } from "./theme.js";
import { escapeSvg, metricLabel, metricPageLabel, statusColor, svg, targetText } from "./shared.js";

export const solarLightTheme: Theme = {
  render(view) {
    const color = view.status === "ready" || view.status === "pinging" ? "#f59e0b" : statusColor[view.status];
    const phase = ((view.frame ?? 0) % 24) / 24;
    const rotation = phase * 360;
    const glow = 15 + Math.sin(phase * Math.PI * 2) * 3;
    const label = view.result && view.metricPage !== undefined ? metricPageLabel(view.result, view.metricPage) : metricLabel(view.status, view.result?.avgLatencyMs);
    const rays = Array.from({ length: 12 }, (_, index) => `<path d="M72 17V26" transform="rotate(${index * 30} 72 52)"/>`).join("");

    return svg(`<defs><radialGradient id="solar-light-bg"><stop stop-color="#fffdf5"/><stop offset=".62" stop-color="#fff4cf"/><stop offset="1" stop-color="#fde7b0"/></radialGradient><radialGradient id="solar-core"><stop stop-color="#fff"/><stop offset=".35" stop-color="#fde68a"/><stop offset="1" stop-color="${color}"/></radialGradient></defs>
      <rect width="144" height="144" rx="20" fill="url(#solar-light-bg)"/>
      <g fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" transform="rotate(${rotation.toFixed(1)} 72 52)" opacity=".78">${rays}</g>
      <circle cx="72" cy="52" r="${glow.toFixed(1)}" fill="${color}" opacity=".14"/>
      <circle cx="72" cy="52" r="11" fill="url(#solar-core)" stroke="${color}" stroke-width="2"/>
      <text x="72" y="99" text-anchor="middle" font-family="Arial,sans-serif" font-size="17" font-weight="800" fill="#713f12">${escapeSvg(label)}</text>
      ${targetText(view.target, "#854d0e", "Arial,sans-serif", view.frame)}`);
  }
};
