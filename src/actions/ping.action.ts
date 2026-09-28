import streamDeck, { action, SingletonAction, type DidReceiveSettingsEvent, type KeyDownEvent, type KeyUpEvent, type SendToPluginEvent, type WillAppearEvent, type WillDisappearEvent } from "@elgato/streamdeck";
import type { JsonValue } from "@elgato/utils";
import { PingService } from "../application/ping-service.js";
import { normalizeTarget, TargetValidationError } from "../domain/target.js";
import type { PingResult } from "../domain/ping-result.js";
import type { PingStatus } from "../domain/ping-status.js";
import { WindowsPingExecutor } from "../infrastructure/ping/windows-ping-executor.js";
import { pluginUuid } from "../plugin-identity.js";
import { renderPingIconTitle } from "../presentation/icon-title.js";
import { renderKey } from "../presentation/renderer.js";
import { animationFrameMs } from "../presentation/themes/catalog.js";
import { keyCopy, metricPageCount, targetNeedsMarquee, type PresentationLocale } from "../presentation/themes/shared.js";
import { parseSettings, withResultIfTargetUnchanged, type PingLanguage, type PingSettings } from "../settings/ping-settings.js";

const longPressMs = 650;
const metricPageMs = 1_650;
const displayFrameMs = 250;
const iconPulseFrameMs = 350;
const resultMarqueeMs = 6_000;
interface PressState {
  timer: NodeJS.Timeout;
  showingResult: boolean;
  metricPage: number;
}

interface ValidationRequest {
  type: "validate";
  target: string;
  language?: PingLanguage;
}

@action({ UUID: `${pluginUuid}.ping` })
export class PingAction extends SingletonAction<PingSettings> {
  private readonly service = new PingService(new WindowsPingExecutor());
  private readonly presses = new Map<string, PressState>();
  private readonly displayAnimations = new Map<string, NodeJS.Timeout>();
  private readonly running = new Set<string>();

  override async onWillAppear(ev: WillAppearEvent<PingSettings>): Promise<void> {
    if (!ev.action.isKey()) return;
    await this.renderStoredOrReady(ev.action, parseSettings(ev.payload.settings));
  }

  override async onDidReceiveSettings(ev: DidReceiveSettingsEvent<PingSettings>): Promise<void> {
    if (!ev.action.isKey()) return;
    if (this.running.has(ev.action.id)) return;
    this.stopDisplayAnimation(ev.action.id);
    await this.renderStoredOrReady(ev.action, parseSettings(ev.payload.settings));
  }

  override async onSendToPlugin(ev: SendToPluginEvent<JsonValue, PingSettings>): Promise<void> {
    if (!isValidationRequest(ev.payload)) return;
    await this.sendValidation(ev.payload.target, ev.payload.language ?? "auto");
  }

  override onKeyDown(ev: KeyDownEvent<PingSettings>): void {
    const key = ev.action.id;
    if (this.running.has(key)) return;
    this.stopDisplayAnimation(key);
    const settings = parseSettings(ev.payload.settings);
    const timer = setTimeout(() => {
      const press = this.presses.get(key);
      if (!press) return;
      press.showingResult = true;
      void this.renderMetrics(ev.action, settings, press.metricPage);
    }, longPressMs);
    this.presses.set(key, { timer, showingResult: false, metricPage: 0 });
  }

  override async onKeyUp(ev: KeyUpEvent<PingSettings>): Promise<void> {
    const key = ev.action.id;
    const press = this.presses.get(key);
    this.presses.delete(key);
    if (!press) return;
    clearTimeout(press.timer);
    if (press.showingResult) {
      this.startMetricCarousel(ev.action, parseSettings(ev.payload.settings));
      return;
    }
    if (this.running.has(key)) return;
    await this.runPing(ev.action, parseSettings(ev.payload.settings));
  }

  override onWillDisappear(ev: WillDisappearEvent<PingSettings>): void {
    const press = this.presses.get(ev.action.id);
    if (press) {
      clearTimeout(press.timer);
      this.presses.delete(ev.action.id);
    }
    this.stopDisplayAnimation(ev.action.id);
  }

  private async runPing(actionInstance: KeyDownEvent<PingSettings>["action"], settings: PingSettings): Promise<void> {
    const key = actionInstance.id;
    this.running.add(key);
    try {
      if (!settings.target.trim()) {
        await this.paint(actionInstance, settings, "error", keyCopy("setTarget", resolveLocale(settings.language)));
        await actionInstance.showAlert();
        return;
      }
      try {
        // Validation occurs before any child process is created.
        const result = await this.runWithAnimation(actionInstance, settings, () => this.service.run(settings.target));
        const current = parseSettings(await actionInstance.getSettings());
        const next = withResultIfTargetUnchanged(settings, current, result);
        if (!next) {
          await this.prepareDisplay(actionInstance, current);
          if (current.lastResult) await this.renderResult(actionInstance, current);
          else await this.paint(actionInstance, current, "ready", current.target);
          return;
        }
        await actionInstance.setSettings(next);
        if (next.displayMode !== settings.displayMode) await this.prepareDisplay(actionInstance, next);
        if (targetNeedsMarquee(result.host) || (next.displayMode === "custom-icon" && result.host.length > 12)) this.startResultMarquee(actionInstance, next);
        else await this.renderResult(actionInstance, next);
        if (result.status === "error") {
          streamDeck.logger.error(`Ping failed: ${result.error ?? "unknown executor error"}`);
          await actionInstance.showAlert();
        }
      } catch (error) {
        const locale = resolveLocale(settings.language);
        const message = error instanceof TargetValidationError ? keyCopy("invalidTarget", locale) : keyCopy("error", locale);
        await this.paint(actionInstance, settings, "error", message);
        streamDeck.logger.error("Ping action failed:", error);
        await actionInstance.showAlert();
      }
    } finally {
      this.running.delete(key);
    }
  }

