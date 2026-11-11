import { Text, View } from "react-native";

type GroupHeaderProps = {
  title: string;
};

/** Day label ("Today", "Yesterday", …) above a group of notifications. */
export function GroupHeader({ title }: GroupHeaderProps) {
  return (
    <View className="bg-surface px-5 pb-1.5 pt-4">
      <Text
        className="text-label font-semibold uppercase tracking-[1px] text-fg-faint"
        accessibilityRole="header"
      >
        {title}
      </Text>
    </View>
  );
}
