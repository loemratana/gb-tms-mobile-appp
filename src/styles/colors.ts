import { isDarkMode, themeTokens } from "./colorScheme";

/** Core palette — task-management-design-system.md */

const lightPalette = {
  blue: {
    50: "#EFF6FF",
    100: "#DBEAFE",
    500: "#3B82F6",
    600: "#2563EB",
    700: "#1D4ED8",
  },
  green: {
    50: "#ECFDF5",
    100: "#D1FAE5",
    500: "#22C55E",
    600: "#16A34A",
  },
  amber: {
    50: "#FFFBEB",
    500: "#F59E0B",
    600: "#D97706",
  },
  red: {
    50: "#FEF2F2",
    500: "#EF4444",
    600: "#DC2626",
  },
  violet: {
    50: "#F5F3FF",
    500: "#8B5CF6",
  },
  gray: {
    50: "#F9FAFB",
    100: "#F3F4F6",
    200: "#E5E7EB",
    300: "#D1D5DB",
    400: "#9CA3AF",
    500: "#6B7280",
    600: "#4B5563",
    700: "#374151",
    900: "#111827",
  },
  slate: {
    900: "#0F172A",
    800: "#1E293B",
    700: "#334155",
    50: "#F8FAFC",
  },
  white: "#FFFFFF",
  black: "#000000",
  transparent: "transparent",
};

/**
 * Dark mode keeps each shade's *role*: the grey scale is flipped (50 is still the faintest fill,
 * 900 still the strongest text) and the light 50/100 tints become deep tints. Mid tones (500–700)
 * stay close, so accents look the same in both themes.
 */
const darkPalette: typeof lightPalette = {
  blue: { 50: "#172554", 100: "#1E3A8A", 500: "#3B82F6", 600: "#3B82F6", 700: "#60A5FA" },
  green: { 50: "#052E16", 100: "#14532D", 500: "#22C55E", 600: "#22C55E" },
  amber: { 50: "#451A03", 500: "#F59E0B", 600: "#F59E0B" },
  red: { 50: "#450A0A", 500: "#EF4444", 600: "#EF4444" },
  violet: { 50: "#2E1065", 500: "#8B5CF6" },
  gray: {
    50: "#111827",
    100: "#1F2937",
    200: "#374151",
    300: "#4B5563",
    400: "#6B7280",
    500: "#9CA3AF",
    600: "#D1D5DB",
    700: "#E5E7EB",
    900: "#F9FAFB",
  },
  slate: lightPalette.slate,
  white: lightPalette.white,
  black: lightPalette.black,
  transparent: lightPalette.transparent,
};

export const palette = isDarkMode ? darkPalette : lightPalette;

/**
 * Semantic colours for JS (icons, charts, `style={}`). Values come from
 * tokens.json — the same file tailwind.config.js reads — so classes and JS agree.
 * See docs/design-system.md.
 */
export const colors = {
  /** The one primary/brand colour: primary buttons, active states, progress. */
  primary: themeTokens.brand.DEFAULT,
  brand: themeTokens.brand.DEFAULT,
  brandStrong: themeTokens.brand.strong,
  brandSubtle: themeTokens.brand.subtle,
  brandBorder: themeTokens.brand.border,
  managerAccent: themeTokens.brand.DEFAULT,

  success: themeTokens.success.DEFAULT,
  warning: themeTokens.warning.DEFAULT,
  danger: themeTokens.error.DEFAULT,
  info: themeTokens.info.DEFAULT,

  background: themeTokens.screen,
  surface: themeTokens.surface,
  card: themeTokens.surface,
  border: themeTokens.line.DEFAULT,
  divider: themeTokens.line.soft,
  inputBg: themeTokens.field,
  mutedBg: themeTokens.subtle,

  text: themeTokens.fg.DEFAULT,
  textSecondary: themeTokens.fg.sub,
  textMuted: themeTokens.fg.soft,
  textSubtle: themeTokens.fg.faint,
  textInverse: themeTokens.fg.inverse,

  overlay: themeTokens.overlay,
} as const;

export const priorityColors = {
  low: themeTokens.fg.soft,
  medium: themeTokens.info.DEFAULT,
  high: themeTokens.warning.DEFAULT,
  urgent: themeTokens.error.DEFAULT,
} as const;

export const taskStatusColors = {
  todo: themeTokens.warning.DEFAULT,
  in_progress: themeTokens.info.DEFAULT,
  review: themeTokens.violet.DEFAULT,
  done: themeTokens.success.DEFAULT,
  cancelled: themeTokens.fg.soft,
} as const;

export const roleAccentColors = {
  admin: themeTokens.info.DEFAULT,
  manager: themeTokens.brand.DEFAULT,
  employee: themeTokens.fg.DEFAULT,
} as const;


export type AppColors = typeof colors;
export type ColorToken = keyof AppColors;

/** React Native has no hex+alpha shorthand that works everywhere, so derive rgba from a #RRGGBB token. */
export function withAlpha(hex: string, alpha: number): string {
  const red = parseInt(hex.slice(1, 3), 16);
  const green = parseInt(hex.slice(3, 5), 16);
  const blue = parseInt(hex.slice(5, 7), 16);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}
