import Ionicons from "@expo/vector-icons/Ionicons";
import { FlashList, type FlashListRef } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
} from "react";
import {
  Alert,
  Animated,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";

import { useFloatingTabBarInset } from "@/features/components/navigation/ModernTabBar";
import { TaskCard } from "@/features/employee/components/TaskCard";
import { TaskListSkeleton } from "@/features/employee/components/TaskCardSkeleton";
import { ActiveFiltersBar } from "@/features/employee/components/tasks/ActiveFiltersBar";
import {
  StatusFilterChips,
  type StatusFilter,
} from "@/features/employee/components/tasks/StatusFilterChips";
import {
  TaskFilterBottomSheet,
  type TaskFilterBottomSheetRef,
} from "@/features/employee/components/tasks/TaskFilterBottomSheet";
import { TaskSearchBar } from "@/features/employee/components/tasks/TaskSearchBar";
import { TasksHeader } from "@/features/employee/components/tasks/TasksHeader";
import { mapTaskResponseToEmployeeTask } from "@/features/employee/data/taskResponseAdapter";
import { isSubtask } from "@/features/employee/helpers/helpers";
import type { Task } from "@/features/employee/types/types";
import {
  EMPTY_TASK_FILTERS,
  getActiveFilterChips,
  hasActiveTaskFilters,
  matchesTaskDateFilter,
  matchesTaskTimeFilter,
  removeActiveFilterChip,
  type TaskListFilters,
} from "@/features/employee/utils/taskFilters";
import {
  matchesTaskSearch,
  matchesTaskStatusFilter,
} from "@/features/employee/utils/taskListFilters";
import { useChangeAnyTaskStatus } from "@/features/tasks/hooks/useTaskMutations";
import { useTasks } from "@/features/tasks/hooks/useTasks";
import type { TaskSearchParams } from "@/features/tasks/types/task.types";
import { useCurrentUser } from "@/features/users/hooks/useUsers";

interface TasksScreenProps {
  onTaskPress?: (task: Task) => void;
  listBottomInset?: number;
  renderTaskCard?: (task: Task, index: number) => ReactElement;
  /**
   * Overrides the default "assigned to me" query — e.g. a manager screen
   * scoping the list to their department instead of their own assignments.
   */
  searchParams?: TaskSearchParams;
  /** Renders below the "Tasks" title and above the search bar — e.g. a manager's stats overview. */
  statsBar?: ReactElement;
}

const SCROLL_THRESHOLD = 10;
const TOP_REVEAL_OFFSET = 12;
const DEFAULT_SEARCH_HEIGHT = 62;
const COLLAPSED_SEARCH_HEIGHT = 52;

export default function TasksScreen({
  onTaskPress,
  listBottomInset,
  renderTaskCard,
  searchParams,
}: TasksScreenProps) {
  const router = useRouter();
  const { data: currentUser } = useCurrentUser();
  // The floating tab bar (and, for managers, its FAB) sits below this list —
  // without this, the last card renders hidden behind it. Callers can still
  // override with a specific value; this is just a correct default.
  const floatingTabBarInset = useFloatingTabBarInset();
  const resolvedListBottomInset = listBottomInset ?? floatingTabBarInset;

  // No pagination UI yet — filtering below is client-side, so pull a
  // generous page rather than build screen-specific paginated endpoints.
  const resolvedParams: TaskSearchParams = {
    ...(searchParams ?? { assigneeId: currentUser?.id }),
    size: 200,
  };
  const queryEnabled = searchParams
    ? Boolean(currentUser?.id) &&
      Object.values(searchParams).some((value) => value !== undefined)
    : Boolean(currentUser?.id);

  const {
    data: tasksPage,
    isLoading: isLoadingTasks,
    isError: isTasksError,
    refetch: refetchTasks,
  } = useTasks(resolvedParams, queryEnabled);
  const tasks = useMemo(
    () => (tasksPage?.content ?? []).map(mapTaskResponseToEmployeeTask),
    [tasksPage],
  );

  const changeStatusMutation = useChangeAnyTaskStatus();
  const [confirmingTaskId, setConfirmingTaskId] = useState<string | null>(null);

  const handleConfirmTask = useCallback(
    async (task: Task) => {
      setConfirmingTaskId(task.id);
      try {
        await changeStatusMutation.mutateAsync({
          id: task.id,
          status: "IN_PROGRESS",
        });
      } catch {
        Alert.alert("Couldn't confirm task", "Please try again.");
      } finally {
        setConfirmingTaskId(null);
      }
    },
    [changeStatusMutation],
  );

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [filters, setFilters] = useState<TaskListFilters>(EMPTY_TASK_FILTERS);
  const [searchBarHeight, setSearchBarHeight] = useState(DEFAULT_SEARCH_HEIGHT);
  const [searchExpanded, setSearchExpandedState] = useState(true);

  const searchRef = useRef<TextInput>(null);
  const filterSheetRef = useRef<TaskFilterBottomSheetRef>(null);
  const listRef = useRef<FlashListRef<Task>>(null);
  const lastOffset = useRef(0);
  const isSearchExpanded = useRef(true);
  const lastSearchToggle = useRef(0);
  const searchProgress = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (isSubtask(task)) return false;
      if (!matchesTaskDateFilter(task, filters)) return false;
      if (!matchesTaskTimeFilter(task, filters)) return false;
      if (!matchesTaskStatusFilter(task, statusFilter)) return false;
      return matchesTaskSearch(task, debouncedQuery);
    });
  }, [tasks, filters, statusFilter, debouncedQuery]);

  const activeFilterChips = useMemo(
    () => getActiveFilterChips(filters),
    [filters],
  );

  const filtersActive = hasActiveTaskFilters(filters);

  const clearAllFilters = useCallback(() => {
    setFilters(EMPTY_TASK_FILTERS);
  }, []);

  const setSearchExpanded = useCallback(
    (expanded: boolean) => {
      if (isSearchExpanded.current === expanded) return;
      isSearchExpanded.current = expanded;
      setSearchExpandedState(expanded);
      Animated.timing(searchProgress, {
        toValue: expanded ? 1 : 0,
        duration: 220,
        useNativeDriver: false,
      }).start();
    },
    [searchProgress],
  );

  useEffect(() => {
    if (query.trim().length > 0) {
      setSearchExpanded(true);
    }
  }, [query, setSearchExpanded]);

  const revealSearch = useCallback(() => {
    setSearchExpanded(true);
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
    setTimeout(() => searchRef.current?.focus(), 250);
  }, [setSearchExpanded]);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (query.trim().length > 0) return;

      const y = event.nativeEvent.contentOffset.y;
      const delta = y - lastOffset.current;
      lastOffset.current = y;

      const now = Date.now();
      if (now - lastSearchToggle.current < 100) return;

      if (y <= TOP_REVEAL_OFFSET) {
        lastSearchToggle.current = now;
        setSearchExpanded(true);
        return;
      }

      if (delta > SCROLL_THRESHOLD) {
        lastSearchToggle.current = now;
        setSearchExpanded(false);
        searchRef.current?.blur();
      } else if (delta < -SCROLL_THRESHOLD) {
        lastSearchToggle.current = now;
        setSearchExpanded(true);
      }
    },
    [query, setSearchExpanded],
  );

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

  const renderListItem = useCallback(
    ({ item, index }: { item: Task; index: number }) =>
      renderTaskCard ? (
        renderTaskCard(item, index)
      ) : (
        <TaskCard
          task={item}
          currentUserId={currentUser?.id}
          onPress={handleTaskPress}
          onConfirm={handleConfirmTask}
          confirming={confirmingTaskId === item.id}
        />
      ),
    [
      confirmingTaskId,
      currentUser?.id,
      handleConfirmTask,
      handleTaskPress,
      renderTaskCard,
    ],
  );

  // searchProgress is a stable Animated.Value ref; interpolating it and passing
  // it straight into a style prop is the documented way to drive this animation.
  const animatedSearchHeight = useMemo(
    () =>
      // eslint-disable-next-line react-hooks/refs
      searchProgress.interpolate({
        inputRange: [0, 1],
        outputRange: [COLLAPSED_SEARCH_HEIGHT, searchBarHeight],
      }),
    [searchBarHeight, searchProgress],
  );

  const showCollapsedSearch = !searchExpanded && query.trim().length === 0;

  const pinnedHeaderStyle = Platform.select({
    android: { elevation: 4, backgroundColor: "#F3F4F6" },
    default: { zIndex: 1, backgroundColor: "#F3F4F6" },
  });

  return (
    <View className="flex-1 bg-[#F3F4F6]">
      <TasksHeader
        filterActive={filtersActive}
        onPressSearch={revealSearch}
        onPressFilter={() => filterSheetRef.current?.present()}
      />

      <View style={pinnedHeaderStyle}>
        <Animated.View
          style={{ height: animatedSearchHeight, overflow: "hidden" }}
        >
          {showCollapsedSearch ? (
            <Pressable
              onPress={revealSearch}
              accessibilityRole="button"
              accessibilityLabel="Search tasks"
              className="border-b border-[#E5E7EB] bg-white px-4 py-2.5"
            >
              <View className="flex-row items-center rounded-2xl bg-[#F3F4F6] px-3.5 py-2.5">
                <Ionicons name="search-outline" size={18} color="#9CA3AF" />
                <Text className="ml-2 text-[15px] text-[#9CA3AF]">
                  Search tasks...
                </Text>
              </View>
            </Pressable>
          ) : (
            // eslint-disable-next-line react-hooks/refs -- searchProgress is a stable Animated.Value ref used directly as a style value
            <Animated.View style={{ opacity: searchProgress }}>
              <View
                className="border-b border-[#E5E7EB] bg-white px-4 py-3"
                onLayout={(event) => {
                  const height = event.nativeEvent.layout.height;
                  if (height > 0) {
                    setSearchBarHeight(height);
                  }
                }}
              >
                <TaskSearchBar
                  ref={searchRef}
                  value={query}
                  onChangeText={setQuery}
                  onClear={() => setQuery("")}
                />
              </View>
            </Animated.View>
          )}
        </Animated.View>

        <View className="border-b border-[#E5E7EB] bg-[#F3F4F6]">
          <StatusFilterChips active={statusFilter} onChange={setStatusFilter} />
          <ActiveFiltersBar
            chips={activeFilterChips}
            onRemoveChip={(chipId) =>
              setFilters((prev) => removeActiveFilterChip(prev, chipId))
            }
            onClearAll={clearAllFilters}
          />
        </View>
      </View>

      <FlashList
        ref={listRef}
        data={filteredTasks}
        drawDistance={320}
        keyExtractor={(item) => item.id}
        renderItem={renderListItem}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: resolvedListBottomInset,
        }}
        ListEmptyComponent={
          isLoadingTasks ? (
            <TaskListSkeleton />
          ) : isTasksError ? (
            <View className="mt-10 items-center px-2">
              <Text className="text-base font-bold text-[#111827]">
                Couldn&apos;t load tasks
              </Text>
              <Text className="mt-1 text-center text-xs text-[#6B7280]">
                Check your connection and try again
              </Text>
              <Pressable
                onPress={() => void refetchTasks()}
                accessibilityRole="button"
                accessibilityLabel="Retry loading tasks"
                className="mt-4 rounded-full bg-[#ECFDF5] px-4 py-2"
              >
                <Text className="text-[13px] font-semibold text-[#15803D]">
                  Retry
                </Text>
              </Pressable>
            </View>
          ) : (
            <View className="mt-10 items-center px-2">
              <Text className="text-base font-bold text-[#111827]">
                No tasks found
              </Text>
              <Text className="mt-1 text-center text-xs text-[#6B7280]">
                Try a different search or filter
              </Text>
              {filtersActive ? (
                <Pressable
                  onPress={clearAllFilters}
                  accessibilityRole="button"
                  accessibilityLabel="Clear all filters"
                  className="mt-4 rounded-full bg-[#ECFDF5] px-4 py-2"
                >
                  <Text className="text-[13px] font-semibold text-[#15803D]">
                    Clear all filters
                  </Text>
                </Pressable>
              ) : null}
            </View>
          )
        }
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />

      <TaskFilterBottomSheet
        ref={filterSheetRef}
        filters={filters}
        onApply={setFilters}
      />
    </View>
  );
}
