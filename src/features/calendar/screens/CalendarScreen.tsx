import { useRouter } from "expo-router";
import { useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  SlideInLeft,
  SlideInRight,
  SlideOutLeft,
  SlideOutRight,
} from "react-native-reanimated";

import { getMeetingDetailPathForRole, getTaskDetailPathForRole } from "@/features/auth/utils/navigation";
import { AgendaCalendarView } from "@/features/calendar/components/AgendaCalendarView";
import { CalendarAgendaSkeleton } from "@/features/calendar/components/CalendarAgendaSkeleton";
import { CalendarHeader } from "@/features/calendar/components/CalendarHeader";
import type { CalendarViewMode } from "@/features/calendar/components/CalendarHeader";
import { MonthCalendarView } from "@/features/calendar/components/MonthCalendarView";
import {
  TaskOverviewBottomSheet,
  type TaskOverviewBottomSheetRef,
} from "@/features/calendar/components/TaskOverviewBottomSheet";
import { useCalendarMeetings } from "@/features/calendar/hooks/useCalendarMeetings";
import { useCalendarTasks } from "@/features/calendar/hooks/useCalendarTasks";
import { getMonthSummary } from "@/features/calendar/utils/calendarTasks";
import { startOfMonth, toDateKey } from "@/features/calendar/utils/calendarDates";
import { useTabBarInset } from "@/components/navigation/ModernTabBar";
import { StateView } from "@/components/ui/StateView";
import type { BookingResponse } from "@/features/meetings/types/meeting.types";
import type { TaskResponse } from "@/features/tasks/types/task.types";
import { useAuthStore } from "@/stores/authStore";

/** -1 = went to an earlier month, 1 = a later month, 0 = jumped (today / switched mode) — sets the slide direction. */
type NavDirection = -1 | 0 | 1;

/** Shared calendar tab: your meetings and task due dates together, as a month list (Schedule) or a month grid. */
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
  const calendarMeetings = useCalendarMeetings(monthDate);
  const { meetings } = calendarMeetings;

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

  const handleMeetingPress = (meeting: BookingResponse) => {
    if (!role) return;
    router.push(getMeetingDetailPathForRole(role, meeting.id));
  };

  const handleViewFullDetails = (task: TaskResponse) => {
    if (!role) return;
    router.push(getTaskDetailPathForRole(role, task.id));
  };

  const title = monthDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const summary = useMemo(
    () => (isLoading || isError ? null : getMonthSummary(tasks, meetings, monthDate)),
    [isLoading, isError, tasks, meetings, monthDate],
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
            {calendarMeetings.isError ? (
              <Pressable
                onPress={calendarMeetings.refetch}
                accessibilityRole="button"
                className="mb-3 flex-row items-center gap-2 rounded-xl bg-warning-subtle px-3 py-2.5"
              >
                <Text className="flex-1 text-caption text-warning-fg">Couldn&apos;t load meetings. Tap to retry.</Text>
              </Pressable>
            ) : null}

            {viewMode === "schedule" ? (
              <AgendaCalendarView
                monthDate={monthDate}
                tasks={tasks}
                meetings={meetings}
                onTaskPress={handleTaskPress}
                onMeetingPress={handleMeetingPress}
              />
            ) : null}

            {viewMode === "month" ? (
              <MonthCalendarView
                monthDate={monthDate}
                selectedDate={selectedDate}
                tasks={tasks}
                meetings={meetings}
                onSelectDate={handleSelectDate}
                onMonthChange={handleMonthGridChange}
                onTaskPress={handleTaskPress}
                onMeetingPress={handleMeetingPress}
              />
            ) : null}
          </Animated.View>
        )}
      </ScrollView>

      <TaskOverviewBottomSheet ref={overviewSheetRef} onViewFullDetails={handleViewFullDetails} />
    </View>
  );
}
