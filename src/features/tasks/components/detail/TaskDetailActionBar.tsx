import Ionicons from "@expo/vector-icons/Ionicons";
import type { ComponentProps } from "react";
import { Text, View } from "react-native";

import { Button } from "@/components/ui/Button";
import type { TaskStatus } from "@/features/tasks/types/taskView.types";
import { toneColors, type Tone } from "@/styles";

type TaskDetailActionBarProps = {
  status: TaskStatus;
  isAssignee: boolean;
  bottomInset: number;
  onSubmitWork: () => void;
};

function Notice({ icon, tone, label }: { icon: ComponentProps<typeof Ionicons>["name"]; tone: Tone; label: string }) {
  const colors = toneColors[tone];
  return (
    <View
      className="h-12 flex-row items-center justify-center gap-2 rounded-xl"
      style={{ backgroundColor: colors.subtle }}
      accessible
      accessibilityLabel={label}
    >
      <Ionicons name={icon} size={18} color={colors.color} />
      <Text className="text-body-sm font-semibold" style={{ color: colors.fg }}>
        {label}
      </Text>
    </View>
  );
}

/** Bottom bar on task detail: the assignee's primary action, or why there isn't one. */
export function TaskDetailActionBar({ status, isAssignee, bottomInset, onSubmitWork }: TaskDetailActionBarProps) {
  const isClosed = status === "done" || status === "cancelled";
  // Only one submission can wait for review at a time; the server refuses a second one.
  const isAwaitingReview = status === "review";

  return (
    <View
      className="absolute bottom-0 left-0 right-0 border-t border-line bg-surface px-4 pt-3"
      style={{ paddingBottom: Math.max(bottomInset, 12) }}
    >
      {isClosed ? (
        status === "done" ? (
          <Notice icon="checkmark-circle" tone="success" label="Task completed" />
        ) : (
          <Notice icon="close-circle" tone="faint" label="Task cancelled" />
        )
      ) : !isAssignee ? (
        <Notice icon="eye-outline" tone="neutral" label="You're not assigned to this task" />
      ) : isAwaitingReview ? (
        <Notice icon="hourglass-outline" tone="warning" label="Submitted · waiting for review" />
      ) : (
        <Button label="Submit work" icon="paper-plane" onPress={onSubmitWork} />
      )}
    </View>
  );
}
