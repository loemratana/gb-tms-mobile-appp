import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";

import { UncontrolledTextInput } from "@/components/ui/UncontrolledTextInput";
import type { ConversationViewer } from "@/features/tasks/hooks/useTaskConversation";
import { getApiErrorMessage } from "@/lib/api";
import { colors } from "@/styles";

/** Quick replies fit who's writing: the person doing the task, or the person who handed it out. */
const QUICK_REPLIES: Record<ConversationViewer, string[]> = {
  assignee: ["On it 👍", "Done — submitting soon", "I have a question", "I need more time", "Blocked, need help"],
  reviewer: [
    "Please share a quick update",
    "Looks good — keep going",
    "Can you attach a preview?",
    "Ready for review when done",
    "Need more details on this",
  ],
};

/** The API's limit (TaskCommentRequest @Size). */
const MAX_LENGTH = 4000;

type CommentComposerProps = {
  onSend: (message: string) => Promise<void>;
  viewer: ConversationViewer;
  autoFocus?: boolean;
};

/** Quick replies (one tap sends) + a message box. The sent message shows in the thread right away. */
export function CommentComposer({ onSend, viewer, autoFocus = false }: CommentComposerProps) {
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = async (text: string) => {
    const message = text.trim();
    if (!message || sending) return;

    setSending(true);
    setError(null);
    setDraft("");
    try {
      await onSend(message);
    } catch (sendError) {
      setDraft(message); // give the text back so nothing is lost
      setError(`Not sent: ${getApiErrorMessage(sendError)}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}
      >
        {QUICK_REPLIES[viewer].map((reply) => (
          <Pressable
            key={reply}
            onPress={() => void send(reply)}
            disabled={sending}
            accessibilityRole="button"
            accessibilityLabel={`Send: ${reply}`}
            className="rounded-full border border-line bg-field px-3.5 py-2 active:bg-brand-subtle"
          >
            <Text className="text-label font-medium text-fg-sub">{reply}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <View className="mx-4 mt-2.5 flex-row items-end gap-2 rounded-2xl bg-field px-3 py-2">
        <UncontrolledTextInput
          value={draft}
          onChangeText={(text) => {
            setDraft(text);
            if (error) setError(null);
          }}
          autoFocus={autoFocus}
          placeholder="Write a message…"
          placeholderTextColor={colors.textSubtle}
          className="min-w-0 flex-1 py-1.5 text-body-sm text-fg"
          multiline
          maxLength={MAX_LENGTH}
          style={{ maxHeight: 120 }}
        />
        <Pressable
          onPress={() => void send(draft)}
          disabled={!draft.trim() || sending}
          accessibilityRole="button"
          accessibilityLabel="Send message"
          hitSlop={6}
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

      {error ? <Text className="mx-4 mt-1.5 text-label text-error">{error}</Text> : null}
    </View>
  );
}
