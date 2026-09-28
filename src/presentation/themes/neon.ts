import type { Theme } from "./theme.js";
import { escapeSvg, metricLabel, metricPageLabel, statusColor, svg, targetText } from "./shared.js";

export const neonTheme: Theme = {
  render(view) {
    const stateColor = statusColor[view.status];
    const phase = ((view.frame ?? 0) % 28) / 28;
    const echoPhase = (phase + 0.48) % 1;
    const pulse = 7 + Math.sin(phase * Math.PI * 2) * 2.2;
    const sparkX = 72 + Math.cos(phase * Math.PI * 2) * 34;
    const sparkY = 49 + Math.sin(phase * Math.PI * 2) * 24;
    const label = view.result && view.metricPage !== undefined ? metricPageLabel(view.result, view.metricPage) : metricLabel(view.status, view.result?.avgLatencyMs);

    return svg(`<defs>
      <radialGradient id="neon-bg" cx="50%" cy="34%" r="78%"><stop stop-color="#18052c"/><stop offset=".5" stop-color="#030816"/><stop offset="1" stop-color="#010208"/></radialGradient>
      <linearGradient id="neon-spectrum" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#22d3ee"/><stop offset=".42" stop-color="#67e8f9"/><stop offset=".58" stop-color="#f0abfc"/><stop offset="1" stop-color="#ff2bd6"/></linearGradient>
      <linearGradient id="neon-border" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#22d3ee"/><stop offset=".48" stop-color="#7c3aed"/><stop offset="1" stop-color="#ff2bd6"/></linearGradient>
      <filter id="neon-soft-glow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="5"/></filter>
      <filter id="neon-hard-glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.8" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <clipPath id="neon-field"><rect x="8" y="7" width="128" height="81" rx="14"/></clipPath>
    </defs>
    <rect width="144" height="144" rx="20" fill="url(#neon-bg)"/>
    <rect x="5" y="5" width="134" height="134" rx="17" fill="none" stroke="url(#neon-border)" stroke-width="5" opacity=".22" filter="url(#neon-soft-glow)"/>
    <rect x="6.5" y="6.5" width="131" height="131" rx="16" fill="none" stroke="url(#neon-border)" stroke-width="1.5" opacity=".82"/>
    <g clip-path="url(#neon-field)">
      <path d="M14 51H39L47 36L57 67L67 42L77 59L87 48H130" fill="none" stroke="url(#neon-spectrum)" stroke-width="9" opacity=".34" filter="url(#neon-soft-glow)"/>
      <path d="M14 51H39L47 36L57 67L67 42L77 59L87 48H130" fill="none" stroke="url(#neon-spectrum)" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="18 8" stroke-dashoffset="${(-phase * 52).toFixed(1)}" filter="url(#neon-hard-glow)"/>
      <circle cx="72" cy="49" r="${(11 + phase * 32).toFixed(1)}" fill="none" stroke="#22d3ee" stroke-width="2.2" opacity="${(1 - phase).toFixed(2)}" filter="url(#neon-hard-glow)"/>
      <circle cx="72" cy="49" r="${(9 + echoPhase * 34).toFixed(1)}" fill="none" stroke="#ff2bd6" stroke-width="2.2" opacity="${(1 - echoPhase).toFixed(2)}" filter="url(#neon-hard-glow)"/>
      <circle cx="${sparkX.toFixed(1)}" cy="${sparkY.toFixed(1)}" r="2.5" fill="#fff" stroke="#22d3ee" stroke-width="1.5" filter="url(#neon-hard-glow)"/>
    </g>
    <circle cx="72" cy="49" r="17" fill="${stateColor}" opacity=".22" filter="url(#neon-soft-glow)"/>
    <circle cx="72" cy="49" r="${pulse.toFixed(1)}" fill="#050914" stroke="${stateColor}" stroke-width="3" filter="url(#neon-hard-glow)"/>
    <circle cx="72" cy="49" r="3" fill="#fff"/>
    <text x="72" y="99" text-anchor="middle" font-family="Arial,sans-serif" font-size="17" font-weight="900" fill="#ff2bd6" opacity=".62" filter="url(#neon-soft-glow)">${escapeSvg(label)}</text>
    <text x="72" y="99" text-anchor="middle" font-family="Arial,sans-serif" font-size="17" font-weight="900" fill="#fff">${escapeSvg(label)}</text>
    ${targetText(view.target, "#a5fbff", "Arial,sans-serif", view.frame)}`);
  }
};
