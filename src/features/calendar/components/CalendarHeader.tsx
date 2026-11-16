import { Text, View } from "react-native";

import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import type { MonthSummary } from "@/features/calendar/utils/calendarTasks";

export type CalendarViewMode = "schedule" | "month";

const VIEW_OPTIONS: { value: CalendarViewMode; label: string }[] = [
  { value: "schedule", label: "Schedule" },
  { value: "month", label: "Month" },
];

type CalendarHeaderProps = {
  viewMode: CalendarViewMode;
  title: string;
  summary: MonthSummary | null;
  onViewModeChange: (mode: CalendarViewMode) => void;
  onToday: () => void;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
};

function MonthSummaryLine({ summary }: { summary: MonthSummary }) {
  return (
    <Text className="mt-0.5 text-caption text-fg-soft" numberOfLines={1}>
      {summary.meetings > 0 ? `${summary.meetings} ${summary.meetings === 1 ? "meeting" : "meetings"} · ` : ""}
      {summary.total} {summary.total === 1 ? "task" : "tasks"} due
      {summary.overdue > 0 ? <Text className="font-semibold text-error"> · {summary.overdue} overdue</Text> : null}
      {summary.done > 0 ? <Text> · {summary.done} done</Text> : null}
    </Text>
  );
}

/** Month title with prev / next / Today, the month's meetings and task counts, and the Schedule / Month switch. */
export function CalendarHeader({
  viewMode,
  title,
  summary,
  onViewModeChange,
  onToday,
  onPreviousMonth,
  onNextMonth,
}: CalendarHeaderProps) {
  return (
    <ScreenHeader
      title={title}
      subtitle={summary ? <MonthSummaryLine summary={summary} /> : undefined}
      actions={
        <View className="flex-row items-center gap-1">
          {/* Both views show one month, so both can step through months. */}
          <IconButton icon="chevron-back" variant="subtle" accessibilityLabel="Previous month" onPress={onPreviousMonth} />
          <IconButton icon="chevron-forward" variant="subtle" accessibilityLabel="Next month" onPress={onNextMonth} />
          <View className="ml-1">
            <Button label="Today" variant="outline" size="sm" isFullWidth={false} onPress={onToday} />
          </View>
        </View>
      }
    >
      <SegmentedControl options={VIEW_OPTIONS} value={viewMode} onChange={onViewModeChange} />
    </ScreenHeader>
  );
}
