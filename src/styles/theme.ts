import {
  colors,
  darkColors,
  palette,
  priorityColors,
  roleAccentColors,
  taskStatusColors,
  type AppColors,
} from "@/styles/colors";
import { componentRadius, radius } from "@/styles/radius";
import { applyShadow, brandShadow, cardShadow, shadows } from "@/styles/shadows";
import {
  fontFamily,
  fontSize,
  fontWeight,
  letterSpacing,
  lineHeight,
  textStyles,
} from "@/styles/typography";

export const spacing = {
  0: 0,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
} as const;

export const layout = {
  screenPaddingX: spacing[4],
  screenGap: spacing[6],
  cardPadding: spacing[4],
  inputHeight: 48,
  buttonHeight: 52,
  tabBarHeight: 64,
  hitSlop: spacing[2],
} as const;

/** Press feedback — design system UI behavior */
export const pressScale = 0.97;

/** @deprecated Use `componentRadius.sheet` */
export const sheetRadius = componentRadius.sheet;

export const lightTheme = {
  mode: "light" as const,
  colors,
  palette,
  priorityColors,
  taskStatusColors,
  roleAccentColors,
  radius,
  componentRadius,
  shadows,
  spacing,
  layout,
  typography: {
    fontFamily,
    fontSize,
    fontWeight,
    lineHeight,
    letterSpacing,
    textStyles,
  },
  pressScale,
} as const;

export const darkTheme = {
  ...lightTheme,
  mode: "dark" as const,
  colors: darkColors,
} as const;

export type Theme = typeof lightTheme;
export type ThemeMode = Theme["mode"];

/** Active app theme — swap when dark mode is enabled */
export const theme = lightTheme;

export {
  applyShadow,
  brandShadow,
  cardShadow,
  colors,
  componentRadius,
  darkColors,
  fontFamily,
  fontSize,
  fontWeight,
  letterSpacing,
  lineHeight,
  palette,
  priorityColors,
  radius,
  roleAccentColors,
  shadows,
  taskStatusColors,
  textStyles,
};

export type { AppColors };
