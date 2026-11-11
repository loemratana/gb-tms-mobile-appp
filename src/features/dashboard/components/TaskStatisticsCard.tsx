import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, Text, View } from "react-native";

import { TasksPerMonthBarChart } from "./TasksPerMonthBarChart";
import type { MonthlyTaskCount } from "@/features/dashboard/utils/taskStatistics";
import { palette } from "@/styles";

type TaskStatisticsCardProps = {
  year: number;
  months: MonthlyTaskCount[];
  currentMonth: number | null;
  isCurrentYear: boolean;
  onPreviousYear: () => void;
  onNextYear: () => void;
  onCurrentYear: () => void;
};

type YearSwitcherProps = Pick<
  TaskStatisticsCardProps,
  "year" | "isCurrentYear" | "onPreviousYear" | "onNextYear" | "onCurrentYear"
>;

function YearSwitcher({
  year,
  isCurrentYear,
  onPreviousYear,
  onNextYear,
  onCurrentYear,
}: YearSwitcherProps) {
  return (
    <View className="flex-row items-center gap-1">
      {isCurrentYear ? null : (
        <Pressable
          onPress={onCurrentYear}
          accessibilityRole="button"
          accessibilityLabel="Back to this year"
          className="mr-1 rounded-lg px-2 py-1.5 active:bg-subtle"
        >
          <Text className="text-label font-semibold text-brand-strong">Today</Text>
        </Pressable>
      )}
      <Pressable
        onPress={onPreviousYear}
        accessibilityRole="button"
        accessibilityLabel="Previous year"
        className="h-8 w-8 items-center justify-center rounded-lg active:bg-subtle"
      >
        <Ionicons name="chevron-back" size={16} color={palette.gray[700]} />
      </Pressable>
      <Text className="min-w-[40px] text-center text-body-sm font-semibold text-fg">
        {year}
      </Text>
      <Pressable
        onPress={onNextYear}
        accessibilityRole="button"
        accessibilityLabel="Next year"
        className="h-8 w-8 items-center justify-center rounded-lg active:bg-subtle"
      >
        <Ionicons name="chevron-forward" size={16} color={palette.gray[700]} />
      </Pressable>
    </View>
  );
}

/** Total tasks per month (by due date) for the selected year. */
export function TaskStatisticsCard({ months, currentMonth, ...yearSwitcher }: TaskStatisticsCardProps) {
  const yearTotal = months.reduce((sum, item) => sum + item.count, 0);

  return (
    <View className="rounded-2xl border border-line bg-surface p-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-2">
          <Text className="text-caption font-semibold uppercase tracking-[1px] text-fg-faint">
            Task statistics
          </Text>
          <Text className="mt-1 text-label text-fg-soft">
            {yearTotal} task{yearTotal === 1 ? "" : "s"} due in {yearSwitcher.year}
          </Text>
        </View>
        <YearSwitcher {...yearSwitcher} />
      </View>

      <View className="mt-4">
        <TasksPerMonthBarChart months={months} highlightedMonth={currentMonth} />
      </View>
    </View>
  );
}
