import streamDeck, { action, SingletonAction, type DidReceiveSettingsEvent, type KeyDownEvent, type KeyUpEvent, type SendToPluginEvent, type WillAppearEvent, type WillDisappearEvent } from "@elgato/streamdeck";
import type { JsonValue } from "@elgato/utils";
import { HttpService } from "../application/http-service.js";
import { normalizeHttpTarget } from "../domain/http-target.js";
import { FetchHttpExecutor } from "../infrastructure/http/fetch-http-executor.js";
import { pluginUuid } from "../plugin-identity.js";
import { renderHttpIconTitle } from "../presentation/icon-title.js";
import { httpMetricPageCount, renderHttpKey, type HttpKeyView, type HttpLocale } from "../presentation/http-renderer.js";
import { targetNeedsMarquee } from "../presentation/themes/shared.js";
import { parseHttpSettings, withHttpResultIfTargetUnchanged, type HttpLanguage, type HttpSettings } from "../settings/http-settings.js";

const longPressMs = 650;
const metricPageMs = 1_650;
const frameMs = 150;
const iconPulseFrameMs = 350;
const resultFrameMs = 250;
type Key = KeyDownEvent<HttpSettings>["action"];

interface PressState { timer: NodeJS.Timeout; showingResult: boolean }

@action({ UUID: `${pluginUuid}.http` })
export class HttpAction extends SingletonAction<HttpSettings> {
  private readonly service = new HttpService(new FetchHttpExecutor());
  private readonly presses = new Map<string, PressState>();
  private readonly animations = new Map<string, NodeJS.Timeout>();
  private readonly running = new Set<string>();

  override async onWillAppear(ev: WillAppearEvent<HttpSettings>): Promise<void> {
    if (ev.action.isKey()) await this.renderStoredOrReady(ev.action, parseHttpSettings(ev.payload.settings));
  }

  override async onDidReceiveSettings(ev: DidReceiveSettingsEvent<HttpSettings>): Promise<void> {
    if (!ev.action.isKey() || this.running.has(ev.action.id)) return;
    this.stopAnimation(ev.action.id);
    await this.renderStoredOrReady(ev.action, parseHttpSettings(ev.payload.settings));
  }

  override async onSendToPlugin(ev: SendToPluginEvent<JsonValue, HttpSettings>): Promise<void> {
    const request = ev.payload;
    if (!isValidationRequest(request)) return;
    let message = "";
    try { normalizeHttpTarget(request.target); }
    catch { message = locale(request.language ?? "auto") === "es" ? "Introduce una URL completa http:// o https://, sin credenciales ni fragmento." : "Enter a complete http:// or https:// URL without credentials or a fragment."; }
    await streamDeck.ui.sendToPropertyInspector({ type: "validation", message });
  }

  override onKeyDown(ev: KeyDownEvent<HttpSettings>): void {
    const key = ev.action.id;
    if (this.running.has(key)) return;
    this.stopAnimation(key);
    const press: PressState = { timer: setTimeout(() => {
      press.showingResult = true;
      void this.render(ev.action, parseHttpSettings(ev.payload.settings), "result", undefined, 0);
    }, longPressMs), showingResult: false };
    this.presses.set(key, press);
  }

  override async onKeyUp(ev: KeyUpEvent<HttpSettings>): Promise<void> {
    const key = ev.action.id;
    const press = this.presses.get(key);
    this.presses.delete(key);
    if (!press) return;
    clearTimeout(press.timer);
    if (press.showingResult) { this.startCarousel(ev.action, parseHttpSettings(ev.payload.settings)); return; }
    if (!this.running.has(key)) await this.runCheck(ev.action, parseHttpSettings(ev.payload.settings));
  }

  override onWillDisappear(ev: WillDisappearEvent<HttpSettings>): void {
    const press = this.presses.get(ev.action.id);
    if (press) clearTimeout(press.timer);
    this.presses.delete(ev.action.id);
    this.stopAnimation(ev.action.id);
  }

