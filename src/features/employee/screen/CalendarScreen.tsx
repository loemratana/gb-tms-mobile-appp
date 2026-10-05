import { useCallback, useMemo, useRef, useState } from "react";
import { ScrollView, View } from "react-native";
import type { DateData } from "react-native-calendars";

import { CalendarGrid } from "@/features/employee/components/calendar/CalendarGrid";
import {
  CalendarFilterBottomSheet,
  type CalendarFilterBottomSheetRef,
} from "@/features/employee/components/calendar/CalendarFilterBottomSheet";
import type { CategoryFilter } from "@/features/employee/components/calendar/CategoryChips";
import { CalendarHeader } from "@/features/employee/components/calendar/CalendarHeader";
import { MonthSelector } from "@/features/employee/components/calendar/MonthSelector";
import {
  TaskDetailBottomSheet,
  type TaskDetailBottomSheetRef,
} from "@/features/employee/components/calendar/TaskDetailBottomSheet";
import { TaskListByDate } from "@/features/employee/components/calendar/TaskListByDate";
import { TaskListByDateSkeleton } from "@/features/employee/components/calendar/TaskListByDateSkeleton";
import { useCalendarTasks } from "@/features/employee/hooks/useCalendarTasks";
import {
  applyCalendarFilters,
  countActiveFilters,
  EMPTY_FILTERS,
  type CalendarFilters,
} from "@/features/employee/utils/calendarFilters";

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function shiftMonth(dateKey: string, delta: number) {
  const [year, month] = dateKey.split("-").map(Number);
  const next = new Date(year, month - 1 + delta, 1);
  return toDateKey(next);
}

function formatMonthLabel(dateKey: string) {
  const date = new Date(`${dateKey}T12:00:00`);
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function formatSelectedLabel(dateKey: string) {
  const date = new Date(`${dateKey}T12:00:00`);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export default function CalendarScreen({
  bottomInset = 32,
}: {
  bottomInset?: number;
}) {
  const today = toDateKey(new Date());
  const [currentMonth, setCurrentMonth] = useState(today);
  const [selectedDate, setSelectedDate] = useState(today);
  const { tasks, isLoading: isLoadingTasks } = useCalendarTasks();
  const [filters, setFilters] = useState<CalendarFilters>(EMPTY_FILTERS);
  const [category, setCategory] = useState<CategoryFilter>("all");

  const detailSheetRef = useRef<TaskDetailBottomSheetRef>(null);
  const filterSheetRef = useRef<CalendarFilterBottomSheetRef>(null);

  const filteredTasks = useMemo(
    () => applyCalendarFilters(tasks, filters),
    [tasks, filters]
  );

  const tasksForSelectedDate = useMemo(() => {
    return filteredTasks.filter((task) => {
      if (task.dueDate !== selectedDate) return false;
      if (category === "all") return true;
      return task.category === category;
    });
  }, [filteredTasks, selectedDate, category]);

  const activeFilterCount = countActiveFilters(filters);

  const handleMonthChange = useCallback((month: DateData) => {
    setCurrentMonth(`${month.year}-${`${month.month}`.padStart(2, "0")}-01`);
  }, []);

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => shiftMonth(prev, -1));
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => shiftMonth(prev, 1));
  };

  return (
    <>
      <View className="flex-1 bg-[#F5F7FB]">
        <CalendarHeader
          activeFilterCount={activeFilterCount}
          onPressFilter={() => filterSheetRef.current?.present()}
        />

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: bottomInset }}
        >
          <MonthSelector
            monthLabel={formatMonthLabel(currentMonth)}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
          />

          <CalendarGrid
            currentMonth={currentMonth}
            selectedDate={selectedDate}
            tasks={filteredTasks}
            onSelectDate={setSelectedDate}
            onMonthChange={handleMonthChange}
          />

          {isLoadingTasks ? (
            <TaskListByDateSkeleton />
          ) : (
            <TaskListByDate
              dateLabel={formatSelectedLabel(selectedDate)}
              tasks={tasksForSelectedDate}
              category={category}
              onCategoryChange={setCategory}
              onTaskPress={(task) => detailSheetRef.current?.present(task)}
            />
          )}
        </ScrollView>
      </View>

      <CalendarFilterBottomSheet
        ref={filterSheetRef}
        filters={filters}
        onApply={setFilters}
      />
      <TaskDetailBottomSheet ref={detailSheetRef} />
    </>
  );
}
