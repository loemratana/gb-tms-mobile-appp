import { useMemo, useState } from "react";
import { Text, View } from "react-native";

import { ProgressBar } from "@/components/ui/ProgressBar";
import { SkeletonBlock } from "@/components/ui/Skeleton";
import { StateView } from "@/components/ui/StateView";
import { LeaderboardPeriodPicker } from "@/features/team/components/LeaderboardPeriodPicker";
import { StarRating } from "@/features/team/components/StarRating";
import { useLeaderboard } from "@/features/team/hooks/useLeaderboard";
import type { LeaderboardComponents } from "@/features/team/types/leaderboard.types";
import {
  currentSelection,
  formatScore,
  toLeaderboardParams,
  type LeaderboardSelection,
} from "@/features/team/utils/leaderboardPeriod";
import type { Tone } from "@/styles";

type MemberRatingCardProps = {
  userId: string;
  /** The person's department; the rating is their place in its ranking. */
  departmentId: string;
};

/** What each part of the score measures, in the order the backend weighs them (30/25/20/15/10). */
const COMPONENT_ROWS: { key: keyof LeaderboardComponents; label: string }[] = [
  { key: "onTime", label: "On time" },
  { key: "quality", label: "Quality (few rejections)" },
  { key: "completion", label: "Completion" },
  { key: "overdue", label: "No overdue work" },
  { key: "speed", label: "Speed" },
];

function toneFor(value: number): Tone {
  if (value >= 80) return "success";
  if (value >= 50) return "warning";
  return "error";
}

/** One person's stars, rank and score breakdown for a month or quarter (from the department leaderboard). */
export function MemberRatingCard({ userId, departmentId }: MemberRatingCardProps) {
  const [selection, setSelection] = useState<LeaderboardSelection>(() => currentSelection("MONTHLY"));
  const params = useMemo(() => toLeaderboardParams(selection, departmentId), [selection, departmentId]);
  const leaderboardQuery = useLeaderboard(params);
  const leaderboard = leaderboardQuery.data;
  const entry = leaderboard?.entries.find((candidate) => candidate.userId === userId);
  const ratedCount = leaderboard?.entries.filter((candidate) => candidate.rated).length ?? 0;

  const renderBody = () => {
    if (leaderboardQuery.isLoading) return <SkeletonBlock height={180} radius={12} className="w-full" />;
    if (leaderboardQuery.isError || !leaderboard) {
      return (
        <StateView
          variant="error"
          icon="cloud-offline-outline"
          title="Couldn't load the rating"
          message="Check your connection and try again."
          actionLabel="Try again"
          onPressAction={() => void leaderboardQuery.refetch()}
          isCompact
        />
      );
    }
    if (!entry || !entry.rated) {
      const tasks = entry?.counts.tasks ?? 0;
      return (
        <View className="items-center py-3">
          <StarRating value={0} size={20} />
          <Text className="mt-2 text-body-sm font-semibold text-fg">Not rated yet</Text>
          <Text className="mt-1 text-center text-caption text-fg-soft">
            {tasks} of {leaderboard.minTasksForRating} tasks needed in this period.
          </Text>
        </View>
      );
    }
    return (
      <View style={{ opacity: leaderboardQuery.isPlaceholderData ? 0.5 : 1 }}>
        <View className="flex-row items-center justify-between">
          <View>
            <StarRating value={entry.stars ?? 0} size={22} />
            <Text className="mt-1 text-caption text-fg-soft">
              Rank <Text className="font-bold text-fg">{entry.rank}</Text> of {ratedCount} in{" "}
              {leaderboard.departmentName}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-display font-bold text-fg">{formatScore(entry.score)}</Text>
            <Text className="text-micro text-fg-faint">score / 100</Text>
          </View>
        </View>

        <View className="mt-4 gap-2.5">
          {COMPONENT_ROWS.map(({ key, label }) => {
            const value = entry.components[key];
            return (
              <View key={key} className="gap-1">
                <View className="flex-row justify-between">
                  <Text className="text-caption text-fg-soft">{label}</Text>
                  <Text className="text-caption font-semibold text-fg">{value === null ? "—" : Math.round(value)}</Text>
                </View>
                <ProgressBar value={value ?? 0} tone={value === null ? "faint" : toneFor(value)} accessibilityLabel={label} />
              </View>
            );
          })}
        </View>

        <View className="mt-4 flex-row justify-between border-t border-line-soft pt-3">
          {[
            { label: "Tasks", value: entry.counts.tasks },
            { label: "On time", value: entry.counts.onTime },
            { label: "Late", value: entry.counts.late },
            { label: "Rejected", value: entry.counts.rejections },
            { label: "Overdue", value: entry.counts.overdue },
          ].map((stat) => (
            <View key={stat.label} className="items-center">
              <Text className="text-body font-bold text-fg">{stat.value}</Text>
              <Text className="text-micro text-fg-faint">{stat.label}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View>
      <Text className="mb-3 text-title font-semibold text-fg" accessibilityRole="header">
        Star rating
      </Text>
      <View className="rounded-2xl border border-line bg-surface p-4">
        <LeaderboardPeriodPicker value={selection} onChange={setSelection} />
        <View className="mt-4">{renderBody()}</View>
      </View>
    </View>
  );
}
