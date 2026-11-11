
import { StatsGrid } from "@/components/ui/StatsGrid";
import type { StatusFilter } from "@/features/tasks/types/taskView.types";
import type { TaskStatusCounts } from "@/features/tasks/utils/taskStatusCounts";

type TaskStatusStatsProps = {
  counts: TaskStatusCounts;
  /** Called with the list tab that shows exactly the tasks the tapped card counted. */
  onPressStatus?: (status: StatusFilter) => void;
};

/** 2×2 stat cards: To do, In progress, Review, Completed — toned like the status badges. */
export function TaskStatusStats({ counts, onPressStatus }: TaskStatusStatsProps) {
  const press = (status: StatusFilter) =>
    onPressStatus ? () => onPressStatus(status) : undefined;

  return (
    <StatsGrid
      items={[
        { title: "To do", value: counts.todo, icon: "list-outline", tone: "warning", onPress: press("todo") },
        { title: "In progress", value: counts.inProgress, icon: "time-outline", tone: "info", onPress: press("in_progress") },
        { title: "In review", value: counts.review, icon: "eye-outline", tone: "violet", onPress: press("review") },
        { title: "Completed", value: counts.completed, icon: "checkmark-circle-outline", tone: "success", onPress: press("done") },
      ]}
    />
  );
}
