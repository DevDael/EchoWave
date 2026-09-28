import type { Theme } from "./theme.js";
import { echoWaveTheme } from "./echo-wave.js";
import { minimalTheme } from "./minimal.js";
import { packetTheme } from "./packet.js";
import { sonarTheme } from "./sonar.js";
import { terminalTheme } from "./terminal.js";
import { orbitTheme } from "./orbit.js";
import { networkMeshTheme } from "./network-mesh.js";
import { waterDropTheme } from "./water-drop.js";
import { seismicTheme } from "./seismic.js";
import { particleBurstTheme } from "./particle-burst.js";
import { prismTheme } from "./prism.js";
import { auroraDarkTheme } from "./aurora-dark.js";
import { blueprintLightTheme } from "./blueprint-light.js";
import { solarLightTheme } from "./solar-light.js";
import { glassDarkTheme } from "./glass-dark.js";
import { neonTheme } from "./neon.js";
import { synthwaveTheme } from "./synthwave.js";

export const themes = [
  "echo-wave", "minimal", "packet", "sonar", "terminal", "orbit",
  "network-mesh", "water-drop", "seismic", "particle-burst", "prism",
  "aurora-dark", "blueprint-light", "solar-light", "glass-dark",
  "neon", "synthwave"
] as const;

export const themeMap: Record<(typeof themes)[number], Theme> = {
  "echo-wave": echoWaveTheme,
  minimal: minimalTheme,
  packet: packetTheme,
  sonar: sonarTheme,
  terminal: terminalTheme,
  orbit: orbitTheme,
  "network-mesh": networkMeshTheme,
  "water-drop": waterDropTheme,
  seismic: seismicTheme,
  "particle-burst": particleBurstTheme,
  prism: prismTheme,
  "aurora-dark": auroraDarkTheme,
  "blueprint-light": blueprintLightTheme,
  "solar-light": solarLightTheme,
  "glass-dark": glassDarkTheme,
  neon: neonTheme,
  synthwave: synthwaveTheme
};

export const animationFrameMs: Record<(typeof themes)[number], number> = {
  "aurora-dark": 120,
  "blueprint-light": 140,
  "echo-wave": 100,
  "glass-dark": 120,
  minimal: 120,
  neon: 120,
  "network-mesh": 150,
  orbit: 120,
  packet: 120,
  "particle-burst": 100,
  prism: 120,
  seismic: 120,
  "solar-light": 120,
  sonar: 180,
  synthwave: 120,
  terminal: 180,
  "water-drop": 110
};
