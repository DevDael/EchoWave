import { themes as sharedThemes, themeMap as sharedThemeMap, animationFrameMs as sharedAnimationFrameMs } from "./base-catalog.js";
import { hexazaTheme } from "./hexaza.js";

// The source checkout is private. Public builds replace this module at bundle time.
export const themes = [...sharedThemes, "hexaza"] as const;
export const themeMap = { ...sharedThemeMap, hexaza: hexazaTheme };
export const animationFrameMs = { ...sharedAnimationFrameMs, hexaza: 100 };
