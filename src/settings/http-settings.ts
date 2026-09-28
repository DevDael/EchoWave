import type { JsonObject } from "@elgato/utils";
import type { HttpResult } from "../domain/http-result.js";
import { parseDisplayMode, type DisplayMode } from "./display-mode.js";

export const httpThemes = ["echo-wave", "terminal", "neon", "hexaza", "sonar", "blueprint-light"] as const;
export type HttpTheme = (typeof httpThemes)[number];
export type HttpLanguage = "auto" | "en" | "es";

export interface HttpSettings extends JsonObject {
  target: string;
  theme: HttpTheme;
  language: HttpLanguage;
  displayMode: DisplayMode;
  lastResult?: HttpResult;
}

export function parseHttpSettings(value: unknown): HttpSettings {
  const candidate = isRecord(value) ? value : {};
  const target = typeof candidate.target === "string" ? candidate.target : "";
  const theme = httpThemes.includes(candidate.theme as HttpTheme) ? candidate.theme as HttpTheme : "echo-wave";
  const language = candidate.language === "en" || candidate.language === "es" ? candidate.language : "auto";
  const displayMode = parseDisplayMode(candidate.displayMode);
  const lastResult = isHttpResult(candidate.lastResult) && candidate.lastResult.target.trim() === target.trim() ? candidate.lastResult : undefined;
  return lastResult ? { target, theme, language, displayMode, lastResult } : { target, theme, language, displayMode };
}

export function withHttpResultIfTargetUnchanged(started: HttpSettings, current: HttpSettings, result: HttpResult): HttpSettings | undefined {
  if (started.target.trim() !== current.target.trim()) return undefined;
  return { ...current, lastResult: result };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isHttpResult(value: unknown): value is HttpResult {
  if (!isRecord(value)) return false;
  return typeof value.target === "string" && typeof value.url === "string" && typeof value.displayTarget === "string" &&
    typeof value.host === "string" && (value.protocol === "http" || value.protocol === "https") &&
    typeof value.timestamp === "string" && ["ok", "redirect", "http-error", "network-error"].includes(String(value.outcome)) &&
    (value.statusCode === undefined || (Number.isInteger(value.statusCode) && Number(value.statusCode) >= 100 && Number(value.statusCode) <= 599)) &&
    (value.latencyMs === undefined || (typeof value.latencyMs === "number" && Number.isFinite(value.latencyMs) && value.latencyMs >= 0));
}
