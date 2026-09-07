import { Platform, type ViewStyle } from "react-native";

import { palette } from "@/styles/colors";

type ShadowPreset = {
  ios: ViewStyle;
  android: ViewStyle;
};

function createShadow(
  offsetY: number,
  opacity: number,
  radius: number,
  elevation: number,
): ShadowPreset {
  return {
    ios: {
      shadowColor: palette.slate[900],
      shadowOffset: { width: 0, height: offsetY },
      shadowOpacity: opacity,
      shadowRadius: radius,
    },
    android: { elevation },
  };
}

export const shadows = {
  none: createShadow(0, 0, 0, 0),
  sm: createShadow(2, 0.04, 6, 1),
  md: createShadow(4, 0.06, 12, 2),
  lg: createShadow(8, 0.06, 16, 3),
  xl: createShadow(12, 0.08, 24, 6),
} as const;

export const brandShadow = {
  ios: {
    shadowColor: palette.green.brand,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  android: { elevation: 4 },
} as const;

/** @deprecated Use `shadows.md` — kept for existing imports */
export const cardShadow = shadows.md;

export function applyShadow(preset: ShadowPreset): ViewStyle {
  return Platform.select(preset) ?? preset.android;
}

export type ShadowToken = keyof typeof shadows;
