import { Text, View } from "react-native";

import { colors } from "@/styles";

type GroupHeaderProps = {
  title: string;
};

export function GroupHeader({ title }: GroupHeaderProps) {
  return (
    <View className="pb-2 pt-4">
      <Text
        className="text-[11px] font-bold uppercase tracking-[1.5px]"
        style={{ color: colors.textSubtle }}
      >
        {title}
      </Text>
      <View className="mt-2 h-px" style={{ backgroundColor: colors.border }} />
    </View>
  );
}
