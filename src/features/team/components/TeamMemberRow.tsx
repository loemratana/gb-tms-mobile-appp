import Ionicons from "@expo/vector-icons/Ionicons";
import { memo } from "react";
import { Pressable, Text, View } from "react-native";

import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { SkeletonBlock } from "@/components/ui/Skeleton";
import { StarRating } from "@/features/team/components/StarRating";
import type { LeaderboardEntry } from "@/features/team/types/leaderboard.types";
import type { TeamRosterMember } from "@/features/team/types/team.types";
import { callPhone, sendEmail } from "@/features/team/utils/contact";
import { formatScore } from "@/features/team/utils/leaderboardPeriod";
import { colors, palette } from "@/styles";

type TeamMemberRowProps = {
  member: TeamRosterMember;
  /** Their result for the chosen period; undefined when performance isn't shown or not found. */
  performance?: LeaderboardEntry;
  /** Show the performance line at all (only for viewers in a department). */
  hasPerformance?: boolean;
  isPerformanceLoading?: boolean;
  isMe?: boolean;
  /** Hairline above the row; off for the first row. */
  hasDivider?: boolean;
  onPress?: (member: TeamRosterMember) => void;
};

function PerformanceLine({ performance }: { performance: LeaderboardEntry | undefined }) {
  if (!performance?.rated || performance.stars === null) {
    return <Text className="text-label text-fg-faint">Not rated yet</Text>;
  }
  return (
    <View className="flex-row items-center gap-1.5">
      <StarRating value={performance.stars} size={12} />
      <Text className="text-label font-semibold text-fg">{formatScore(performance.score)}</Text>
      {performance.rank !== null ? (
        <Text className="text-label text-fg-faint">· #{performance.rank}</Text>
      ) : null}
    </View>
  );
}

/** A teammate in the roster: who they are, how they're doing this period, and quick contact. */
export const TeamMemberRow = memo(function TeamMemberRow({
  member,
  performance,
  hasPerformance = false,
  isPerformanceLoading = false,
  isMe = false,
  hasDivider = false,
  onPress,
}: TeamMemberRowProps) {
  const { phoneNumber } = member;
  const performanceLabel = !hasPerformance
    ? ""
    : performance?.rated
      ? `, rank ${performance.rank}, ${performance.stars} stars, score ${formatScore(performance.score)}`
      : ", not rated yet";

  return (
    <Pressable
      onPress={() => onPress?.(member)}
      accessibilityRole="button"
      accessibilityLabel={`${member.name}${isMe ? " (you)" : ""}, ${member.role}${member.isManager ? ", manager" : ""}${performanceLabel}`}
      accessibilityHint="Opens teammate details"
      className="flex-row items-center gap-3 px-4 py-3 active:bg-field"
    >
      {hasDivider ? <View className="absolute left-[72px] right-0 top-0 h-px bg-line-soft" /> : null}

      <Avatar name={member.name} imageUrl={member.avatarUrl} size={44} />

      <View className="min-w-0 flex-1">
        <View className="flex-row items-center gap-2">
          <Text className="shrink text-body font-semibold text-fg" numberOfLines={1}>
            {member.name}
            {isMe ? <Text className="font-normal text-brand-strong"> · You</Text> : null}
          </Text>
          {member.isManager ? <Badge label="Manager" tone="info" /> : null}
        </View>
        <Text className="mt-0.5 text-caption text-fg-soft" numberOfLines={1}>
          {member.role}
        </Text>
        {hasPerformance ? (
          <View className="mt-1">
            {isPerformanceLoading ? (
              <SkeletonBlock width={110} height={12} />
            ) : (
              <PerformanceLine performance={performance} />
            )}
          </View>
        ) : null}
      </View>

      <Pressable
        onPress={(event) => {
          event.stopPropagation();
          void sendEmail(member.email, member.name);
        }}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel={`Email ${member.name}`}
        accessibilityHint={member.email}
        className="h-9 w-9 items-center justify-center rounded-full bg-brand active:opacity-80"
      >
        <Ionicons name="mail" size={16} color={palette.white} />
      </Pressable>

      <Pressable
        onPress={
          phoneNumber
            ? (event) => {
                event.stopPropagation();
                void callPhone(phoneNumber, member.name);
              }
            : undefined
        }
        disabled={!phoneNumber}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel={`Call ${member.name}`}
        accessibilityHint={phoneNumber ?? "No phone number"}
        accessibilityState={{ disabled: !phoneNumber }}
        className={`h-9 w-9 items-center justify-center rounded-full ${phoneNumber ? "bg-success active:opacity-80" : "bg-subtle"}`}
      >
        <Ionicons name="call" size={16} color={phoneNumber ? palette.white : colors.textSubtle} />
      </Pressable>
    </Pressable>
  );
});
