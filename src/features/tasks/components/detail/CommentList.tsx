import { Fragment } from "react";
import { Text, View } from "react-native";

import { Avatar } from "@/components/ui/Avatar";
import type { TaskCommentResponse } from "@/features/tasks/types/task.types";

type CommentListProps = {
  comments: TaskCommentResponse[];
  /** Your own messages sit on the right; everyone else's on the left. */
  currentUserId?: string;
  /** Small tag next to a name, e.g. "Assignee" or "Creator", so it's clear who's talking. */
  roleOf?: (userId: string) => string | undefined;
};

/** Messages from one person this close together are drawn as one block (name and avatar once). */
const GROUP_WINDOW_MS = 5 * 60_000;

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function formatDay(date: Date): string {
  const today = new Date();
  const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
  if (dayKey(date) === dayKey(today)) return "Today";
  if (dayKey(date) === dayKey(yesterday)) return "Yesterday";
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    ...(date.getFullYear() !== today.getFullYear() ? { year: "numeric" } : {}),
  });
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

/**
 * The task's conversation, chat style: your messages on the right in the brand colour, other
 * people's on the left with their avatar and name. Grouped by day and by sender.
 */
export function CommentList({ comments, currentUserId, roleOf }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <View className="mb-4 items-center rounded-2xl bg-field px-4 py-5">
        <Text className="text-caption font-semibold text-fg-sub">No messages yet</Text>
        <Text className="mt-1 text-center text-label text-fg-faint">
          Ask a question or share an update. Everyone on this task is notified.
        </Text>
      </View>
    );
  }

  return (
    <View className="mb-4">
      {comments.map((comment, index) => {
        const date = new Date(comment.createdAt);
        const previous = comments[index - 1];
        const next = comments[index + 1];
        const authorId = comment.author?.id;
        const isMine = Boolean(currentUserId && authorId === currentUserId);

        const isNewDay = !previous || dayKey(new Date(previous.createdAt)) !== dayKey(date);
        const sameSenderAs = (other: TaskCommentResponse | undefined) =>
          Boolean(
            other &&
              other.author?.id === authorId &&
              dayKey(new Date(other.createdAt)) === dayKey(date) &&
              Math.abs(new Date(other.createdAt).getTime() - date.getTime()) <= GROUP_WINDOW_MS,
          );
        const startsGroup = isNewDay || !sameSenderAs(previous);
        const endsGroup = !sameSenderAs(next);

        const authorName = comment.author?.name ?? "Unknown";
        const role = authorId ? roleOf?.(authorId) : undefined;

        return (
          <Fragment key={comment.id}>
            {isNewDay ? (
              <View className="my-3 flex-row items-center gap-3">
                <View className="h-px flex-1 bg-line-soft" />
                <Text className="text-micro font-semibold text-fg-faint">{formatDay(date)}</Text>
                <View className="h-px flex-1 bg-line-soft" />
              </View>
            ) : null}

            <View
              className={`flex-row items-end gap-2 ${isMine ? "justify-end" : "justify-start"} ${
                startsGroup ? "mt-2" : "mt-0.5"
              }`}
            >
              {/* Others: avatar beside the last bubble of their block, a spacer beside the rest. */}
              {!isMine ? (
                endsGroup ? (
                  <Avatar name={authorName} imageUrl={comment.author?.avatarUrl ?? null} size={28} />
                ) : (
                  <View style={{ width: 28 }} />
                )
              ) : null}

              <View className={`max-w-[78%] ${isMine ? "items-end" : "items-start"}`}>
                {startsGroup && !isMine ? (
                  <View className="mb-1 ml-1 flex-row items-center gap-1.5">
                    <Text className="text-micro font-semibold text-fg-sub" numberOfLines={1}>
                      {authorName}
                    </Text>
                    {role ? (
                      <View className="rounded-full bg-subtle px-1.5 py-px">
                        <Text className="text-micro font-medium text-fg-soft">{role}</Text>
                      </View>
                    ) : null}
                  </View>
                ) : null}

                <View
                  className={`rounded-2xl px-3.5 py-2.5 ${isMine ? "bg-brand" : "bg-field"} ${
                    isMine && endsGroup ? "rounded-br-md" : ""
                  } ${!isMine && endsGroup ? "rounded-bl-md" : ""}`}
                  style={comment.pending ? { opacity: 0.6 } : undefined}
                  accessibilityLabel={`${isMine ? "You" : authorName}: ${comment.content}`}
                >
                  <Text className={`text-caption ${isMine ? "text-white" : "text-fg"}`}>
                    {comment.content}
                  </Text>
                </View>

                {endsGroup ? (
                  <Text className={`mt-1 text-micro text-fg-faint ${isMine ? "mr-1" : "ml-1"}`}>
                    {comment.pending ? "Sending…" : formatTime(date)}
                  </Text>
                ) : null}
              </View>
            </View>
          </Fragment>
        );
      })}
    </View>
  );
}
