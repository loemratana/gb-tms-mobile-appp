import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, Text, View } from "react-native";

import { usePendingReviewSubmissions } from "@/features/tasks/hooks/useSubmissions";
import { palette } from "@/styles";

type ShortcutRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  title: string;
  subtitle: string;
  badgeCount?: number;
  onPress: () => void;
};

function ShortcutRow({
  icon,
  iconColor,
  iconBg,
  title,
  subtitle,
  badgeCount,
  onPress,
}: ShortcutRowProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      className="flex-row items-center gap-3 px-4 py-3.5 active:bg-field"
    >
      <View
        className="h-10 w-10 items-center justify-center rounded-xl"
        style={{ backgroundColor: iconBg }}
      >
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <View className="min-w-0 flex-1">
        <Text className="text-body-sm font-semibold text-fg">{title}</Text>
        <Text className="text-label text-fg-soft">{subtitle}</Text>
      </View>
      {badgeCount ? (
        <View className="min-w-6 items-center rounded-full bg-warning px-2 py-0.5">
          <Text className="text-label font-bold text-white">{badgeCount}</Text>
        </View>
      ) : null}
      <Ionicons name="chevron-forward" size={16} color={palette.gray[400]} />
    </Pressable>
  );
}

type DashboardShortcutsProps = {
  /** Show the review queue row (and fetch its count). Managers only. */
  canReview: boolean;
  onOpenReviewQueue?: () => void;
  onOpenMySubmissions: () => void;
  onOpenTeam: () => void;
  /** Second line of the Team row, e.g. "Your direct reports and department". */
  teamSubtitle: string;
};

/** Dashboard links: review queue (managers), the user's own submissions, and their team. */
export function DashboardShortcuts({
  canReview,
  onOpenReviewQueue,
  onOpenMySubmissions,
  onOpenTeam,
  teamSubtitle,
}: DashboardShortcutsProps) {
  // size 1: only the total is needed for the badge.
  const { data: pendingPage } = usePendingReviewSubmissions({ size: 1 }, canReview);
  const pendingCount = pendingPage?.totalElements ?? 0;

  return (
    <View className="overflow-hidden rounded-2xl border border-line bg-surface">
      {canReview && onOpenReviewQueue ? (
        <>
          <ShortcutRow
            icon="shield-checkmark-outline"
            iconColor={palette.amber[600]}
            iconBg={palette.amber[50]}
            title="Review queue"
            subtitle={
              pendingCount > 0
                ? `${pendingCount} submission${pendingCount === 1 ? "" : "s"} waiting for you`
                : "Nothing waiting for review"
            }
            badgeCount={pendingCount}
            onPress={onOpenReviewQueue}
          />
          <View className="mx-4 h-px bg-subtle" />
        </>
      ) : null}
      <ShortcutRow
        icon="paper-plane-outline"
        iconColor={palette.blue[600]}
        iconBg={palette.blue[50]}
        title="My submissions"
        subtitle="Work you've submitted and its review results"
        onPress={onOpenMySubmissions}
      />
      <View className="mx-4 h-px bg-subtle" />
      <ShortcutRow
        icon="people-outline"
        iconColor={palette.green[600]}
        iconBg={palette.green[50]}
        title="Team"
        subtitle={teamSubtitle}
        onPress={onOpenTeam}
      />
    </View>
  );
}
