import Ionicons from "@expo/vector-icons/Ionicons";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { SkeletonBlock } from "@/components/ui/Skeleton";
import { StateView } from "@/components/ui/StateView";
import { PerformanceCard } from "@/features/team/components/PerformanceCard";
import { PerformanceRangeSheet } from "@/features/team/components/PerformanceRangeSheet";
import {
  DEFAULT_PERFORMANCE_RANGE,
  formatPerformanceRange,
  getRangeEndpoints,
  toPerformanceParams,
  type PerformanceRange,
} from "@/features/team/utils/performancePeriod";
import { useUserPerformance } from "@/features/users/hooks/useUsers";
import { colors } from "@/styles";

type PerformanceOverviewProps = {
  /** Section heading, e.g. "Performance" or "My performance". */
  title: string;
  userId: string | undefined;
};

/** Heading with a period chip, then one user's performance card (GET /users/{id}/performance). */
export function PerformanceOverview({ title, userId }: PerformanceOverviewProps) {
  const [range, setRange] = useState<PerformanceRange>(DEFAULT_PERFORMANCE_RANGE);
  const [isRangeSheetOpen, setIsRangeSheetOpen] = useState(false);
  const params = useMemo(() => toPerformanceParams(range), [range]);
  const performanceQuery = useUserPerformance(userId, params);
  const performance = performanceQuery.data;

  const chipLabel = range.kind === "custom" ? "Custom" : formatPerformanceRange(range);
  const { from, to } = getRangeEndpoints(range);
  const datesLabel = range.kind === "all" ? "All tasks so far" : `${from} – ${to}`;

  const handleApplyRange = (next: PerformanceRange) => {
    setRange(next);
    setIsRangeSheetOpen(false);
  };

  return (
    <View>
      <View className="mb-3 flex-row items-start justify-between gap-3">
        <View className="min-w-0 flex-1">
          <Text className="text-title font-semibold text-fg" accessibilityRole="header" numberOfLines={1}>
            {title}
          </Text>
          <Text className="mt-0.5 text-caption text-fg-soft" numberOfLines={1}>
            {datesLabel}
          </Text>
        </View>
        <Pressable
          onPress={() => setIsRangeSheetOpen(true)}
          accessibilityRole="button"
          accessibilityLabel={`Period: ${chipLabel}, ${datesLabel}`}
          accessibilityHint="Choose the dates for these numbers"
          className="flex-row items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 active:bg-field"
        >
          <Ionicons name="calendar-outline" size={14} color={colors.brandStrong} />
          <Text className="text-label font-semibold text-brand-strong">{chipLabel}</Text>
          <Ionicons name="chevron-down" size={14} color={colors.brandStrong} />
        </Pressable>
      </View>

      {performanceQuery.isLoading || !userId ? (
        <SkeletonBlock height={300} radius={16} className="w-full" />
      ) : performanceQuery.isError || !performance ? (
        <StateView
          variant="error"
          icon="cloud-offline-outline"
          title="Couldn't load performance"
          message="Check your connection and try again."
          actionLabel="Try again"
          onPressAction={() => void performanceQuery.refetch()}
          isCompact
        />
      ) : (
        // Previous period's numbers stay visible, dimmed, while the newly selected period loads.
        <View style={{ opacity: performanceQuery.isPlaceholderData ? 0.5 : 1 }}>
          <PerformanceCard performance={performance} />
        </View>
      )}

      <PerformanceRangeSheet
        visible={isRangeSheetOpen}
        value={range}
        onClose={() => setIsRangeSheetOpen(false)}
        onApply={handleApplyRange}
      />
    </View>
  );
}
