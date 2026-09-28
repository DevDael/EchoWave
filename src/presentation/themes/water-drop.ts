import type { Theme } from "./theme.js";
import { escapeSvg, metricLabel, metricPageLabel, statusColor, svg, targetText } from "./shared.js";

export const waterDropTheme: Theme = {
  render(view) {
    const color = view.status === "ready" || view.status === "pinging" ? "#38bdf8" : statusColor[view.status];
    const phase = ((view.frame ?? 0) % 24) / 24;
    const fall = Math.min(phase / 0.36, 1);
    const dropY = 17 + fall * 34;
    const ripple = Math.max(0, (phase - 0.28) / 0.72);
    const label = view.result && view.metricPage !== undefined ? metricPageLabel(view.result, view.metricPage) : metricLabel(view.status, view.result?.avgLatencyMs);
    const ripples = [0, .2, .4].map((offset) => {
      const progress = Math.max(0, Math.min(1, ripple - offset));
      return `<ellipse cx="72" cy="58" rx="${(7 + progress * 40).toFixed(1)}" ry="${(2 + progress * 10).toFixed(1)}" fill="none" stroke="${color}" stroke-width="${(3 - progress * 1.5).toFixed(1)}" opacity="${progress === 0 ? 0 : ((1 - progress) * .8).toFixed(2)}"/>`;
    }).join("");

    return svg(`<defs><linearGradient id="water-bg" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#071a31"/><stop offset=".58" stop-color="#073451"/><stop offset="1" stop-color="#03131f"/></linearGradient><linearGradient id="drop-fill" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#e0f2fe"/><stop offset=".35" stop-color="#38bdf8"/><stop offset="1" stop-color="#2563eb"/></linearGradient></defs>
      <rect width="144" height="144" rx="20" fill="url(#water-bg)"/>
      <path d="M72 ${(dropY - 9).toFixed(1)}C67 ${(dropY - 2).toFixed(1)} 65 ${(dropY + 1).toFixed(1)} 65 ${(dropY + 5).toFixed(1)}A7 7 0 0 0 79 ${(dropY + 5).toFixed(1)}C79 ${(dropY + 1).toFixed(1)} 77 ${(dropY - 2).toFixed(1)} 72 ${(dropY - 9).toFixed(1)}Z" fill="url(#drop-fill)" opacity="${phase > .68 ? .15 : 1}"/>
      <path d="M25 58H119" stroke="#38bdf8" stroke-width="2" opacity=".25"/>
      ${ripples}
      <text x="72" y="99" text-anchor="middle" font-family="Arial,sans-serif" font-size="17" font-weight="800" fill="#f0f9ff">${escapeSvg(label)}</text>
      ${targetText(view.target, "#bae6fd", "Arial,sans-serif", view.frame)}`);
  }
};
