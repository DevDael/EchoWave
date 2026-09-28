import type { Theme } from "./theme.js";
import { escapeSvg, metricLabel, metricPageLabel, statusColor, svg, targetText } from "./shared.js";

export const auroraDarkTheme: Theme = {
  render(view) {
    const color = statusColor[view.status];
    const phase = ((view.frame ?? 0) % 24) / 24 * Math.PI * 2;
    const drift = Math.sin(phase) * 7;
    const counterDrift = Math.cos(phase) * 6;
    const label = view.result && view.metricPage !== undefined ? metricPageLabel(view.result, view.metricPage) : metricLabel(view.status, view.result?.avgLatencyMs);

    return svg(`<defs>
        <radialGradient id="aurora-dark-bg" cx="50%" cy="25%" r="85%"><stop stop-color="#101f38"/><stop offset=".55" stop-color="#070d1a"/><stop offset="1" stop-color="#02040a"/></radialGradient>
        <linearGradient id="aurora-dark-a" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#22d3ee" stop-opacity=".06"/><stop offset=".48" stop-color="#22d3ee" stop-opacity=".92"/><stop offset="1" stop-color="#a78bfa" stop-opacity=".08"/></linearGradient>
        <linearGradient id="aurora-dark-b" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#e879f9" stop-opacity=".06"/><stop offset=".52" stop-color="#8b5cf6" stop-opacity=".8"/><stop offset="1" stop-color="#2dd4bf" stop-opacity=".08"/></linearGradient>
        <filter id="aurora-dark-glow"><feGaussianBlur stdDeviation="2.2" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <rect width="144" height="144" rx="20" fill="url(#aurora-dark-bg)"/>
      <g filter="url(#aurora-dark-glow)"><path d="M-8 ${(44 + drift).toFixed(1)}C24 ${(20 + counterDrift).toFixed(1)} 47 ${(77 + drift).toFixed(1)} 76 ${(41 - drift).toFixed(1)}S126 ${(35 + counterDrift).toFixed(1)} 153 ${(58 - drift).toFixed(1)}" fill="none" stroke="url(#aurora-dark-a)" stroke-width="11" stroke-linecap="round"/>
      <path d="M-5 ${(61 - counterDrift).toFixed(1)}C31 ${(84 - drift).toFixed(1)} 50 ${(29 + counterDrift).toFixed(1)} 84 ${(61 + drift).toFixed(1)}S126 ${(78 - drift).toFixed(1)} 149 ${(48 + counterDrift).toFixed(1)}" fill="none" stroke="url(#aurora-dark-b)" stroke-width="7" stroke-linecap="round"/></g>
      <circle cx="72" cy="52" r="8" fill="#08111f" stroke="${color}" stroke-width="3"/>
      <circle cx="72" cy="52" r="3" fill="#fff"/>
      <text x="72" y="99" text-anchor="middle" font-family="Arial,sans-serif" font-size="17" font-weight="800" fill="#f8fafc">${escapeSvg(label)}</text>
      ${targetText(view.target, "#c8d8ee", "Arial,sans-serif", view.frame)}`);
  }
};
