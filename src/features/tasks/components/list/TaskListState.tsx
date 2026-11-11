import { StateView } from "@/components/ui/StateView";

type TaskListStateProps = {
  variant: "empty" | "error";
  /** Shown as a button under the message, e.g. "Retry" or "Clear filters". */
  actionLabel?: string;
  onPressAction?: () => void;
};

/** Empty / error message for the task list, using the shared StateView. */
export function TaskListState({ variant, actionLabel, onPressAction }: TaskListStateProps) {
  return variant === "empty" ? (
    <StateView
      variant="empty"
      icon="clipboard-outline"
      title="No tasks found"
      message="Try a different search, status or filter."
      actionLabel={actionLabel}
      onPressAction={onPressAction}
    />
  ) : (
    <StateView
      variant="error"
      title="Couldn't load tasks"
      message="Check your connection and try again."
      actionLabel={actionLabel}
      onPressAction={onPressAction}
    />
  );
}
