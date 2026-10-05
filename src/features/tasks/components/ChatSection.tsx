import { Send } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { CommentList } from "@/features/tasks/components/CommentList";
import type { TaskCommentResponse } from "@/features/tasks/types/task.types";

const QUICK_REPLIES = [
  "Please share a quick update",
  "Looks good — keep going",
  "Can you attach a preview?",
  "Ready for review when done",
  "Need more details on this",
];

type ChatSectionProps = {
  onSend?: (message: string) => Promise<void>;
  comments?: TaskCommentResponse[];
  isLoadingComments?: boolean;
};

export function ChatSection({
  onSend,
  comments = [],
  isLoadingComments = false,
}: ChatSectionProps) {
  const [draft, setDraft] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const handleSelect = (id: string, text: string) => {
    setSelectedId(id);
    setDraft(text);
  };

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || sending) return;

    setSending(true);
    try {
      await onSend?.(text);
      Alert.alert("Comment sent", "Your message was sent to the assignee.");
      setDraft("");
      setSelectedId(null);
    } catch {
      Alert.alert(
        "Couldn't send",
        "Your message wasn't sent. Please try again."
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <View>
      <Text className="mb-3 text-[15px] font-semibold text-[#111827]">Comment</Text>

      {isLoadingComments ? (
        <View className="mb-4 items-center py-3">
          <ActivityIndicator size="small" color="#9CA3AF" />
        </View>
      ) : (
        <CommentList comments={comments} />
      )}

      <View>
        <Text className="mb-2.5 text-[12px] font-medium text-[#6B7280]">
          Quick replies
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingRight: 4 }}
        >
          {QUICK_REPLIES.map((option, index) => {
            const id = `reply-${index}`;
            const isSelected = selectedId === id;

            return (
              <Pressable
                key={id}
                onPress={() => handleSelect(id, option)}
                accessibilityRole="button"
                accessibilityLabel={option}
                className={`rounded-full border px-3.5 py-2 ${
                  isSelected
                    ? "border-[#32CD32] bg-[#ECFDF5]"
                    : "border-[#E5E7EB] bg-[#F9FAFB]"
                }`}
              >
                <Text
                  className={`text-[12px] font-medium ${
                    isSelected ? "text-[#15803D]" : "text-[#374151]"
                  }`}
                >
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View className="mt-3 flex-row items-end gap-2 rounded-2xl bg-[#F9FAFB] px-3 py-2.5">
          <TextInput
            value={draft}
            onChangeText={(text) => {
              setDraft(text);
              setSelectedId(null);
            }}
            placeholder="Write a quick reply..."
            placeholderTextColor="#9CA3AF"
            className="min-w-0 flex-1 text-[14px] text-[#111827]"
            multiline
            editable={!sending}
            style={{ maxHeight: 96 }}
          />
          <Pressable
            onPress={() => void handleSend()}
            disabled={!draft.trim() || sending}
            accessibilityRole="button"
            accessibilityLabel="Send comment"
            className={`h-9 w-9 items-center justify-center rounded-full ${
              draft.trim() && !sending ? "bg-[#32CD32]" : "bg-[#D1D5DB]"
            }`}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Send size={16} color="#FFFFFF" strokeWidth={2.2} />
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
}
