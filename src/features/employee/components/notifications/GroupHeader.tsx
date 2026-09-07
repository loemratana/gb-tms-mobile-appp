import { Text, View } from "react-native";

type GroupHeaderProps = {
  title: string;
};

export function GroupHeader({ title }: GroupHeaderProps) {
  return (
    <View className="pb-2 pt-4">
      <Text className="text-[11px] font-bold uppercase tracking-[1.5px] text-[#9CA3AF]">
        {title}
      </Text>
      <View className="mt-2 h-px bg-[#E5E7EB]" />
    </View>
  );
}
