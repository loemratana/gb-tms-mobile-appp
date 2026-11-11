import { useRouter } from "expo-router";
import { useCallback, useMemo } from "react";
import { View } from "react-native";

import { Screen } from "@/components/layout/Screen";
import { TabHeader } from "@/components/layout/TabHeader";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatsGrid } from "@/components/ui/StatsGrid";
import { canAssignTasks } from "@/features/auth/utils/permissions";
import { AssignedByMeSection } from "@/features/dashboard/components/AssignedByMeSection";
import { DashboardShortcuts } from "@/features/dashboard/components/DashboardShortcuts";
import { MyWorkSection } from "@/features/dashboard/components/MyWorkSection";
import { EmployeeDashboardSkeleton } from "@/features/dashboard/components/EmployeeDashboardSkeleton";
import { TeamPreview } from "@/features/team/components/TeamPreview";
import { mapTaskResponseToEmployeeTask } from "@/features/tasks/utils/taskResponseAdapter";
import { toTaskStatCounts } from "@/features/tasks/utils/taskStats";
import type { StatusFilter } from "@/features/tasks/types/taskView.types";
import { useTaskCounts, useTasks } from "@/features/tasks/hooks/useTasks";
import { useCurrentUser } from "@/features/users/hooks/useUsers";
import { useRefetchOnFocus } from "@/hooks/useRefetchOnFocus";

export default function EmployeeDashboardScreen() {
  const router = useRouter();
  const { data: currentUser } = useCurrentUser();
  // Employees granted a tasks:assign:* permission (e.g. team leads) also see what they've handed out.
  const canAssign = canAssignTasks(currentUser);
  const {
    data: tasksPage,
    isLoading: isLoadingTasks,
    refetch: refetchTasks,
  } = useTasks(
    { assigneeId: currentUser?.id, size: 200 },
    Boolean(currentUser?.id),
  );

  // Overview numbers come from the server: counting the fetched page would stop at its 200-row cap.
  const { data: taskCounts, refetch: refetchCounts } = useTaskCounts(
    { assigneeId: currentUser?.id, topLevelOnly: true },
    Boolean(currentUser?.id),
  );
  const refetchDashboard = useCallback(() => {
    void refetchTasks();
    void refetchCounts();
  }, [refetchTasks, refetchCounts]);
  useRefetchOnFocus(refetchDashboard);

  const myTasks = useMemo(
    () => (tasksPage?.content ?? []).map(mapTaskResponseToEmployeeTask),
    [tasksPage],
  );

  // Each card opens My Tasks on the tab that lists exactly the tasks it counted.
  const goToMyTasks = (status: StatusFilter) => () =>
    router.push({ pathname: "/(employee)/(tabs)/my-tasks", params: { status } });

  const counts = useMemo(() => toTaskStatCounts(taskCounts), [taskCounts]);

  if (isLoadingTasks) {
    return (
      <Screen header={<TabHeader variant="profile" />}>
        <EmployeeDashboardSkeleton />
      </Screen>
    );
  }

  return (
    <Screen header={<TabHeader variant="profile" />}>
      <View className="gap-6">
        <View>
          <SectionHeader title="Overview" />
          <StatsGrid
            items={[
              { title: "My tasks", value: counts.total, icon: "list-outline", tone: "neutral", onPress: goToMyTasks("all") },
              { title: "In progress", value: counts.inProgress, icon: "trending-up", tone: "info", onPress: goToMyTasks("in_progress") },
              { title: "Completed", value: counts.completed, icon: "checkmark-circle-outline", tone: "success", onPress: goToMyTasks("done") },
              { title: "Overdue", value: counts.overdue, icon: "warning-outline", tone: "error", onPress: goToMyTasks("overdue") },
            ]}
          />
        </View>

        {canAssign ? <AssignedByMeSection /> : null}

        <MyWorkSection
          tasks={myTasks}
          onSeeAll={goToMyTasks("all")}
          onTaskPress={(task) =>
            router.push({ pathname: "/(employee)/tasks/[id]", params: { id: task.id } })
          }
        />

        <DashboardShortcuts
          canReview={false}
          onOpenMySubmissions={() => router.push("/(employee)/submissions")}
          onOpenTeam={() => router.push("/(employee)/team")}
          teamSubtitle="Teammates in your department"
        />

        <TeamPreview
          onSeeAll={() => router.push("/(employee)/team")}
          onMemberPress={(member) =>
            router.push({ pathname: "/(employee)/team/[id]", params: { id: member.id } })
          }
        />
      </View>
    </Screen>
  );
}
