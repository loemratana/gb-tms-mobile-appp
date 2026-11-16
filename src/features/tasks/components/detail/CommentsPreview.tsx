import Ionicons from "@expo/vector-icons/Ionicons";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import type { TaskCommentResponse } from "@/features/tasks/types/task.types";
import { colors } from "@/styles";
import { CommentList } from "./CommentList";

/** How many of the latest messages the task screen shows before "View all". */
const PREVIEW_COUNT = 3;

type CommentsPreviewProps = {
  comments: TaskCommentResponse[];
  count: number;
  isLoading: boolean;
  currentUserId?: string;
  roleOf?: (userId: string) => string | undefined;
  /** Opens the full-screen chat; `focus` puts the cursor in the message box right away. */
  onOpenChat: (options?: { focus?: boolean }) => void;
  /** Off inside a "Comments" tab, where the tab already says what this is. */
  showTitle?: boolean;
};

/**
 * The task screen's slice of the conversation: the latest few messages, "View all", and a
 * message row that opens the full chat (where typing, the keyboard and long threads are handled).
 */
export function CommentsPreview({
  comments,
  count,
  isLoading,
  currentUserId,
  roleOf,
  onOpenChat,
  showTitle = true,
}: CommentsPreviewProps) {
  const latest = comments.slice(-PREVIEW_COUNT);
  const hidden = comments.length - latest.length;

  return (
    <View>
      <View className="mb-1 flex-row items-center justify-between">
        {showTitle ? (
          <View className="flex-row items-center gap-2">
            <Text className="text-body font-semibold text-fg">Comments</Text>
            {count > 0 ? (
              <View className="rounded-full bg-subtle px-2 py-0.5">
                <Text className="text-micro font-semibold text-fg-soft">{count}</Text>
              </View>
            ) : null}
          </View>
        ) : (
          <View />
        )}
        {count > 0 ? (
          <Pressable
            onPress={() => onOpenChat()}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`View all ${count} comments`}
            className="flex-row items-center gap-0.5"
          >
            <Text className="text-label font-semibold text-brand-strong">View all</Text>
            <Ionicons name="chevron-forward" size={14} color={colors.brandStrong} />
          </Pressable>
        ) : null}
      </View>

      {isLoading ? (
        <View className="mb-4 items-center py-3">
          <ActivityIndicator size="small" color={colors.textSubtle} />
        </View>
      ) : (
        <>
          {hidden > 0 ? (
            <Pressable onPress={() => onOpenChat()} accessibilityRole="button" className="items-center py-1.5">
              <Text className="text-label font-medium text-fg-soft">
                {hidden} earlier {hidden === 1 ? "message" : "messages"}
              </Text>
            </Pressable>
          ) : null}
          <CommentList comments={latest} currentUserId={currentUserId} roleOf={roleOf} />
        </>
      )}

      {/* Looks like the message box, but opens the chat: typing happens there, above the keyboard. */}
      <Pressable
        onPress={() => onOpenChat({ focus: true })}
        accessibilityRole="button"
        accessibilityLabel="Write a message"
        className="flex-row items-center gap-2 rounded-2xl bg-field px-3.5 py-3 active:bg-subtle"
      >
        <Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.textSubtle} />
        <Text className="flex-1 text-body-sm text-fg-faint">Write a message…</Text>
        <View className="h-8 w-8 items-center justify-center rounded-full bg-brand">
          <Ionicons name="send" size={14} color={colors.textInverse} />
        </View>
      </Pressable>
    </View>
  );
}
