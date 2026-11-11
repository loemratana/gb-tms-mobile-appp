import { forwardRef } from "react";
import { Text, View } from "react-native";
import type { TextInputInstance } from "react-native";

import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { Badge } from "@/components/ui/Badge";
import { IconButton } from "@/components/ui/IconButton";
import { SearchInput } from "@/components/ui/SearchInput";

type TasksHeaderProps = {
  title?: string;
  activeCount: number;
  overdueCount: number;
  query: string;
  onChangeQuery: (query: string) => void;
  hasActiveFilters?: boolean;
  onPressFilter?: () => void;
  /** Shows a back button — pass it only when the screen was pushed (not a tab root). */
  onBack?: () => void;
};

/** Title, at-a-glance workload summary, and the search + filter row. */
export const TasksHeader = forwardRef<TextInputInstance, TasksHeaderProps>(function TasksHeader(
  {
    title = "My Tasks",
    activeCount,
    overdueCount,
    query,
    onChangeQuery,
    hasActiveFilters = false,
    onPressFilter,
    onBack,
  },
  searchRef,
) {
  return (
    <ScreenHeader
      title={title}
      onBack={onBack}
      subtitle={
        <View className="mt-1 flex-row items-center gap-2">
          <Text className="text-caption text-fg-soft">
            {activeCount} active {activeCount === 1 ? "task" : "tasks"}
          </Text>
          {overdueCount > 0 ? <Badge label={`${overdueCount} overdue`} tone="error" icon="alert-circle" /> : null}
        </View>
      }
    >
      <View className="flex-row items-center gap-2">
        <View className="flex-1">
          <SearchInput
            ref={searchRef}
            value={query}
            onChangeText={onChangeQuery}
            placeholder="Search tasks"
            accessibilityLabel="Search tasks"
          />
        </View>
        <IconButton
          icon="options-outline"
          variant={hasActiveFilters ? "brand" : "subtle"}
          hasIndicator={hasActiveFilters}
          accessibilityLabel={hasActiveFilters ? "Filter tasks, filters applied" : "Filter tasks"}
          onPress={onPressFilter}
        />
      </View>
    </ScreenHeader>
  );
});
