import { Pressable, Text, View } from "react-native";

type SectionHeaderProps = {
  title: string;
  /** Optional count or short context shown after the title. */
  meta?: string;
  actionLabel?: string;
  onPressAction?: () => void;
};

/** Heading above a group of content, with an optional "See all"-style action. */
export function SectionHeader({ title, meta, actionLabel, onPressAction }: SectionHeaderProps) {
  return (
    <View className="mb-3 flex-row items-center justify-between">
      <View className="flex-1 flex-row items-baseline gap-2 pr-3">
        <Text className="text-title font-semibold text-fg" accessibilityRole="header" numberOfLines={1}>
          {title}
        </Text>
        {meta ? <Text className="text-caption text-fg-soft">{meta}</Text> : null}
      </View>
      {actionLabel && onPressAction ? (
        <Pressable onPress={onPressAction} hitSlop={10} accessibilityRole="button" accessibilityLabel={actionLabel}>
          <Text className="text-body-sm font-semibold text-brand-strong">{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
