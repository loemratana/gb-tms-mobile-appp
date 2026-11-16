import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, Text, View } from "react-native";

import { colors, palette } from "@/styles";

type ReviewsWaitingCardProps = {
  count: number;
  onPress: () => void;
};

/**
 * Top-of-dashboard call to action while work waits for the manager's review: reviewing is the
 * manager's main job and blocks the assignee until it's done, so it comes before the numbers.
 */
export function ReviewsWaitingCard({ count, onPress }: ReviewsWaitingCardProps) {
  const noun = count === 1 ? "submission" : "submissions";

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${count} ${noun} waiting for your review. Open the review queue`}
      className="flex-row items-center gap-3 rounded-2xl border border-warning-border bg-warning-subtle p-4 active:opacity-80"
    >
      <View className="h-11 w-11 items-center justify-center rounded-xl bg-surface">
        <Ionicons name="shield-checkmark" size={22} color={colors.warning} />
      </View>
      <View className="min-w-0 flex-1">
        <Text className="text-body font-bold text-warning-fg">
          {count} {noun} waiting
        </Text>
        <Text className="text-label text-warning-fg">The assignees are waiting on your decision.</Text>
      </View>
      <View className="flex-row items-center gap-1 rounded-full bg-warning px-3 py-1.5">
        <Text className="text-label font-semibold text-white">Review</Text>
        <Ionicons name="arrow-forward" size={14} color={palette.white} />
      </View>
    </Pressable>
  );
}
