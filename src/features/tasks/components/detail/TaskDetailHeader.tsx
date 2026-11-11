import { StackHeader } from "@/components/layout/StackHeader";
import { IconButton } from "@/components/ui/IconButton";

type TaskDetailHeaderProps = {
  onBack: () => void;
  onMore?: () => void;
  onReminder?: () => void;
};

/**
 * Task detail's stack header with its reminder / more actions.
 * The task's own title and status are shown in the screen body, not repeated here.
 */
export function TaskDetailHeader({ onBack, onMore, onReminder }: TaskDetailHeaderProps) {
  const hasActions = Boolean(onReminder || onMore);

  return (
    <StackHeader
      title="Task"
      onBack={onBack}
      actions={
        hasActions ? (
          <>
            {onReminder ? (
              <IconButton icon="alarm-outline" variant="ghost" accessibilityLabel="Reminder settings" onPress={onReminder} />
            ) : null}
            {onMore ? (
              <IconButton icon="ellipsis-horizontal" variant="ghost" accessibilityLabel="More actions" onPress={onMore} />
            ) : null}
          </>
        ) : undefined
      }
    />
  );
}
