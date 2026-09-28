import streamDeck from "@elgato/streamdeck";
import { PingAction } from "./actions/ping.action.js";
import { HttpAction } from "./actions/http.action.js";
import { setPresentationLocale } from "./presentation/themes/shared.js";

setPresentationLocale(streamDeck.info.application.language === "es" ? "es" : "en");
streamDeck.actions.registerAction(new PingAction());
streamDeck.actions.registerAction(new HttpAction());
streamDeck.connect();
