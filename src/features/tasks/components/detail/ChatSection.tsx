import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { UncontrolledTextInput } from "@/components/ui/UncontrolledTextInput";
import { CommentList } from "./CommentList";
import type { TaskCommentResponse } from "@/features/tasks/types/task.types";
import { colors } from "@/styles";

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
      <Text className="mb-3 text-body font-semibold text-fg">Comment</Text>

      {isLoadingComments ? (
        <View className="mb-4 items-center py-3">
          <ActivityIndicator size="small" color={colors.textSubtle} />
        </View>
      ) : (
        <CommentList comments={comments} />
      )}

      <View>
        <Text className="mb-2.5 text-label font-medium text-fg-soft">
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
                    ? "border-brand bg-brand-subtle"
                    : "border-line bg-field"
                }`}
              >
                <Text
                  className={`text-label font-medium ${
                    isSelected ? "text-brand-strong" : "text-fg-sub"
                  }`}
                >
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View className="mt-3 flex-row items-end gap-2 rounded-2xl bg-field px-3 py-2.5">
          <UncontrolledTextInput
            value={draft}
            onChangeText={(text) => {
              setDraft(text);
              setSelectedId(null);
            }}
            placeholder="Write a quick reply..."
            placeholderTextColor={colors.textSubtle}
            className="min-w-0 flex-1 text-body-sm text-fg"
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
              draft.trim() && !sending ? "bg-brand" : "bg-line-strong"
            }`}
          >
            {sending ? (
              <ActivityIndicator size="small" color={colors.textInverse} />
            ) : (
              <Ionicons name="send" size={16} color={colors.textInverse} />
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
}
