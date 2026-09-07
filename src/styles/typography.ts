import { TextStyle } from "react-native";

import { colors } from "@/styles/colors";

export const fontFamily = {
  regular: undefined,
  medium: undefined,
  semibold: undefined,
  bold: undefined,
} as const;

export const fontSize = {
  "2xs": 10,
  xs: 11,
  sm: 12,
  md: 13,
  base: 14,
  lg: 15,
  xl: 16,
  "2xl": 18,
  "3xl": 24,
  "4xl": 26,
  "5xl": 32,
} as const;

export const fontWeight = {
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
} as const satisfies Record<string, TextStyle["fontWeight"]>;

export const lineHeight = {
  tight: 1.2,
  snug: 1.35,
  normal: 1.5,
  relaxed: 1.625,
} as const;

export const letterSpacing = {
  tight: -0.25,
  normal: 0,
  wide: 1,
  wider: 2,
} as const;

export const textStyles = {
  display: {
    fontSize: fontSize["4xl"],
    fontWeight: fontWeight.bold,
    color: colors.text,
    letterSpacing: letterSpacing.tight,
  },
  title: {
    fontSize: fontSize["2xl"],
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  heading: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  body: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.regular,
    color: colors.text,
  },
  bodySm: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.regular,
    color: colors.textSecondary,
  },
  caption: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.regular,
    color: colors.textMuted,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textSubtle,
    letterSpacing: letterSpacing.wide,
    textTransform: "uppercase",
  },
  button: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: colors.textInverse,
  },
} as const satisfies Record<string, TextStyle>;

export type FontSizeToken = keyof typeof fontSize;
export type TextStyleToken = keyof typeof textStyles;
