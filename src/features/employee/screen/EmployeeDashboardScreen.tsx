import { useRouter } from "expo-router";
import {
  AlertTriangle,
  CheckCircle2,
  ListTodo,
  TrendingUp,
  type LucideIcon,
} from "lucide-react-native";
import { useMemo } from "react";
import { Pressable, Text, View } from "react-native";

import { Screen } from "@/features/components/layout/Screen";
import { TabHeader } from "@/features/components/layout/TabHeader";
import { TeamPreview } from "@/features/employee/components/TeamPreview";
import { mapTaskResponseToEmployeeTask } from "@/features/employee/data/taskResponseAdapter";
import { computeTaskStatCounts, selectActiveTasks } from "@/features/employee/utils/taskStats";
import { useTasks } from "@/features/tasks/hooks/useTasks";
import { useCurrentUser } from "@/features/users/hooks/useUsers";
import TodayTasks from "../components/TodayTasksProps";

type KpiTileProps = {
  label: string;
  value: number;
  caption: string;
  icon: LucideIcon;
  tint: string;
  onPress?: () => void;
};

function KpiTile({ label, value, caption, icon: Icon, tint, onPress }: KpiTileProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityLabel={`${label}: ${value}, ${caption}`}
      className="min-w-0 flex-1 rounded-2xl border border-[#E5E7EB] bg-white p-4"
      style={{
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 1,
      }}
    >
      <View
        className="h-9 w-9 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${tint}14` }}
      >
        <Icon size={17} color={tint} strokeWidth={2.2} />
      </View>

      <Text className="mt-3 text-[26px] font-bold text-[#111827]">{value}</Text>
      <Text className="mt-0.5 text-[12px] font-semibold text-[#111827]" numberOfLines={1}>
        {label}
      </Text>
      <Text className="mt-0.5 text-[11px] text-[#9CA3AF]" numberOfLines={1}>
        {caption}
      </Text>
    </Pressable>
  );
}

export default function EmployeeDashboardScreen() {
  const router = useRouter();
  const { data: currentUser } = useCurrentUser();
  const { data: tasksPage } = useTasks(
    { assigneeId: currentUser?.id, size: 200 },
    Boolean(currentUser?.id),
  );

  const myTasks = useMemo(
    () => (tasksPage?.content ?? []).map(mapTaskResponseToEmployeeTask),
    [tasksPage],
  );

  const activeTasks = useMemo(() => selectActiveTasks(myTasks), [myTasks]);

  const goToMyTasks = () => router.push("/(employee)/(tabs)/my-tasks");

  const stats = useMemo(() => {
    const counts = computeTaskStatCounts(myTasks);

    return [
      {
        label: "My Tasks",
        value: counts.total,
        caption: "Assigned to you",
        icon: ListTodo,
        tint: "#2563EB",
      },
      {
        label: "In Progress",
        value: counts.inProgress,
        caption: "Currently active",
        icon: TrendingUp,
        tint: "#7C3AED",
      },
      {
        label: "Completed",
        value: counts.completed,
        caption: "All time",
        icon: CheckCircle2,
        tint: "#16A34A",
      },
      {
        label: "Overdue",
        value: counts.overdue,
        caption: "Needs attention",
        icon: AlertTriangle,
        tint: "#EF4444",
      },
    ];
  }, [myTasks]);

  return (
    <Screen header={<TabHeader variant="profile" />}>
      <View className="gap-6">
        <View>
          <View className="mb-3">
            <Text className="text-[13px] font-semibold uppercase tracking-[1px] text-[#9CA3AF]">
              Overview
            </Text>
            <Text className="mt-1 text-[18px] font-bold tracking-tight text-[#111827]">
              Your work today
            </Text>
          </View>

          <View className="gap-3">
            <View className="flex-row gap-3">
              <KpiTile {...stats[0]} onPress={goToMyTasks} />
              <KpiTile {...stats[1]} onPress={goToMyTasks} />
            </View>
            <View className="flex-row gap-3">
              <KpiTile {...stats[2]} onPress={goToMyTasks} />
              <KpiTile {...stats[3]} onPress={goToMyTasks} />
            </View>
          </View>
        </View>

        <TodayTasks
          tasks={activeTasks}
          onSeeAll={goToMyTasks}
          onTaskPress={(task) =>
            router.push({ pathname: "/(employee)/tasks/[id]", params: { id: task.id } })
          }
        />

        <TeamPreview
          onMemberPress={(member) =>
            router.push({ pathname: "/(employee)/team/[id]", params: { id: member.id } })
          }
        />
      </View>
    </Screen>
  );
}
