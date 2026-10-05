import { Image, Text, View } from "react-native";

import type { TaskCommentResponse } from "@/features/tasks/types/task.types";

type CommentListProps = {
  comments: TaskCommentResponse[];
};

function formatCommentTime(dateString: string): string {
  const date = new Date(dateString);
  const diffMin = Math.floor((Date.now() - date.getTime()) / 60_000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function CommentList({ comments }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <Text className="mb-3 text-[13px] text-[#9CA3AF]">No comments yet.</Text>
    );
  }

  return (
    <View className="mb-4 gap-3">
      {comments.map((comment) => {
        const authorName = comment.author?.name ?? "Unknown";

        return (
          <View key={comment.id} className="flex-row items-start gap-2.5">
            <View className="h-8 w-8 overflow-hidden rounded-full bg-[#E5E7EB]">
              {comment.author?.avatarUrl ? (
                <Image
                  source={{ uri: comment.author.avatarUrl }}
                  className="h-full w-full"
                  accessibilityLabel={authorName}
                />
              ) : (
                <View className="h-full w-full items-center justify-center">
                  <Text className="text-[11px] font-bold text-[#6B7280]">
                    {authorName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>

            <View className="min-w-0 flex-1 rounded-2xl bg-[#F9FAFB] px-3 py-2.5">
              <View className="flex-row items-center justify-between gap-2">
                <Text
                  className="min-w-0 flex-1 text-[13px] font-semibold text-[#111827]"
                  numberOfLines={1}
                >
                  {authorName}
                </Text>
                <Text className="shrink-0 text-[11px] text-[#9CA3AF]">
                  {formatCommentTime(comment.createdAt)}
                </Text>
              </View>
              <Text className="mt-1 text-[13px] leading-5 text-[#374151]">
                {comment.content}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}
