import { useRouter } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { View } from "react-native";

import { Screen } from "@/components/layout/Screen";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StateView } from "@/components/ui/StateView";
import { TabHeader } from "@/components/layout/TabHeader";
import { TeamPreview } from "@/features/team/components/TeamPreview";
import {
  ManagerAnalyticsBottomSheet,
  type ManagerAnalyticsBottomSheetRef,
} from "@/features/dashboard/components/analytics/ManagerAnalyticsBottomSheet";
import { DashboardShortcuts } from "@/features/dashboard/components/DashboardShortcuts";
import { ManagerDashboardSkeleton } from "@/features/dashboard/components/ManagerDashboardSkeleton";
import { MyWorkSection } from "@/features/dashboard/components/MyWorkSection";
import { ReviewsWaitingCard } from "@/features/dashboard/components/ReviewsWaitingCard";
import { useMyWorkTasks } from "@/features/dashboard/hooks/useMyWorkTasks";
import { TaskStatusStats } from "@/features/tasks/components/shared/TaskStatusStats";
import { TopPerformersModal } from "@/features/dashboard/components/TopPerformersModal";
import {
  toTopPerformers,
  type TopPerformer,
} from "@/features/dashboard/utils/topPerformers";
import { usePendingReviewCount } from "@/features/tasks/hooks/usePendingReviewCount";
import { useManagerAssignedKpi, useTaskCounts } from "@/features/tasks/hooks/useTasks";
import { toTaskStatusCounts } from "@/features/tasks/utils/taskStatusCounts";
import type { StatusFilter, Task } from "@/features/tasks/types/taskView.types";
import { useCurrentUser } from "@/features/users/hooks/useUsers";
import { useRefetchOnFocus } from "@/hooks/useRefetchOnFocus";

export default function ManagerDashboardScreen() {
  const router = useRouter();
  const [topPerformersOpen, setTopPerformersOpen] = useState(false);
  const analyticsSheetRef = useRef<ManagerAnalyticsBottomSheetRef>(null);

  const { data: currentUser, isLoading: isLoadingUser } = useCurrentUser();
  const assignedById = currentUser?.id;

  // Same query ManagerAnalyticsSection runs — shares the React Query cache entry.
  // Only feeds the top performers modal, so it doesn't gate the dashboard.
  const { data: assignedKpi } = useManagerAssignedKpi();
  const topPerformers = useMemo(
    () => toTopPerformers(assignedKpi?.topPerformers ?? []),
    [assignedKpi],
  );

  // Overview numbers come from the server: counting the fetched page would stop at its 200-row cap.
  const {
    data: taskCounts,
    isLoading: isLoadingCounts,
    isError: isCountsError,
    refetch: refetchCounts,
  } = useTaskCounts({ assignedById, topLevelOnly: true }, Boolean(assignedById));
  const { count: pendingReviewCount, refetch: refetchPendingReviews } = usePendingReviewCount();
  // Managers get tasks too; their Tasks tab only lists what they handed out.
  const myWork = useMyWorkTasks(currentUser?.id);
  const { refetch: refetchMyWork } = myWork;
  const refetchDashboard = useCallback(() => {
    void refetchCounts();
    refetchPendingReviews();
    refetchMyWork();
  }, [refetchCounts, refetchPendingReviews, refetchMyWork]);
  useRefetchOnFocus(refetchDashboard);
  const statusCounts = useMemo(() => toTaskStatusCounts(taskCounts), [taskCounts]);

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

  const openReviewQueue = () => {
    router.push("/(manager)/reviews");
  };

  const openTask = (task: Task) => {
    router.push({ pathname: "/(manager)/tasks/[id]", params: { id: task.id } });
  };

  const openTeamScreen = () => {
    router.push("/(manager)/team");
  };

  // Each card opens Tasks on the tab that lists exactly the tasks it counted.
  const openTasksScreen = (status: StatusFilter) => {
    router.push({ pathname: "/(manager)/(tabs)/tasks", params: { status } });
  };

  const isLoadingDashboard = isLoadingUser || isLoadingCounts;

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
        {isLoadingDashboard ? (
          <ManagerDashboardSkeleton />
        ) : (
          <View className="gap-6">
            {isCountsError ? (
              <StateView
                variant="error"
                title="Couldn't load your tasks"
                message="Check your connection and try again."
                actionLabel="Try again"
                onPressAction={refetchDashboard}
                isCompact
              />
            ) : (
              <View>
                <SectionHeader title="Overview" />
                <TaskStatusStats counts={statusCounts} onPressStatus={openTasksScreen} />
              </View>
            )}
            {pendingReviewCount > 0 ? (
              <ReviewsWaitingCard count={pendingReviewCount} onPress={openReviewQueue} />
            ) : null}
            <DashboardShortcuts
              canReview
              onOpenReviewQueue={openReviewQueue}
              onOpenMySubmissions={() => router.push("/(manager)/submissions")}
              onOpenTeam={openTeamScreen}
              teamSubtitle="Your direct reports and department"
            />
            <TeamPreview
              onSeeAll={openTeamScreen}
              onMemberPress={openTeamMember}
            />
            {myWork.isError ? (
              <StateView
                variant="error"
                title="Couldn't load your own tasks"
                message="Check your connection and try again."
                actionLabel="Try again"
                onPressAction={myWork.refetch}
                isCompact
              />
            ) : myWork.total > 0 ? (
              <MyWorkSection
                tasks={myWork.tasks}
                onTaskPress={openTask}
                onSeeAll={() => router.push("/(manager)/my-tasks")}
              />
            ) : null}
          </View>
        )}
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
