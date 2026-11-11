import { vars } from "nativewind";

import { themeTokens } from "./colorScheme";

type TokenTree = { [key: string]: string | TokenTree };

/** "#2563EB" → "37 99 235", the form `rgb(var(--x) / <alpha-value>)` expects. */
function hexToChannels(hex: string): string {
  const value = hex.replace("#", "");
  return [0, 2, 4].map((offset) => parseInt(value.slice(offset, offset + 2), 16)).join(" ");
}

/**
 * Flattens tokens into the variable names tailwind.config.js uses:
 * `brand.DEFAULT` → `--color-brand`, `brand.strong` → `--color-brand-strong`.
 * Non-hex values (the rgba overlay) are passed through whole.
 */
function toVariables(tree: TokenTree, prefix = "--color"): Record<string, string> {
  const variables: Record<string, string> = {};
  for (const [key, value] of Object.entries(tree)) {
    const name = key === "DEFAULT" ? prefix : `${prefix}-${key}`;
    if (typeof value === "string") {
      variables[name] = value.startsWith("#") ? hexToChannels(value) : value;
    } else {
      Object.assign(variables, toVariables(value, name));
    }
  }
  return variables;
}

/**
 * Colour-class variables for the active scheme. Applied once on a View at the app root, so every
 * `bg-surface`, `text-fg`… below it resolves to the light or dark token set.
 */
export const themeVars = vars(toVariables(themeTokens));
