
const plugin = require("tailwindcss/plugin");

const tokens = require("./src/styles/tokens.json");

/** Must match APP_FONT_FAMILY in src/styles/typography.ts (the family loaded in src/config/fonts.ts). */
const APP_FONT_FAMILY = "Kantumruy Pro";

const px = (value) => `${value}px`;

/**
 * Colour classes read CSS variables instead of fixed hex values, so the same build can render
 * light or dark: src/styles/themeVars.ts sets the variables at the app root from the active
 * token set (tokens.color or tokens.colorDark). Names match: brand.strong → --color-brand-strong.
 */
const toVariableColors = (tree, prefix = "--color") =>
  Object.fromEntries(
    Object.entries(tree).map(([key, value]) => {
      const name = key === "DEFAULT" ? prefix : `${prefix}-${key}`;
      if (typeof value !== "string") return [key, toVariableColors(value, name)];
      // Hex tokens support opacity modifiers (bg-brand/10); the rgba overlay is used as-is.
      return [key, value.startsWith("#") ? `rgb(var(${name}) / <alpha-value>)` : `var(${name})`];
    }),
  );

const fontSize = Object.fromEntries(
  Object.entries(tokens.fontSize).map(([name, [size]]) => [
    name,
    px(size),
  ]),
);

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],

  presets: [require("nativewind/preset")],

  darkMode: "class",

  theme: {
    extend: {
      colors: toVariableColors(tokens.color),

      fontSize,

      borderRadius: {
        control: px(tokens.radius.control),
        card: px(tokens.radius.card),
        sheet: px(tokens.radius.sheet),
      },

      spacing: {
        4.5: "18px",
        13: "52px",
      },

      fontFamily: {
        sans: [APP_FONT_FAMILY],
        khmer: [APP_FONT_FAMILY],
      },

      boxShadow: {
        card: "0px 2px 8px rgba(0,0,0,0.04)",
        elevated: "0px 8px 24px rgba(0,0,0,0.08)",
      },
    },
  },

  plugins: [
    // React Native has no global default font, so every type-scale class (text-body, text-caption…)
    // also sets the app font. Nearly all text uses one; the rest add `font-sans`.
    plugin(({ addUtilities }) => {
      addUtilities(
        Object.fromEntries(
          Object.keys(tokens.fontSize).map((name) => [`.text-${name}`, { fontFamily: APP_FONT_FAMILY }]),
        ),
      );
    }),
  ],
};
