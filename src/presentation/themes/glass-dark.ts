import type { Theme } from "./theme.js";
import { escapeSvg, metricLabel, metricPageLabel, statusColor, svg, targetText } from "./shared.js";

export const glassDarkTheme: Theme = {
  render(view) {
    const color = statusColor[view.status];
    const phase = ((view.frame ?? 0) % 24) / 24 * Math.PI * 2;
    const label = view.result && view.metricPage !== undefined ? metricPageLabel(view.result, view.metricPage) : metricLabel(view.status, view.result?.avgLatencyMs);
    const bubbles: readonly (readonly [number, number, number, number])[] = [[27,31,10,0],[112,28,14,1.3],[31,73,13,2.4],[111,70,9,3.2],[53,22,6,4.1]];
    const bubbleShapes = bubbles.map(([x,y,r,offset]) => {
      const bubbleY = y + Math.sin(phase + offset) * 5;
      return `<circle cx="${x}" cy="${bubbleY.toFixed(1)}" r="${r}" fill="#dbeafe" fill-opacity=".08" stroke="#bae6fd" stroke-opacity=".28" stroke-width="1.5"/>`;
    }).join("");

    return svg(`<defs><linearGradient id="glass-dark-bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#182433"/><stop offset=".5" stop-color="#09131f"/><stop offset="1" stop-color="#11152a"/></linearGradient><radialGradient id="glass-dark-core"><stop stop-color="#fff" stop-opacity=".95"/><stop offset=".28" stop-color="${color}" stop-opacity=".78"/><stop offset="1" stop-color="${color}" stop-opacity=".12"/></radialGradient><filter id="glass-dark-glow"><feGaussianBlur stdDeviation="2"/></filter></defs>
      <rect width="144" height="144" rx="20" fill="url(#glass-dark-bg)"/>
      ${bubbleShapes}
      <circle cx="72" cy="52" r="23" fill="${color}" opacity=".12" filter="url(#glass-dark-glow)"/>
      <circle cx="72" cy="52" r="21" fill="#dbeafe" fill-opacity=".08" stroke="#e0f2fe" stroke-opacity=".56" stroke-width="2"/>
      <circle cx="72" cy="52" r="9" fill="url(#glass-dark-core)" stroke="${color}" stroke-width="2"/>
      <path d="M59 43Q65 35 73 34" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".64"/>
      <text x="72" y="99" text-anchor="middle" font-family="Arial,sans-serif" font-size="17" font-weight="800" fill="#f8fafc">${escapeSvg(label)}</text>
      ${targetText(view.target, "#c7d7ea", "Arial,sans-serif", view.frame)}`);
  }
};
