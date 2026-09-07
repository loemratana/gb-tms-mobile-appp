/** Border radius scale */

export const radius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 28,
  full: 9999,
} as const;

/** Common component radii */
export const componentRadius = {
  button: radius.md,
  input: radius.md,
  card: radius.lg,
  chip: radius.full,
  avatar: radius.full,
  sheet: radius["2xl"],
  sheetHandle: radius.full,
  badge: radius.full,
} as const;

export type RadiusToken = keyof typeof radius;
