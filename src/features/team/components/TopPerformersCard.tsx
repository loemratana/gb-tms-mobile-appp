import Ionicons from "@expo/vector-icons/Ionicons";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { Avatar } from "@/components/ui/Avatar";
import { SkeletonBlock } from "@/components/ui/Skeleton";
import { StateView } from "@/components/ui/StateView";
import { LeaderboardPeriodPicker } from "@/features/team/components/LeaderboardPeriodPicker";
import { StarRating } from "@/features/team/components/StarRating";
import { useLeaderboard } from "@/features/team/hooks/useLeaderboard";
import type { LeaderboardEntry } from "@/features/team/types/leaderboard.types";
import {
  currentSelection,
  formatScore,
  toLeaderboardParams,
  type LeaderboardSelection,
} from "@/features/team/utils/leaderboardPeriod";
import { colors } from "@/styles";

const COLLAPSED_COUNT = 5;

/** Gold, silver and bronze rank circles; plain after third place. */
const RANK_STYLES: Record<number, string> = {
  1: "bg-warning-subtle border-warning-border",
  2: "bg-subtle border-line",
  3: "bg-brand-subtle border-brand-border",
};

type TopPerformersCardProps = {
  /** Highlights this person as "You". */
  currentUserId?: string;
  onPressMember?: (userId: string) => void;
};

function LeaderboardRow({
  entry,
  isMe,
  onPress,
}: {
  entry: LeaderboardEntry;
  isMe: boolean;
  onPress?: (userId: string) => void;
}) {
  const rank = entry.rank ?? 0;
  return (
    <Pressable
      onPress={onPress ? () => onPress(entry.userId) : undefined}
      accessibilityRole="button"
      accessibilityLabel={`Rank ${rank}, ${entry.fullName}${isMe ? " (you)" : ""}, ${entry.stars} stars, score ${formatScore(entry.score)}`}
      className={`flex-row items-center gap-3 rounded-xl px-2.5 py-2 active:bg-field ${isMe ? "bg-brand-subtle" : ""}`}
    >
      <View
        className={`h-7 w-7 items-center justify-center rounded-full border ${RANK_STYLES[rank] ?? "border-transparent"}`}
      >
        <Text className="text-caption font-bold text-fg">{rank}</Text>
      </View>
      <Avatar name={entry.fullName} imageUrl={entry.avatarUrl} size={36} />
      <View className="min-w-0 flex-1">
        <Text className="text-body-sm font-semibold text-fg" numberOfLines={1}>
          {entry.fullName}
          {isMe ? <Text className="font-normal text-brand-strong"> · You</Text> : null}
        </Text>
        <View className="mt-0.5 flex-row items-center gap-1.5">
          <StarRating value={entry.stars ?? 0} size={12} />
          <Text className="text-micro text-fg-faint" numberOfLines={1}>
            {entry.counts.tasks} tasks
          </Text>
        </View>
      </View>
      <View className="items-end">
        <Text className="text-body font-bold text-fg">{formatScore(entry.score)}</Text>
        <Text className="text-micro text-fg-faint">score</Text>
      </View>
    </Pressable>
  );
}

/**
 * The viewer's department ranked for a month or quarter (GET /performance/leaderboard).
 * Shows the top five, expandable to everyone rated; the unrated are summarised underneath.
 */
export function TopPerformersCard({ currentUserId, onPressMember }: TopPerformersCardProps) {
  const [selection, setSelection] = useState<LeaderboardSelection>(() => currentSelection("MONTHLY"));
  const [isExpanded, setIsExpanded] = useState(false);
  const params = useMemo(() => toLeaderboardParams(selection), [selection]);
  const leaderboardQuery = useLeaderboard(params);
  const leaderboard = leaderboardQuery.data;

  const rated = leaderboard?.entries.filter((entry) => entry.rated) ?? [];
  const unratedCount = (leaderboard?.entries.length ?? 0) - rated.length;
  const visible = isExpanded ? rated : rated.slice(0, COLLAPSED_COUNT);
  const myEntry = leaderboard?.entries.find((entry) => entry.userId === currentUserId);
  const isMeHidden = myEntry?.rated === true && !visible.some((entry) => entry.userId === currentUserId);

  const renderBody = () => {
    if (leaderboardQuery.isLoading) {
      return (
        <View className="gap-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <SkeletonBlock key={index} height={48} radius={12} className="w-full" />
          ))}
        </View>
      );
    }
    if (leaderboardQuery.isError || !leaderboard) {
      return (
        <StateView
          variant="error"
          icon="cloud-offline-outline"
          title="Couldn't load top performers"
          message="Check your connection and try again."
          actionLabel="Try again"
          onPressAction={() => void leaderboardQuery.refetch()}
          isCompact
        />
      );
    }
    if (rated.length === 0) {
      return (
        <View className="items-center py-4">
          <Ionicons name="trophy-outline" size={26} color={colors.textSubtle} />
          <Text className="mt-2 text-body-sm font-semibold text-fg">Nobody rated yet</Text>
          <Text className="mt-1 text-center text-caption text-fg-soft">
            People get stars once they have {leaderboard.minTasksForRating} tasks due or delivered in the period.
          </Text>
        </View>
      );
    }
    return (
      <View style={{ opacity: leaderboardQuery.isPlaceholderData ? 0.5 : 1 }}>
        <View className="gap-1">
          {visible.map((entry) => (
            <LeaderboardRow
              key={entry.userId}
              entry={entry}
              isMe={entry.userId === currentUserId}
              onPress={onPressMember}
            />
          ))}
          {isMeHidden && myEntry ? (
            <>
              <Text className="py-0.5 text-center text-micro text-fg-faint">• • •</Text>
              <LeaderboardRow entry={myEntry} isMe onPress={onPressMember} />
            </>
          ) : null}
        </View>

        {rated.length > COLLAPSED_COUNT ? (
          <Pressable
            onPress={() => setIsExpanded((value) => !value)}
            accessibilityRole="button"
            className="mt-2 items-center rounded-xl py-2 active:bg-field"
          >
            <Text className="text-label font-semibold text-brand-strong">
              {isExpanded ? "Show top 5" : `Show all ${rated.length}`}
            </Text>
          </Pressable>
        ) : null}

        {unratedCount > 0 ? (
          <Text className="mt-2 text-center text-micro text-fg-faint">
            {unratedCount} {unratedCount === 1 ? "person isn't" : "people aren't"} rated yet (fewer than{" "}
            {leaderboard.minTasksForRating} tasks)
          </Text>
        ) : null}
      </View>
    );
  };

  return (
    <View className="mx-4 rounded-2xl border border-line bg-surface p-4">
      <View className="mb-3 flex-row items-center gap-3">
        <View className="h-10 w-10 items-center justify-center rounded-xl bg-warning-subtle">
          <Ionicons name="trophy-outline" size={20} color={colors.warning} />
        </View>
        <View className="min-w-0 flex-1">
          <Text className="text-title font-bold text-fg" accessibilityRole="header">
            Top performers
          </Text>
          <Text className="text-caption text-fg-soft" numberOfLines={1}>
            {leaderboard?.departmentName ?? "Your department"}
          </Text>
        </View>
      </View>

      <LeaderboardPeriodPicker
        value={selection}
        onChange={(next) => {
          setSelection(next);
          setIsExpanded(false);
        }}
      />

      <View className="mt-3">{renderBody()}</View>
    </View>
  );
}
