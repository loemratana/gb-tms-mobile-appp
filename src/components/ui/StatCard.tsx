import Ionicons from "@expo/vector-icons/Ionicons";
import type { ComponentProps } from "react";
import { Pressable, Text, View } from "react-native";

import { colors as themeColors, toneColors, type Tone, withAlpha } from "@/styles";

import { SkeletonBlock } from "./Skeleton";

export type StatCardProps = {
  title: string;
  value: string | number;
  icon: ComponentProps<typeof Ionicons>["name"];
  /** Fills the whole card with the tone's solid colour. */
  tone?: Tone;
  onPress?: () => void;
};

/** One headline number with its label. Solid tone background, white text, small radius. */
export function StatCard({ title, value, icon, tone = "neutral", onPress }: StatCardProps) {
  // Neutral's tone colour is a light grey; the darker secondary text grey keeps white text readable.
  const background = tone === "neutral" ? themeColors.textSecondary : toneColors[tone].color;

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityLabel={`${title}: ${value}`}
      className="flex-1"
    >
      {/* Colour lives on an inner View with a plain style object: NativeWind drops a
          function `style` on Pressable when `className` is also set, which left the card blank. */}
      {({ pressed }) => (
        <View
          className="rounded-lg p-4"
          style={{ backgroundColor: background, opacity: pressed && onPress ? 0.9 : 1 }}
        >
          <View className="flex-row items-center justify-between">
            <Text className="flex-1 pr-2 text-caption font-medium text-white/90" numberOfLines={1}>
              {title}
            </Text>
            <View
              className="h-8 w-8 items-center justify-center rounded-md"
              style={{ backgroundColor: withAlpha(themeColors.textInverse, 0.2) }}
            >
              <Ionicons name={icon} size={16} color={themeColors.textInverse} />
            </View>
          </View>
          <Text className="mt-2 text-display font-bold text-white">
            {typeof value === "number" ? value.toLocaleString() : value}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

/** Loading placeholder with {@link StatCard}'s exact shape, for dashboard skeletons. */
export function StatCardSkeleton() {
  return (
    <View className="flex-1 rounded-lg border border-line bg-surface p-4">
      <View className="flex-row items-center justify-between">
        <SkeletonBlock height={12} className="w-1/2" />
        <SkeletonBlock width={32} height={32} radius={6} />
      </View>
      <SkeletonBlock height={28} className="mt-2 w-1/3" />
    </View>
  );
}
