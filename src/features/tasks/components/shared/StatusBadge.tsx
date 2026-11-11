import { Badge } from "@/components/ui/Badge";
import type { TaskStatus } from "@/features/tasks/types/taskView.types";
import { getStatusLabel } from "@/features/tasks/utils/task.utils";
import { taskStatusTone } from "@/styles";

/** Task status pill: dot + light fill + dark text, toned from the shared status mapping. */
export function StatusBadge({ status }: { status: TaskStatus }) {
  return <Badge label={getStatusLabel(status)} tone={taskStatusTone[status]} hasDot />;
}
