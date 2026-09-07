import { Mic } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

type VoiceTaskButtonProps = {
  onPress: () => void;
};

export function VoiceTaskButton({ onPress }: VoiceTaskButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Fill task by speaking in Khmer"
      className="flex-row items-center gap-1.5 rounded-full bg-[#F0FDF4] px-3 py-1.5"
    >
      <View className="h-5 w-5 items-center justify-center rounded-full bg-[#32CD32]">
        <Mic size={12} color="white" />
      </View>
      <Text className="text-[13px] font-semibold text-[#16A34A]">Speak</Text>
    </Pressable>
  );
}
