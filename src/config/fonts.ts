import {
  KantumruyPro_400Regular,
  KantumruyPro_500Medium,
  KantumruyPro_600SemiBold,
  KantumruyPro_700Bold,
} from "@expo-google-fonts/kantumruy-pro";
import type { FontFamilyDefinition } from "expo-font";

import { APP_FONT_FAMILY } from "@/styles/typography";

/**
 * Every weight the UI uses (font-normal / medium / semibold / bold), registered as ONE family so
 * `fontFamily: "Kantumruy Pro"` plus `fontWeight` selects the right face on iOS and Android.
 * (The array form of `useFonts` is SDK 58+; a name-per-file map would ignore `fontWeight`.)
 */
export const APP_FONTS: FontFamilyDefinition[] = [
  {
    fontFamily: APP_FONT_FAMILY,
    fontDefinitions: [
      { path: KantumruyPro_400Regular, weight: 400 },
      { path: KantumruyPro_500Medium, weight: 500 },
      { path: KantumruyPro_600SemiBold, weight: 600 },
      { path: KantumruyPro_700Bold, weight: 700 },
    ],
  },
];