  private async runCheck(key: Key, settings: HttpSettings): Promise<void> {
    this.running.add(key.id);
    try {
      try { normalizeHttpTarget(settings.target); }
      catch {
        await this.render(key, settings, "error");
        await key.showAlert();
        return;
      }
      let active = true;
      let frame = 0;
      const animation = (async () => {
        while (active) {
          await this.render(key, settings, "checking", frame++);
          await new Promise((resolve) => setTimeout(resolve, settings.displayMode === "custom-icon" ? iconPulseFrameMs : settings.theme === "hexaza" ? 100 : frameMs));
        }
      })();
      let result;
      const started = Date.now();
      try {
        result = await this.service.run(settings.target);
        const remaining = Math.max(0, 750 - (Date.now() - started));
        if (remaining) await new Promise((resolve) => setTimeout(resolve, remaining));
      }
      finally { active = false; await animation; }

      const current = parseHttpSettings(await key.getSettings());
      const next = withHttpResultIfTargetUnchanged(settings, current, result);
      if (!next) { await this.renderStoredOrReady(key, current); return; }
      await key.setSettings(next);
      if (next.displayMode !== settings.displayMode) await this.prepareDisplay(key, next);
      if (targetNeedsMarquee(result.displayTarget) || (next.displayMode === "custom-icon" && result.displayTarget.length > 12)) this.startMarquee(key, next);
      else await this.renderStoredOrReady(key, next);
      if (result.outcome === "http-error" || result.outcome === "network-error") await key.showAlert();
    } catch (error) {
      streamDeck.logger.error("HTTP action failed:", error);
      await this.render(key, settings, "error");
      await key.showAlert();
    } finally { this.running.delete(key.id); }
  }

  private async renderStoredOrReady(key: Key, settings: HttpSettings): Promise<void> {
    await this.prepareDisplay(key, settings);
    await this.render(key, settings, settings.lastResult ? "result" : "ready");
  }

  private async prepareDisplay(key: Key, settings: HttpSettings): Promise<void> {
    if (settings.displayMode === "custom-icon") await key.setImage();
    else await key.setTitle("");
  }

  private async render(key: Key, settings: HttpSettings, status: HttpKeyView["status"], frame?: number, metricPage?: number): Promise<void> {
    let displayTarget = settings.target;
    if (status === "checking" || status === "ready") {
      try { displayTarget = normalizeHttpTarget(settings.target).displayTarget; } catch { /* Validation state is rendered separately. */ }
    }
    const view = { theme: settings.theme, status, target: displayTarget, result: settings.lastResult, frame, metricPage, locale: locale(settings.language) };
    if (settings.displayMode === "custom-icon") await key.setTitle(renderHttpIconTitle(view));
    else await key.setImage(renderHttpKey(view));
  }

  private startCarousel(key: Key, settings: HttpSettings): void {
    this.stopAnimation(key.id);
    if (!settings.lastResult) { void this.renderStoredOrReady(key, settings); return; }
    const started = Date.now();
    let frame = 0;
    const next = () => {
      const page = Math.floor((Date.now() - started) / metricPageMs);
      if (page >= httpMetricPageCount) { this.animations.delete(key.id); void this.renderStoredOrReady(key, settings); return; }
      void this.render(key, settings, "result", frame++, page);
      this.animations.set(key.id, setTimeout(next, resultFrameMs));
    };
    next();
  }

  private startMarquee(key: Key, settings: HttpSettings): void {
    this.stopAnimation(key.id);
    let frame = 0;
    const next = () => {
      if (frame >= 24) { this.animations.delete(key.id); void this.renderStoredOrReady(key, settings); return; }
      void this.render(key, settings, "result", frame++);
      this.animations.set(key.id, setTimeout(next, resultFrameMs));
    };
    next();
  }

  private stopAnimation(key: string): void {
    const timer = this.animations.get(key);
    if (timer) clearTimeout(timer);
    this.animations.delete(key);
  }
}

function locale(value: HttpLanguage): HttpLocale {
  if (value !== "auto") return value;
  return streamDeck.info.application.language === "es" ? "es" : "en";
}

function isValidationRequest(value: unknown): value is { type: "validate"; target: string; language?: HttpLanguage } {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return candidate.type === "validate" && typeof candidate.target === "string" &&
    (candidate.language === undefined || candidate.language === "auto" || candidate.language === "en" || candidate.language === "es");
}
