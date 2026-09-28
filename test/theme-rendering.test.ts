import assert from "node:assert/strict";
import test from "node:test";
import { renderKey } from "../src/presentation/renderer.js";
import { metricPageLabel, setPresentationLocale, targetLines } from "../src/presentation/themes/shared.js";
import { parseSettings, themes } from "../src/settings/ping-settings.js";

test("Echo Wave and automatic language are defaults and all eighteen themes render SVG data", () => {
  assert.equal(parseSettings({}).theme, "echo-wave");
  assert.equal(parseSettings({}).language, "auto");
  assert.equal(themes.length, 18);
  for (const theme of themes) {
    assert.match(renderKey(theme, "ready", "example.com"), /^data:image\/svg\+xml;base64,/);
  }
});

test("animated themes produce a different frame", () => {
  for (const theme of themes) {
    assert.notEqual(renderKey(theme, "pinging", "example.com", undefined, 0), renderKey(theme, "pinging", "example.com", undefined, 1));
  }
});

test("long URLs display their normalized host across two readable lines", () => {
  assert.deepEqual(targetLines("https://status.internal.example.com/health?q=1"), ["status.internal.", "example.com"]);
  assert.ok(targetLines("abcdefgh.abcdefghijklmnopqrstuvw").every((line) => line.length <= 16));
});

test("long normalized targets scroll through their complete host while animated", () => {
  const first = decodeSvg(renderKey("minimal", "pinging", "https://status.internal.example.com/health?q=1", undefined, 0));
  const later = decodeSvg(renderKey("minimal", "pinging", "https://status.internal.example.com/health?q=1", undefined, 6));
  assert.match(first, /id="target-marquee-clip"/);
  assert.match(first, /status\.internal\.example\.com/);
  assert.notEqual(first, later);
});

test("legacy light theme settings migrate to their dark replacements", () => {
  assert.equal(parseSettings({ theme: "aurora-light" }).theme, "aurora-dark");
  assert.equal(parseSettings({ theme: "glass-light" }).theme, "glass-dark");
});

test("URL labels use the larger 15 px treatment", () => {
  assert.match(decodeSvg(renderKey("terminal", "ready", "example.com")), /font-size="15"/);
});

test("Hexaza uses lightweight circular pulses without a visible wordmark", () => {
  const source = decodeSvg(renderKey("hexaza", "pinging", "example.com", undefined, 4));
  assert.doesNotMatch(source, />HEXAZA</);
  assert.match(source, /<image href="data:image\/(?:png|svg\+xml);base64,/);
  assert.doesNotMatch(source, /M38 5H106L139/);
  assert.match(source, /M59 11\.5H22\.5Q11\.5 11\.5 11\.5 22\.5/);
  assert.match(source, /M121\.5 132\.5Q132\.5 132\.5 132\.5 121\.5V85/);
  assert.ok((source.match(/<circle cx="72" cy="52"/g) ?? []).length >= 5);
});

test("every extended theme has its own visual signature", () => {
  const signatures = new Map([
    ["orbit", /<ellipse cx="72" cy="52" rx="42"/],
    ["network-mesh", /stroke-dashoffset=/],
    ["water-drop", /id="drop-fill"/],
    ["seismic", /id="seismic-bg"/],
    ["particle-burst", /id="particle-bg"/],
    ["prism", /id="prism-face"/],
    ["aurora-dark", /id="aurora-dark-bg"/],
    ["blueprint-light", /id="blueprint-light-grid"/],
    ["solar-light", /id="solar-core"/],
    ["glass-dark", /id="glass-dark-bg"/],
    ["neon", /id="neon-spectrum"/],
    ["synthwave", /id="synthwave-sun"/]
  ] as const);
  for (const [theme, signature] of signatures) {
    assert.match(decodeSvg(renderKey(theme, "pinging", "example.com", undefined, 3)), signature);
  }
});

test("Echo Wave is pulse-led and Packet guide stops before its arrow", () => {
  const echoWave = decodeSvg(renderKey("echo-wave", "pinging", "example.com", undefined, 4));
  const packet = decodeSvg(renderKey("packet", "pinging", "example.com", undefined, 4));
  assert.doesNotMatch(echoWave, /M15 55 C25/);
  assert.match(packet, /M22 62H103/);
  assert.doesNotMatch(packet, /M24 62h96/);
});

test("Sonar includes a richer field of echo points", () => {
  const sonar = decodeSvg(renderKey("sonar", "pinging", "example.com", undefined, 4));
  assert.ok((sonar.match(/<circle /g) ?? []).length >= 9);
});

test("key status and metric copy follows the selected presentation locale", () => {
  try {
    setPresentationLocale("es");
    assert.match(decodeSvg(renderKey("minimal", "pinging", "example.com")), />ENVIANDO</);
    assert.equal(metricPageLabel({
      target: "example.com",
      host: "example.com",
      sent: 4,
      received: 4,
      packetLoss: 0,
      avgLatencyMs: 12,
      timestamp: "2026-09-17T00:00:00.000Z",
      status: "reachable"
    }, 0), "PROM 12 ms");
  } finally {
    setPresentationLocale("en");
  }
});

test("a manual locale overrides the application presentation locale for one render", () => {
  setPresentationLocale("es");
  try {
    assert.match(decodeSvg(renderKey("minimal", "pinging", "example.com", undefined, 0, undefined, "en")), />PINGING</);
    assert.match(decodeSvg(renderKey("minimal", "pinging", "example.com")), />ENVIANDO</);
  } finally {
    setPresentationLocale("en");
  }
});

test("a stored result keeps its latency when rendered after a locale change", () => {
  const settings = parseSettings({
    target: "example.com",
    theme: "minimal",
    language: "es",
    lastResult: {
      target: "example.com",
      host: "example.com",
      sent: 4,
      received: 4,
      packetLoss: 0,
      avgLatencyMs: 14,
      timestamp: "2026-09-17T00:00:00.000Z",
      status: "reachable"
    }
  });
  assert.ok(settings.lastResult);
  assert.match(decodeSvg(renderKey(settings.theme, settings.lastResult.status, settings.lastResult.host, settings.lastResult, undefined, undefined, "es")), />14 ms</);
});

function decodeSvg(dataUri: string): string {
  return Buffer.from(dataUri.split(",", 2)[1] ?? "", "base64").toString("utf8");
}
