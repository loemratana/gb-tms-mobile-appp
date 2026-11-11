import { useMemo, useState } from "react";
import { View } from "react-native";

import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { SkeletonBlock } from "@/components/ui/Skeleton";
import { StateView } from "@/components/ui/StateView";
import { PerformanceCard } from "@/features/team/components/PerformanceCard";
import {
  PERFORMANCE_PERIOD_OPTIONS,
  toPerformanceParams,
  type PerformancePeriod,
} from "@/features/team/utils/performancePeriod";
import { useUserPerformance } from "@/features/users/hooks/useUsers";

type PerformanceOverviewProps = {
  userId: string | undefined;
};

/** Period filter + performance card for one user, from GET /users/{id}/performance. Callers render their own heading. */
export function PerformanceOverview({ userId }: PerformanceOverviewProps) {
  const [period, setPeriod] = useState<PerformancePeriod>("all");
  const params = useMemo(() => toPerformanceParams(period), [period]);
  const performanceQuery = useUserPerformance(userId, params);
  const performance = performanceQuery.data;

  return (
    <View>
      <View className="mb-3">
        <SegmentedControl options={PERFORMANCE_PERIOD_OPTIONS} value={period} onChange={setPeriod} />
      </View>
      {performanceQuery.isLoading || !userId ? (
        <SkeletonBlock height={212} radius={16} className="w-full" />
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
    </View>
  );
}
