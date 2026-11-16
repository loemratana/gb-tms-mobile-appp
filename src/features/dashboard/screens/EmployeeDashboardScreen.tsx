import { useRouter } from "expo-router";
import { useCallback, useMemo } from "react";
import { View } from "react-native";

import { Screen } from "@/components/layout/Screen";
import { TabHeader } from "@/components/layout/TabHeader";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StateView } from "@/components/ui/StateView";
import { StatsGrid } from "@/components/ui/StatsGrid";
import { canAssignTasks } from "@/features/auth/utils/permissions";
import { AssignedByMeSection } from "@/features/dashboard/components/AssignedByMeSection";
import { DashboardShortcuts } from "@/features/dashboard/components/DashboardShortcuts";
import { MyWorkSection } from "@/features/dashboard/components/MyWorkSection";
import { EmployeeDashboardSkeleton } from "@/features/dashboard/components/EmployeeDashboardSkeleton";
import { TeamPreview } from "@/features/team/components/TeamPreview";
import { toTaskStatCounts } from "@/features/tasks/utils/taskStats";
import type { StatusFilter } from "@/features/tasks/types/taskView.types";
import { useMyWorkTasks } from "@/features/dashboard/hooks/useMyWorkTasks";
import { useTaskCounts } from "@/features/tasks/hooks/useTasks";
import { useCurrentUser } from "@/features/users/hooks/useUsers";
import { useRefetchOnFocus } from "@/hooks/useRefetchOnFocus";

export default function EmployeeDashboardScreen() {
  const router = useRouter();
  const { data: currentUser } = useCurrentUser();
  // Employees granted a tasks:assign:* permission (e.g. team leads) also see what they've handed out.
  const canAssign = canAssignTasks(currentUser);
  const {
    tasks: myTasks,
    isLoading: isLoadingTasks,
    isError: isTasksError,
    refetch: refetchTasks,
  } = useMyWorkTasks(currentUser?.id);

  // Overview numbers come from the server: counting the fetched page would stop at its 200-row cap.
  // excludeNestedSubtasks counts exactly the rows My Tasks lists. (topLevelOnly dropped every subtask,
  // so tasks given to a whole department or position — each person's copy is a subtask — went uncounted.)
  const { data: taskCounts, isError: isCountsError, refetch: refetchCounts } = useTaskCounts(
    { assigneeId: currentUser?.id, excludeNestedSubtasks: true },
    Boolean(currentUser?.id),
  );
  const refetchDashboard = useCallback(() => {
    refetchTasks();
    void refetchCounts();
  }, [refetchTasks, refetchCounts]);
  useRefetchOnFocus(refetchDashboard);

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
        {/* A failed load must not read as "0 tasks, nothing due". */}
        {isTasksError || isCountsError ? (
          <StateView
            variant="error"
            title="Couldn't load your tasks"
            message="Check your connection and try again."
            actionLabel="Try again"
            onPressAction={refetchDashboard}
            isCompact
          />
        ) : null}

        {isCountsError ? null : (
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
        )}

        {canAssign ? <AssignedByMeSection /> : null}

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

        {isTasksError ? null : (
          <MyWorkSection
            tasks={myTasks}
            onSeeAll={goToMyTasks("all")}
            onTaskPress={(task) =>
              router.push({ pathname: "/(employee)/tasks/[id]", params: { id: task.id } })
            }
          />
        )}
      </View>
    </Screen>
  );
}
