import type { Theme } from "./theme.js";
import { escapeSvg, metricLabel, metricPageLabel, statusColor, svg, targetText } from "./shared.js";

export const seismicTheme: Theme = {
  render(view) {
    const color = statusColor[view.status];
    const phase = ((view.frame ?? 0) % 20) / 20;
    const intensity = Math.min(5, Math.max(2, (view.result?.avgLatencyMs ?? 70) / 35));
    const label = view.result && view.metricPage !== undefined ? metricPageLabel(view.result, view.metricPage) : metricLabel(view.status, view.result?.avgLatencyMs);
    const waves = [0, .28, .56].map((offset) => {
      const progress = (phase + offset) % 1;
      const radius = 9 + progress * 39;
      return `<path d="${seismicRing(radius, phase, intensity)}" fill="none" stroke="${color}" stroke-width="${(3.5 - progress * 1.8).toFixed(1)}" opacity="${((1 - progress) * .76).toFixed(2)}"/>`;
    }).join("");

    return svg(`<defs><radialGradient id="seismic-bg"><stop stop-color="#332019"/><stop offset=".58" stop-color="#1d1412"/><stop offset="1" stop-color="#0b0808"/></radialGradient></defs>
      <rect width="144" height="144" rx="20" fill="url(#seismic-bg)"/>
      <g stroke="#70402f" stroke-width="1" opacity=".35"><path d="M20 52H124"/><path d="M72 13V91"/></g>
      ${waves}
      <circle cx="72" cy="52" r="5" fill="${color}"/>
      <text x="72" y="99" text-anchor="middle" font-family="Arial,sans-serif" font-size="17" font-weight="800" fill="#fff7ed">${escapeSvg(label)}</text>
      ${targetText(view.target, "#fed7aa", "Arial,sans-serif", view.frame)}`);
  }
};

function seismicRing(radius: number, phase: number, amplitude: number): string {
  const points = Array.from({ length: 37 }, (_, index) => {
    const angle = index / 36 * Math.PI * 2;
    const disturbedRadius = radius + Math.sin(angle * 8 + phase * Math.PI * 2) * amplitude;
    return `${(72 + Math.cos(angle) * disturbedRadius).toFixed(1)} ${(52 + Math.sin(angle) * disturbedRadius).toFixed(1)}`;
  });
  return `M${points[0]}L${points.slice(1).join(" ")}Z`;
}
