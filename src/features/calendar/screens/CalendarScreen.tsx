import { useRouter } from "expo-router";
import { useMemo, useRef, useState } from "react";
import { ScrollView, View } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  SlideInLeft,
  SlideInRight,
  SlideOutLeft,
  SlideOutRight,
} from "react-native-reanimated";

import { getTaskDetailPathForRole } from "@/features/auth/utils/navigation";
import { AgendaCalendarView } from "@/features/calendar/components/AgendaCalendarView";
import { CalendarAgendaSkeleton } from "@/features/calendar/components/CalendarAgendaSkeleton";
import { CalendarHeader } from "@/features/calendar/components/CalendarHeader";
import type { CalendarViewMode } from "@/features/calendar/components/CalendarHeader";
import { MonthCalendarView } from "@/features/calendar/components/MonthCalendarView";
import {
  TaskOverviewBottomSheet,
  type TaskOverviewBottomSheetRef,
} from "@/features/calendar/components/TaskOverviewBottomSheet";
import { useCalendarTasks } from "@/features/calendar/hooks/useCalendarTasks";
import { getMonthSummary } from "@/features/calendar/utils/calendarTasks";
import { startOfMonth, toDateKey } from "@/features/calendar/utils/calendarDates";
import { useTabBarInset } from "@/components/navigation/ModernTabBar";
import { StateView } from "@/components/ui/StateView";
import type { TaskResponse } from "@/features/tasks/types/task.types";
import { useAuthStore } from "@/stores/authStore";

/** -1 = went to an earlier month, 1 = a later month, 0 = jumped (today / switched mode) — sets the slide direction. */
type NavDirection = -1 | 0 | 1;

/** Shared calendar tab for employees and managers: Schedule (agenda) and Month views. */
export default function CalendarScreen() {
  const router = useRouter();
  const role = useAuthStore((state) => state.user?.role);
  const tabBarInset = useTabBarInset();
  const overviewSheetRef = useRef<TaskOverviewBottomSheetRef>(null);

  const today = useMemo(() => new Date(), []);
  const [viewMode, setViewMode] = useState<CalendarViewMode>("month");
  const [selectedDate, setSelectedDate] = useState(today);
  const [monthDate, setMonthDate] = useState(() => startOfMonth(today));
  const [navDirection, setNavDirection] = useState<NavDirection>(0);

  const { tasks, isLoading, isError, refetch } = useCalendarTasks();

  const goToday = () => {
    const now = new Date();
    setNavDirection(0);
    setSelectedDate(now);
    setMonthDate(startOfMonth(now));
  };

  const handleSelectDate = (date: Date) => {
    setNavDirection(0);
    setSelectedDate(date);
    setMonthDate(startOfMonth(date));
  };

  const handleViewModeChange = (mode: CalendarViewMode) => {
    setNavDirection(0);
    setViewMode(mode);
  };

  const handleMonthGridChange = (date: Date) => {
    setNavDirection(date > monthDate ? 1 : -1);
    setMonthDate(date);
  };

  const handleMonthStep = (step: -1 | 1) => {
    const next = new Date(monthDate.getFullYear(), monthDate.getMonth() + step, 1);
    setNavDirection(step);
    setMonthDate(next);
  };

  const handleTaskPress = (task: TaskResponse) => {
    overviewSheetRef.current?.present(task);
  };

  const handleViewFullDetails = (task: TaskResponse) => {
    if (!role) return;
    router.push(getTaskDetailPathForRole(role, task.id));
  };

  const title = monthDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const summary = useMemo(
    () => (isLoading || isError ? null : getMonthSummary(tasks, monthDate)),
    [isLoading, isError, tasks, monthDate],
  );

  const contentKey = `${viewMode}-${toDateKey(monthDate)}`;
  const entering =
    navDirection === 1
      ? SlideInRight.duration(220)
      : navDirection === -1
        ? SlideInLeft.duration(220)
        : FadeIn.duration(160);
  const exiting =
    navDirection === 1
      ? SlideOutLeft.duration(220)
      : navDirection === -1
        ? SlideOutRight.duration(220)
        : FadeOut.duration(160);

  return (
    <View className="flex-1 bg-screen">
      <CalendarHeader
        viewMode={viewMode}
        title={title}
        summary={summary}
        onViewModeChange={handleViewModeChange}
        onToday={goToday}
        onPreviousMonth={() => handleMonthStep(-1)}
        onNextMonth={() => handleMonthStep(1)}
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: tabBarInset + 16,
        }}
      >
        {isLoading ? (
          <CalendarAgendaSkeleton />
        ) : isError ? (
          <StateView
            variant="error"
            title="Couldn't load tasks"
            message="Check your connection and try again"
            actionLabel="Retry"
            onPressAction={refetch}
          />
        ) : (
          <Animated.View key={contentKey} entering={entering} exiting={exiting}>
            {viewMode === "schedule" ? <AgendaCalendarView tasks={tasks} onTaskPress={handleTaskPress} /> : null}

            {viewMode === "month" ? (
              <MonthCalendarView
                monthDate={monthDate}
                selectedDate={selectedDate}
                tasks={tasks}
                onSelectDate={handleSelectDate}
                onMonthChange={handleMonthGridChange}
                onTaskPress={handleTaskPress}
              />
            ) : null}
          </Animated.View>
        )}
      </ScrollView>

      <TaskOverviewBottomSheet ref={overviewSheetRef} onViewFullDetails={handleViewFullDetails} />
    </View>
  );
}
