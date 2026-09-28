import type { Theme } from "./theme.js";
import { escapeSvg, metricLabel, metricPageLabel, statusColor, svg, targetText } from "./shared.js";

export const synthwaveTheme: Theme = {
  render(view) {
    const color = statusColor[view.status];
    const phase = ((view.frame ?? 0) % 30) / 30;
    const glowRadius = 23 + Math.sin(phase * Math.PI * 2) * 2;
    const roadOffset = (-phase * 18).toFixed(1);
    const label = view.result && view.metricPage !== undefined ? metricPageLabel(view.result, view.metricPage) : metricLabel(view.status, view.result?.avgLatencyMs);

    return svg(`<defs>
      <linearGradient id="synthwave-sky" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#13052d"/><stop offset=".58" stop-color="#3b0764"/><stop offset="1" stop-color="#101029"/></linearGradient>
      <linearGradient id="synthwave-sun" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#fff36b"/><stop offset=".42" stop-color="#ff9d38"/><stop offset="1" stop-color="#ff2ba6"/></linearGradient>
      <linearGradient id="synthwave-horizon" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#22d3ee"/><stop offset=".5" stop-color="#f472b6"/><stop offset="1" stop-color="#22d3ee"/></linearGradient>
      <filter id="synthwave-glow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="2.6" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <clipPath id="synthwave-sun-clip"><circle cx="72" cy="37" r="23"/></clipPath>
      <clipPath id="synthwave-scene"><rect x="7" y="7" width="130" height="82" rx="14"/></clipPath>
    </defs>
    <rect width="144" height="144" rx="20" fill="#070415"/>
    <g clip-path="url(#synthwave-scene)">
      <rect x="7" y="7" width="130" height="82" fill="url(#synthwave-sky)"/>
      <circle cx="72" cy="37" r="${glowRadius.toFixed(1)}" fill="#ff2ba6" opacity=".22" filter="url(#synthwave-glow)"/>
      <circle cx="72" cy="37" r="23" fill="url(#synthwave-sun)" filter="url(#synthwave-glow)"/>
      <g clip-path="url(#synthwave-sun-clip)" stroke="#3b0764" stroke-width="3"><path d="M47 39H97M48 46H96M51 53H93"/></g>
      <path d="M7 65L31 43L48 57L60 45L74 63L92 42L113 60L137 45V72H7Z" fill="#110720" stroke="#c026d3" stroke-width="1.5"/>
      <path d="M7 65H137" stroke="url(#synthwave-horizon)" stroke-width="2.5" filter="url(#synthwave-glow)"/>
      <g fill="none" stroke="#a855f7" stroke-width="1" opacity=".82" stroke-dasharray="9 9" stroke-dashoffset="${roadOffset}"><path d="M7 72H137M7 79H137M7 87H137"/></g>
      <g fill="none" stroke="#22d3ee" stroke-width="1" opacity=".72"><path d="M72 65L14 89M72 65L39 89M72 65L58 89M72 65L86 89M72 65L105 89M72 65L130 89"/></g>
      <circle cx="72" cy="37" r="${(6 + phase * 22).toFixed(1)}" fill="none" stroke="${color}" stroke-width="2" opacity="${(1 - phase).toFixed(2)}"/>
    </g>
    <text x="72" y="101" text-anchor="middle" font-family="Arial,sans-serif" font-size="17" font-weight="900" fill="#f9a8d4" filter="url(#synthwave-glow)">${escapeSvg(label)}</text>
    <text x="72" y="101" text-anchor="middle" font-family="Arial,sans-serif" font-size="17" font-weight="900" fill="#fff">${escapeSvg(label)}</text>
    ${targetText(view.target, "#bffcff", "Arial,sans-serif", view.frame)}`);
  }
};
