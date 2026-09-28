import type { Theme } from "./theme.js";
import { getHexazaBackground } from "./hexaza-background.js";
import { escapeSvg, metricLabel, metricPageLabel, statusColor, svg, targetText } from "./shared.js";

export const hexazaTheme: Theme = {
  render(view) {
    const background = getHexazaBackground();
    const accent = view.status === "ready" || view.status === "pinging" ? "#FECF07" : statusColor[view.status];
    const phase = (view.frame ?? 0) % 20;
    const label = view.result && view.metricPage !== undefined ? metricPageLabel(view.result, view.metricPage) : metricLabel(view.status, view.result?.avgLatencyMs);
    const rings = [0, 5, 10, 15].map((offset) => {
      const progress = ((phase + offset) % 20) / 20;
      const radius = 7 + progress * 42;
      const opacity = view.status === "pinging" ? Math.pow(1 - progress, 1.45) * 0.82 : 0.15;
      const width = 4 - progress * 2;
      return `<circle cx="72" cy="52" r="${radius.toFixed(1)}" fill="none" stroke="${accent}" stroke-width="${width.toFixed(1)}" opacity="${opacity.toFixed(2)}"/>`;
    }).join("");
    const pulseProgress = (phase % 5) / 5;
    const pointRadius = view.status === "pinging" ? 5 + Math.sin(pulseProgress * Math.PI) * 3.6 : 7;

    return svg(`<defs>
        <radialGradient id="hexaza-point"><stop stop-color="#fff"/><stop offset=".35" stop-color="#fff4a3"/><stop offset="1" stop-color="${accent}"/></radialGradient>
        <linearGradient id="hexaza-tl-h" gradientUnits="userSpaceOnUse" x1="59" y1="11.5" x2="11.5" y2="11.5"><stop stop-color="${accent}" stop-opacity="0"/><stop offset=".42" stop-color="${accent}" stop-opacity=".26"/><stop offset=".77" stop-color="${accent}" stop-opacity=".92"/><stop offset="1" stop-color="${accent}"/></linearGradient>
        <linearGradient id="hexaza-tl-v" gradientUnits="userSpaceOnUse" x1="11.5" y1="20.7" x2="11.5" y2="59"><stop stop-color="${accent}"/><stop offset=".47" stop-color="${accent}" stop-opacity=".88"/><stop offset=".76" stop-color="${accent}" stop-opacity=".30"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/></linearGradient>
        <linearGradient id="hexaza-br-h" gradientUnits="userSpaceOnUse" x1="85" y1="132.5" x2="123.3" y2="132.5"><stop stop-color="${accent}" stop-opacity="0"/><stop offset=".24" stop-color="${accent}" stop-opacity=".30"/><stop offset=".53" stop-color="${accent}" stop-opacity=".88"/><stop offset="1" stop-color="${accent}"/></linearGradient>
        <linearGradient id="hexaza-br-v" gradientUnits="userSpaceOnUse" x1="132.5" y1="123.3" x2="132.5" y2="85"><stop stop-color="${accent}"/><stop offset=".47" stop-color="${accent}" stop-opacity=".88"/><stop offset=".76" stop-color="${accent}" stop-opacity=".30"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/></linearGradient>
      </defs>
      <image href="${background}" width="144" height="144" preserveAspectRatio="xMidYMid slice"/>
      <g fill="none" stroke-width="2.6" stroke-linecap="butt" opacity=".92">
        <path d="M59 11.5H22.5Q11.5 11.5 11.5 22.5" stroke="url(#hexaza-tl-h)"/>
        <path d="M11.5 20.7V59" stroke="url(#hexaza-tl-v)"/>
        <path d="M85 132.5H123.3" stroke="url(#hexaza-br-h)"/>
        <path d="M121.5 132.5Q132.5 132.5 132.5 121.5V85" stroke="url(#hexaza-br-v)"/>
      </g>
      ${rings}
      <circle cx="72" cy="52" r="${(pointRadius + 5).toFixed(1)}" fill="${accent}" opacity=".16"/>
      <circle cx="72" cy="52" r="${pointRadius.toFixed(1)}" fill="url(#hexaza-point)"/>
      <text x="72" y="98" text-anchor="middle" font-family="Arial,sans-serif" font-size="17" font-weight="800" fill="#f8fafc">${escapeSvg(label)}</text>
      ${targetText(view.target, "#d6dee7", "Arial,sans-serif", view.frame)}`);
  }
};
