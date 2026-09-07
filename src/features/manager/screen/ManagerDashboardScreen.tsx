import { useRouter } from "expo-router";
import { useMemo, useRef, useState } from "react";
import { View } from "react-native";

import { Screen } from "@/features/components/layout/Screen";
import { TabHeader } from "@/features/components/layout/TabHeader";
import { TeamPreview } from "@/features/employee/components/TeamPreview";
import { mapTaskResponseToEmployeeTask } from "@/features/employee/data/taskResponseAdapter";
import { AnalyticsHeroCard } from "@/features/manager/components/analytics/AnalyticsHeroCard";
import {
  ManagerAnalyticsBottomSheet,
  type ManagerAnalyticsBottomSheetRef,
} from "@/features/manager/components/analytics/ManagerAnalyticsBottomSheet";
import { DailyTasksSection } from "@/features/manager/components/dashboard/DailyTasksSection";
import { TopPerformersModal } from "@/features/manager/components/top-performers/TopPerformersModal";
import { toManagerAssignedKpis } from "@/features/manager/data/analytics";
import {
  toTopPerformers,
  type TopPerformer,
} from "@/features/manager/data/topPerformers";
import { useManagerAssignedKpi, useTasks } from "@/features/tasks/hooks/useTasks";
import { useCurrentUser } from "@/features/users/hooks/useUsers";

export default function ManagerDashboardScreen() {
  const router = useRouter();
  const [topPerformersOpen, setTopPerformersOpen] = useState(false);
  const analyticsSheetRef = useRef<ManagerAnalyticsBottomSheetRef>(null);

  const { data: currentUser } = useCurrentUser();
  const assignedById = currentUser?.id;

  // Same query ManagerAnalyticsSection runs — shares the React Query cache entry.
  const { data: assignedKpi } = useManagerAssignedKpi();
  const topPerformers = useMemo(
    () => toTopPerformers(assignedKpi?.topPerformers ?? []),
    [assignedKpi],
  );

  // Same query ManagerTasksScreen runs for its list — sharing the params
  // keeps this on the same React Query cache entry (no extra fetch).
  const { data: tasksPage } = useTasks(
    { assignedById, size: 200 },
    Boolean(assignedById),
  );
  const tasks = useMemo(
    () => (tasksPage?.content ?? []).map(mapTaskResponseToEmployeeTask),
    [tasksPage],
  );

  const openMemberDetails = (performer: TopPerformer) => {
    setTopPerformersOpen(false);
    router.push({
      pathname: "/(manager)/team/[id]",
      params: { id: performer.id },
    });
  };

  const openTeamMember = (member: { id: string }) => {
    router.push({
      pathname: "/(manager)/team/[id]",
      params: { id: member.id },
    });
  };

  const openTeamScreen = () => {
    router.push("/(manager)/(tabs)/team");
  };

  return (
    <>
      <Screen
        header={
          <TabHeader
            variant="profile"
            onAnalyzePress={() => analyticsSheetRef.current?.present()}
          />
        }
      >
        <View className="gap-6">
          {assignedKpi ? (
            <AnalyticsHeroCard kpis={toManagerAssignedKpis(assignedKpi)} />
          ) : null}
          <DailyTasksSection tasks={tasks} />
          <TeamPreview
            onSeeAll={openTeamScreen}
            onMemberPress={openTeamMember}
          />
        </View>
      </Screen>

      <ManagerAnalyticsBottomSheet
        ref={analyticsSheetRef}
        onSeeAllPerformers={() => setTopPerformersOpen(true)}
      />

      <TopPerformersModal
        visible={topPerformersOpen}
        performers={topPerformers}
        onClose={() => setTopPerformersOpen(false)}
        onViewDetails={openMemberDetails}
      />
    </>
  );
}
