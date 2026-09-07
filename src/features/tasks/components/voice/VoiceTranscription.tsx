import { Pencil, RotateCcw } from "lucide-react-native";
import { Pressable, Text, TextInput, View } from "react-native";

type VoiceTranscriptionProps = {
  text: string;
  onChangeText: (text: string) => void;
  onRetryRecording: () => void;
  isEditable: boolean;
  onToggleEditing: () => void;
};

export function VoiceTranscription({
  text,
  onChangeText,
  onRetryRecording,
  isEditable,
  onToggleEditing,
}: VoiceTranscriptionProps) {
  return (
    <View className="mt-4 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-[13px] font-semibold text-[#374151]">Recognized speech</Text>
        <View className="flex-row items-center gap-3">
          <Pressable onPress={onToggleEditing} hitSlop={8} accessibilityLabel="Edit recognized text">
            <Pencil size={16} color={isEditable ? "#32CD32" : "#6B7280"} />
          </Pressable>
          <Pressable onPress={onRetryRecording} hitSlop={8} accessibilityLabel="Record again">
            <RotateCcw size={16} color="#6B7280" />
          </Pressable>
        </View>
      </View>

      {isEditable ? (
        <TextInput
          value={text}
          onChangeText={onChangeText}
          multiline
          textAlignVertical="top"
          autoFocus
          className="min-h-[60px] text-[16px] leading-[26px] text-[#111827]"
        />
      ) : (
        <Text className="text-[16px] leading-[26px] text-[#111827]">{text}</Text>
      )}
    </View>
  );
}
