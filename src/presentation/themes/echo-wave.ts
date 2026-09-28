import type { Theme } from "./theme.js";
import { escapeSvg, metricLabel, metricPageLabel, statusColor, svg, targetText } from "./shared.js";

export const echoWaveTheme: Theme = {
  render(view) {
    const color = statusColor[view.status];
    const phase = (view.frame ?? 0) % 20;
    const label = view.result && view.metricPage !== undefined
      ? metricPageLabel(view.result, view.metricPage)
      : metricLabel(view.status, view.result?.avgLatencyMs);
    const palette = ["#22d3ee", "#38bdf8", "#60a5fa", "#a78bfa"];
    const rings = [0, 5, 10, 15].map((offset, index) => {
      const progress = ((phase + offset) % 20) / 20;
      const radius = 7 + progress * 42;
      const opacity = view.status === "pinging" ? Math.pow(1 - progress, 1.35) * 0.78 : 0.16;
      const width = 4.2 - progress * 2.2;
      return `<circle cx="72" cy="52" r="${radius.toFixed(1)}" fill="none" stroke="${palette[index]}" stroke-width="${width.toFixed(1)}" opacity="${opacity.toFixed(2)}"/>`;
    }).join("");
    const pulseProgress = (phase % 5) / 5;
    const pointRadius = view.status === "pinging" ? 5 + Math.sin(pulseProgress * Math.PI) * 4 : 7;

    return svg(`<defs>
        <radialGradient id="echo-bg" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#152a54"/><stop offset=".55" stop-color="#08152d"/><stop offset="1" stop-color="#030817"/></radialGradient>
        <radialGradient id="echo-point"><stop stop-color="#fff"/><stop offset=".38" stop-color="#67e8f9"/><stop offset="1" stop-color="${color}"/></radialGradient>
      </defs>
      <rect width="144" height="144" rx="20" fill="url(#echo-bg)"/>
      ${rings}
      <circle cx="72" cy="52" r="${(pointRadius + 5).toFixed(1)}" fill="${color}" opacity=".16"/>
      <circle cx="72" cy="52" r="${pointRadius.toFixed(1)}" fill="url(#echo-point)"/>
      <text x="72" y="99" text-anchor="middle" font-family="Arial,sans-serif" font-size="17" font-weight="800" fill="#f4fbff">${escapeSvg(label)}</text>
      ${targetText(view.target, "#b8d5ee", "Arial,sans-serif", view.frame)}`);
  }
};
