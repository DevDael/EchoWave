import type { PingResult } from "../domain/ping-result.js";
import type { JsonObject } from "@elgato/utils";
import { parseDisplayMode, type DisplayMode } from "./display-mode.js";
import { themes } from "../presentation/themes/catalog.js";

export { themes };
export type PingTheme = (typeof themes)[number];

export const languages = ["auto", "en", "es"] as const;
export type PingLanguage = (typeof languages)[number];

export interface PingSettings extends JsonObject {
  target: string;
  theme: PingTheme;
  language: PingLanguage;
  displayMode: DisplayMode;
  lastResult?: PingResult;
}

export function parseSettings(value: unknown): PingSettings {
  const candidate = isRecord(value) ? value : {};
  const target = typeof candidate.target === "string" ? candidate.target : "";
  const theme = parseTheme(candidate.theme);
  const language = languages.includes(candidate.language as PingLanguage) ? (candidate.language as PingLanguage) : "auto";
  const displayMode = parseDisplayMode(candidate.displayMode);
  const lastResult = isPingResult(candidate.lastResult) ? candidate.lastResult : undefined;
  return lastResult ? { target, theme, language, displayMode, lastResult } : { target, theme, language, displayMode };
}

/** Keep inspector changes made while a check is running, but never attach an old result to a new target. */
export function withResultIfTargetUnchanged(started: PingSettings, current: PingSettings, result: PingResult): PingSettings | undefined {
  if (started.target.trim() !== current.target.trim()) return undefined;
  return { ...current, lastResult: result };
}

function parseTheme(value: unknown): PingTheme {
  if (value === "aurora-light") return "aurora-dark";
  if (value === "glass-light") return "glass-dark";
  return themes.includes(value as PingTheme) ? (value as PingTheme) : "echo-wave";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isPingResult(value: unknown): value is PingResult {
  if (!isRecord(value)) return false;
  return typeof value.target === "string" && typeof value.host === "string" && typeof value.sent === "number" &&
    typeof value.received === "number" && typeof value.packetLoss === "number" && typeof value.timestamp === "string" &&
    ["ready", "pinging", "reachable", "degraded", "unreachable", "error"].includes(String(value.status));
}
