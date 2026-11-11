import { FlashList } from "@shopify/flash-list";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, type ReactElement } from "react";
import { View } from "react-native";
import type { TextInputInstance } from "react-native";

import { useTabBarInset } from "@/components/navigation/ModernTabBar";
import { useBackAction } from "@/hooks/useBackAction";
import { TaskCard } from "@/features/tasks/components/list/TaskCard";
import { TaskListSkeleton } from "@/features/tasks/components/list/TaskCardSkeleton";
import { ActiveFiltersBar } from "@/features/tasks/components/list/ActiveFiltersBar";
import { StatusFilterChips } from "@/features/tasks/components/list/StatusFilterChips";
import {
  TaskFilterBottomSheet,
  type TaskFilterBottomSheetRef,
} from "@/features/tasks/components/list/TaskFilterBottomSheet";
import { TaskListState } from "@/features/tasks/components/list/TaskListState";
import { TasksHeader } from "@/features/tasks/components/list/TasksHeader";
import { useMyTasksList } from "@/features/tasks/hooks/useMyTasksList";
import type { Task } from "@/features/tasks/types/taskView.types";
import type { TaskSearchParams } from "@/features/tasks/types/task.types";
import { isStatusFilter } from "@/features/tasks/utils/taskListFilters";

interface TasksScreenProps {
  onTaskPress?: (task: Task) => void;
  listBottomInset?: number;
  renderTaskCard?: (task: Task, index: number) => ReactElement;
  /**
   * Overrides the default "assigned to me" query — e.g. a manager screen
   * scoping the list to their department instead of their own assignments.
   */
  searchParams?: TaskSearchParams;
  /** Renders below the header and above the status tabs — e.g. a manager's stats overview. */
  statsBar?: ReactElement;
}

export default function TasksScreen({
  onTaskPress,
  listBottomInset,
  renderTaskCard,
  searchParams,
  statsBar,
}: TasksScreenProps) {
  const router = useRouter();
  const list = useMyTasksList(searchParams);
  const backAction = useBackAction();

  const searchRef = useRef<TextInputInstance>(null);
  const filterSheetRef = useRef<TaskFilterBottomSheetRef>(null);

  // The floating tab bar (and, for managers, its FAB) sits below this list —
  // without this, the last card renders hidden behind it.
  const tabBarInset = useTabBarInset();

  const handleTaskPress = useCallback(
    (task: Task) => {
      if (onTaskPress) {
        onTaskPress(task);
        return;
      }
      router.push({
        pathname: "/(employee)/tasks/[id]",
        params: { id: task.id },
      });
    },
    [onTaskPress, router],
  );

  const { currentUserId, confirmingTaskId, confirmTask } = list;
  const renderListItem = useCallback(
    ({ item, index }: { item: Task; index: number }) =>
      renderTaskCard ? (
        renderTaskCard(item, index)
      ) : (
        <TaskCard
          task={item}
          currentUserId={currentUserId}
          onPress={handleTaskPress}
          onConfirm={confirmTask}
          confirming={confirmingTaskId === item.id}
        />
      ),
    [confirmingTaskId, currentUserId, confirmTask, handleTaskPress, renderTaskCard],
  );

  const hasNarrowedList =
    list.hasActiveFilters || list.query.length > 0 || list.statusFilter !== "all";

  const handleResetList = () => {
    list.clearAllFilters();
    list.setQuery("");
    list.setStatusFilter("all");
  };

  // A dashboard stat card opens this tab with `?status=<tab>`. Start from a clean list so the
  // rows match the card's number (a leftover search/date filter would hide some), then drop the
  // param so tapping the same card again later re-applies it.
  const { status: statusParam } = useLocalSearchParams<{ status?: string }>();
  const { clearAllFilters, setQuery, setStatusFilter } = list;
  useEffect(() => {
    if (!isStatusFilter(statusParam)) return;
    clearAllFilters();
    setQuery("");
    setStatusFilter(statusParam);
    router.setParams({ status: undefined });
  }, [statusParam, clearAllFilters, setQuery, setStatusFilter, router]);

  return (
    <View className="flex-1 bg-subtle">
      <View className="z-10 bg-surface">
        <TasksHeader
          ref={searchRef}
          title={searchParams ? "Tasks" : "My Tasks"}
          activeCount={list.summary.activeCount}
          overdueCount={list.summary.overdueCount}
          query={list.query}
          onChangeQuery={list.setQuery}
          hasActiveFilters={list.hasActiveFilters}
          onBack={backAction}
          onPressFilter={() => {
            searchRef.current?.blur();
            filterSheetRef.current?.present();
          }}
        />
        {statsBar}
      </View>

      <View>
        <StatusFilterChips
          active={list.statusFilter}
          onChange={list.setStatusFilter}
          counts={list.statusCounts}
        />
        <ActiveFiltersBar
          chips={list.activeFilterChips}
          onRemoveChip={list.removeFilterChip}
          onClearAll={list.clearAllFilters}
        />
      </View>

      <FlashList
        data={list.tasks}
        drawDistance={320}
        keyExtractor={(item) => item.id}
        refreshing={list.isRefreshing}
        onRefresh={list.refetch}
        renderItem={renderListItem}
        ItemSeparatorComponent={TaskSeparator}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 4,
          paddingBottom: listBottomInset ?? tabBarInset,
        }}
        ListEmptyComponent={
          list.isLoading ? (
            <TaskListSkeleton />
          ) : list.isError ? (
            <TaskListState
              variant="error"
              actionLabel="Try again"
              onPressAction={list.refetch}
            />
          ) : (
            <TaskListState
              variant="empty"
              actionLabel={hasNarrowedList ? "Reset search & filters" : undefined}
              onPressAction={handleResetList}
            />
          )
        }
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      />

      <TaskFilterBottomSheet
        ref={filterSheetRef}
        filters={list.filters}
        onApply={list.setFilters}
      />
    </View>
  );
}

function TaskSeparator() {
  return <View className="h-3" />;
}