  private async renderReady(actionInstance: KeyDownEvent<PingSettings>["action"], settings: PingSettings): Promise<void> {
    if (this.running.has(actionInstance.id)) return;
    await this.paint(actionInstance, settings, "ready", settings.target);
  }

  private async renderStoredOrReady(actionInstance: KeyDownEvent<PingSettings>["action"], settings: PingSettings): Promise<void> {
    await this.prepareDisplay(actionInstance, settings);
    if (settings.lastResult) await this.renderResult(actionInstance, settings);
    else await this.renderReady(actionInstance, settings);
  }

  private async prepareDisplay(actionInstance: KeyDownEvent<PingSettings>["action"], settings: PingSettings): Promise<void> {
    if (settings.displayMode === "custom-icon") await actionInstance.setImage();
    else await actionInstance.setTitle("");
  }

  private async paint(actionInstance: KeyDownEvent<PingSettings>["action"], settings: PingSettings, status: PingStatus, target?: string, result?: PingResult, frame?: number, metricPage?: number): Promise<void> {
    const locale = resolveLocale(settings.language);
    if (settings.displayMode === "custom-icon") {
      await actionInstance.setTitle(renderPingIconTitle({ status, target, result, frame, metricPage, locale }));
    } else {
      await actionInstance.setImage(renderKey(settings.theme, status, target, result, frame, metricPage, locale));
    }
  }

  private async renderResult(actionInstance: KeyDownEvent<PingSettings>["action"], settings: PingSettings, frame?: number): Promise<void> {
    if (settings.lastResult) {
      await this.paint(actionInstance, settings, settings.lastResult.status, settings.lastResult.host, settings.lastResult, frame);
    } else {
      await this.paint(actionInstance, settings, "ready", keyCopy("noResult", resolveLocale(settings.language)));
    }
  }

  private async renderMetrics(actionInstance: KeyDownEvent<PingSettings>["action"], settings: PingSettings, metricPage: number, frame?: number): Promise<void> {
    if (settings.lastResult) {
      await this.paint(actionInstance, settings, settings.lastResult.status, settings.lastResult.host, settings.lastResult, frame, metricPage);
    } else {
      await this.paint(actionInstance, settings, "ready", keyCopy("noResult", resolveLocale(settings.language)));
    }
  }

  private startMetricCarousel(actionInstance: KeyDownEvent<PingSettings>["action"], settings: PingSettings): void {
    const key = actionInstance.id;
    this.stopDisplayAnimation(key);
    if (!settings.lastResult) {
      void this.renderResult(actionInstance, settings);
      return;
    }

    const startedAt = Date.now();
    let frame = 0;
    const showNext = (): void => {
      const elapsed = Date.now() - startedAt;
      const page = Math.floor(elapsed / metricPageMs);
      if (page >= metricPageCount) {
        this.displayAnimations.delete(key);
        void this.renderResult(actionInstance, settings);
        return;
      }
      void this.renderMetrics(actionInstance, settings, page, frame);
      frame += 1;
      this.displayAnimations.set(key, setTimeout(showNext, displayFrameMs));
    };
    showNext();
  }

  private startResultMarquee(actionInstance: KeyDownEvent<PingSettings>["action"], settings: PingSettings): void {
    const key = actionInstance.id;
    this.stopDisplayAnimation(key);
    const totalFrames = Math.ceil(resultMarqueeMs / displayFrameMs);
    let frame = 0;
    const showNext = (): void => {
      if (frame >= totalFrames) {
        this.displayAnimations.delete(key);
        void this.renderResult(actionInstance, settings);
        return;
      }
      void this.renderResult(actionInstance, settings, frame);
      frame += 1;
      this.displayAnimations.set(key, setTimeout(showNext, displayFrameMs));
    };
    showNext();
  }

  private stopDisplayAnimation(key: string): void {
    const animation = this.displayAnimations.get(key);
    if (animation) clearTimeout(animation);
    this.displayAnimations.delete(key);
  }

  private async sendValidation(target: string, language: PingLanguage): Promise<void> {
    let message = "";
    try {
      normalizeTarget(target);
    } catch {
      message = keyCopy(target.trim() ? "targetInvalid" : "targetRequired", resolveLocale(language));
    }
    await streamDeck.ui.sendToPropertyInspector({ type: "validation", message });
  }

  private async runWithAnimation<T>(
    actionInstance: KeyDownEvent<PingSettings>["action"],
    settings: PingSettings,
    operation: () => Promise<T>
  ): Promise<T> {
    let active = true;
    let frame = 0;
    const animation = (async () => {
      while (active) {
        await this.paint(actionInstance, settings, "pinging", settings.target, undefined, frame);
        frame += 1;
        await new Promise((resolve) => setTimeout(resolve, settings.displayMode === "custom-icon" ? iconPulseFrameMs : animationFrameMs[settings.theme]));
      }
    })();

    try {
      return await operation();
    } finally {
      active = false;
      await animation;
    }
  }
}

function isValidationRequest(value: unknown): value is ValidationRequest {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return candidate.type === "validate" && typeof candidate.target === "string" &&
    (candidate.language === undefined || candidate.language === "auto" || candidate.language === "en" || candidate.language === "es");
}

function resolveLocale(language: PingLanguage): PresentationLocale {
  if (language === "en" || language === "es") return language;
  return streamDeck.info.application.language === "es" ? "es" : "en";
}
