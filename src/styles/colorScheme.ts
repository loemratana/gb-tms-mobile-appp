import { Appearance } from "react-native";

import tokens from "./tokens.json";

/**
 * The phone's light/dark setting, read once when the app starts. Every colour token in JS
 * (`colors`, `palette`, `toneColors`) and every class (via `themeVars`) resolves from this, so
 * changing the phone setting takes effect the next time the app is opened.
 */
export const isDarkMode = Appearance.getColorScheme() === "dark";

/** The active token set: `color` in light mode, `colorDark` in dark mode (same shape). */
export const themeTokens: typeof tokens.color = isDarkMode ? tokens.colorDark : tokens.color;
