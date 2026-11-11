import type { ReactNode } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { IconButton } from "@/components/ui/IconButton";

type ScreenHeaderProps = {
  title: string;
  /** One line of context under the title (counts, date…). */
  subtitle?: ReactNode;
  /** Right-aligned actions, usually `IconButton`s. */
  actions?: ReactNode;
  /** Full-width content under the title row, e.g. a `SearchInput` or `SegmentedControl`. */
  children?: ReactNode;
  /** Shows a back button before the title, for the same header on a pushed (non-tab) screen. */
  onBack?: () => void;
};

/** Header for tab screens: safe-area aware, white, hairline bottom border. */
export function ScreenHeader({ title, subtitle, actions, children, onBack }: ScreenHeaderProps) {
  return (
    <SafeAreaView edges={["top"]} className="border-b border-line bg-surface">
      <View className="px-4 pb-3 pt-2">
        <View className="min-h-[44px] flex-row items-center justify-between gap-3">
          {onBack ? (
            <View className="-ml-1">
              <IconButton icon="chevron-back" variant="ghost" accessibilityLabel="Go back" onPress={onBack} />
            </View>
          ) : null}
          <View className="min-w-0 flex-1">
            <Text className="text-display font-bold tracking-tight text-fg" accessibilityRole="header" numberOfLines={1}>
              {title}
            </Text>
            {typeof subtitle === "string" ? (
              <Text className="mt-0.5 text-caption text-fg-soft" numberOfLines={1}>
                {subtitle}
              </Text>
            ) : (
              subtitle ?? null
            )}
          </View>
          {actions ? <View className="flex-row items-center gap-2">{actions}</View> : null}
        </View>
        {children ? <View className="mt-3">{children}</View> : null}
      </View>
    </SafeAreaView>
  );
}
