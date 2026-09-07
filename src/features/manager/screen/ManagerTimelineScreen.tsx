import { useRouter } from "expo-router";
import { useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
    FadeIn,
    FadeOut,
    SlideInLeft,
    SlideInRight,
    SlideOutLeft,
    SlideOutRight,
} from "react-native-reanimated";

import { AgendaCalendarView } from "@/features/manager/components/calendar/AgendaCalendarView";
import { CalendarAgendaSkeleton } from "@/features/manager/components/calendar/CalendarAgendaSkeleton";
import { CalendarHeader } from "@/features/manager/components/calendar/CalendarHeader";
import type { CalendarViewMode } from "@/features/manager/components/calendar/CalendarViewToggle";
import { DayCalendarView } from "@/features/manager/components/calendar/DayCalendarView";
import { MonthCalendarView } from "@/features/manager/components/calendar/MonthCalendarView";
import { SwipeableCalendarView } from "@/features/manager/components/calendar/SwipeableCalendarView";
import {
    TaskOverviewBottomSheet,
    type TaskOverviewBottomSheetRef,
} from "@/features/manager/components/calendar/TaskOverviewBottomSheet";
import { WeekCalendarView } from "@/features/manager/components/calendar/WeekCalendarView";
import { toDateKey } from "@/features/manager/data/timeline";
import { useTasks } from "@/features/tasks/hooks/useTasks";
import type { TaskResponse } from "@/features/tasks/types/task.types";

/** Calendar has no server-side date-range filter, so pull a generous page and group client-side. */
const CALENDAR_TASKS_PAGE_SIZE = 200;

/** -1 = navigated back, 1 = navigated forward, 0 = jumped directly (today / tapped a date / switched mode) — drives which way the content slides in. */
type NavDirection = -1 | 0 | 1;

export default function ManagerTimelineScreen() {
  const router = useRouter();
  const overviewSheetRef = useRef<TaskOverviewBottomSheetRef>(null);
  const today = useMemo(() => new Date(), []);
  const [viewMode, setViewMode] = useState<CalendarViewMode>("month");
  const [selectedDate, setSelectedDate] = useState(today);
  const [monthDate, setMonthDate] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [navDirection, setNavDirection] = useState<NavDirection>(0);

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useTasks({ size: CALENDAR_TASKS_PAGE_SIZE, sort: "dueDate,asc" });
  const tasks = useMemo(
    () => (data?.content ?? []).filter((task) => task.dueDate),
    [data],
  );

  const goToday = () => {
    const now = new Date();
    setNavDirection(0);
    setSelectedDate(now);
    setMonthDate(new Date(now.getFullYear(), now.getMonth(), 1));
  };

  const goPrevious = () => {
    setNavDirection(-1);
    const next = new Date(selectedDate);
    next.setDate(next.getDate() - (viewMode === "week" ? 7 : 1));
    setSelectedDate(next);
  };

  const goNext = () => {
    setNavDirection(1);
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + (viewMode === "week" ? 7 : 1));
    setSelectedDate(next);
  };

  const handleSelectDate = (date: Date) => {
    setNavDirection(0);
    setSelectedDate(date);
    setMonthDate(new Date(date.getFullYear(), date.getMonth(), 1));
  };

  const handleOpenDay = (date: Date) => {
    setNavDirection(0);
    setSelectedDate(date);
    setMonthDate(new Date(date.getFullYear(), date.getMonth(), 1));
    setViewMode("day");
  };

  const handleViewModeChange = (mode: CalendarViewMode) => {
    setNavDirection(0);
    setViewMode(mode);
  };

  const handleMonthGridChange = (date: Date) => {
    setNavDirection(date > monthDate ? 1 : -1);
    setMonthDate(date);
  };

  const handleTaskPress = (task: TaskResponse) => {
    overviewSheetRef.current?.present(task);
  };

  const handleViewFullDetails = (task: TaskResponse) => {
    router.push({
      pathname: "/(manager)/tasks/[id]",
      params: { id: task.id },
    });
  };

  const triggerLabel = (viewMode === "month" ? monthDate : selectedDate).toLocaleDateString(
    "en-US",
    { month: "long" },
  );

  const contentKey = `${viewMode}-${toDateKey(viewMode === "month" ? monthDate : selectedDate)}`;
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
    <View className="flex-1 bg-[#F5F7FB]">
      <SafeAreaView edges={["top"]} className="border-b border-[#EEF2F7] bg-white">
        <CalendarHeader
          viewMode={viewMode}
          triggerLabel={triggerLabel}
          onViewModeChange={handleViewModeChange}
          onToday={goToday}
        />
      </SafeAreaView>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 120,
        }}
      >
        {isLoading ? (
          <CalendarAgendaSkeleton />
        ) : isError ? (
          <View className="items-center rounded-3xl bg-white py-14">
            <Text className="text-[15px] font-semibold text-[#111827]">Couldn&apos;t load tasks</Text>
            <Text className="mt-1 text-[13px] text-[#6B7280]">Check your connection and try again</Text>
            <Pressable
              onPress={() => void refetch()}
              className="mt-4 rounded-xl bg-[#32CD32] px-4 py-2.5"
            >
              <Text className="text-[13px] font-semibold text-white">Retry</Text>
            </Pressable>
          </View>
        ) : (
          <Animated.View key={contentKey} entering={entering} exiting={exiting}>
            {viewMode === "schedule" ? <AgendaCalendarView tasks={tasks} /> : null}

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

            {viewMode === "week" ? (
              <SwipeableCalendarView onSwipeLeft={goNext} onSwipeRight={goPrevious}>
                <WeekCalendarView
                  monthDate={monthDate}
                  selectedDate={selectedDate}
                  tasks={tasks}
                  onSelectDate={handleSelectDate}
                  onMonthChange={handleMonthGridChange}
                  onOpenDay={handleOpenDay}
                />
              </SwipeableCalendarView>
            ) : null}

            {viewMode === "day" ? (
              <SwipeableCalendarView onSwipeLeft={goNext} onSwipeRight={goPrevious}>
                <DayCalendarView
                  date={selectedDate}
                  tasks={tasks}
                  onSelectDate={handleSelectDate}
                />
              </SwipeableCalendarView>
            ) : null}
          </Animated.View>
        )}
      </ScrollView>

      <TaskOverviewBottomSheet
        ref={overviewSheetRef}
        onViewFullDetails={handleViewFullDetails}
      />
    </View>
  );
}
