import type { PingResult } from "../domain/ping-result.js";
import type { PingStatus } from "../domain/ping-status.js";
import type { PingTheme } from "../settings/ping-settings.js";
import type { PresentationLocale } from "./themes/shared.js";
import { withPresentationLocale } from "./themes/shared.js";
import { themeMap } from "./themes/catalog.js";

export function renderKey(theme: PingTheme, status: PingStatus, target?: string, result?: PingResult, frame?: number, metricPage?: number, locale?: PresentationLocale): string {
  const render = (): string => themeMap[theme].render({ status, target, result, frame, metricPage });
  return locale ? withPresentationLocale(locale, render) : render();
}
