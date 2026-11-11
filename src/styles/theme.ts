
import {
  colors,
  palette,
  priorityColors,
  roleAccentColors,
  taskStatusColors,
} from "./colors";

import { componentRadius, radius } from "./radius";
import { shadows } from "./shadows";

import {
  fontFamily,
  fontSize,
  fontWeight,
  letterSpacing,
  lineHeight,
  textStyles,
} from "./typography";

/* =========================================
   DESIGN SYSTEM TYPES
========================================= */

export type ThemeMode = "light" | "dark" | "system";

/* =========================================
   SPACING
========================================= */

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
  16: 64,
} as const;

/* =========================================
   LAYOUT
========================================= */

export const layout = {
  screenPaddingX: spacing[4],
  screenPaddingY: spacing[4],

  screenGap: spacing[6],
  sectionGap: spacing[6],

  cardPadding: spacing[4],
  cardGap: spacing[3],

  inputHeight: 48,
  buttonHeight: 48,
  buttonHeightLarge: 52,

  headerHeight: 56,
  tabBarHeight: 64,

  minimumTouchTarget: 44,
  hitSlop: spacing[2],

  modalMaxHeight: "90%",
} as const;

/* =========================================
   INTERACTION
========================================= */

export const interaction = {
  pressScale: 0.97,
  pressedOpacity: 0.75,
  disabledOpacity: 0.5,
} as const;

/* =========================================
   ANIMATION
========================================= */

export const animation = {
  fast: 150,
  normal: 200,
  slow: 300,
} as const;

/* =========================================
   SHARED THEME
========================================= */

const sharedTheme = {
  palette,
  priorityColors,
  taskStatusColors,
  roleAccentColors,

  radius,
  componentRadius,
  shadows,

  spacing,
  layout,

  interaction,
  animation,

  typography: {
    fontFamily,
    fontSize,
    fontWeight,
    lineHeight,
    letterSpacing,
    textStyles,
  },
} as const;

/* =========================================
   LIGHT THEME
========================================= */

export const lightTheme = {
  ...sharedTheme,

  mode: "light" as const,
  colors,
} as const;

/* =========================================
   DARK THEME
========================================= */

export const darkTheme = {
  ...sharedTheme,

  mode: "dark" as const,
  colors,
} as const;

/* =========================================
   THEME TYPES
========================================= */

export type Theme = typeof lightTheme;

export type ResolvedThemeMode = "light" | "dark";

/**
 * @deprecated Use useAppTheme() for runtime theme access.
 * This export always represents the light theme.
 */
export const theme = lightTheme;
