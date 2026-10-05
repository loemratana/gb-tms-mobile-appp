import { Alert, Pressable, Text, View } from "react-native";

import { getStatusColor } from "@/features/employee/helpers/helpers";
import { useTaskContext } from "@/hooks/useTaskContext";
import type { Task } from "@/features/employee/types/types";

type ProjectTaskRowProps = {
  task: Task;
};

/**
 * Reads its complete/delete actions straight from TaskContext instead of
 * receiving callbacks as props from ManagerProjectDetailScreen. That's what
 * "no prop drilling for shared state" looks like: the screen only ever
 * needs to know about the task list, not about how each row mutates it.
 */
export function ProjectTaskRow({ task }: ProjectTaskRowProps) {
  const { completeTask, deleteTask } = useTaskContext();

  const handleDelete = () => {
    Alert.alert("Delete task", `Delete "${task.title}"? This can't be undone.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => void deleteTask(task.id) },
    ]);
  };

  return (
    <View className="flex-row items-start rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-3">
      <View
        className="mt-1 h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: getStatusColor(task.status) }}
      />
      <View className="ml-3 flex-1">
        <Text className="text-[14px] font-semibold text-[#111827]">{task.title}</Text>
        <Text className="mt-1 text-[12px] text-[#6B7280]">
          {task.assignees[0]?.name ?? "Unassigned"}
          {task.dueDate ? ` • Due ${task.dueDate}` : ""}
        </Text>
      </View>
      <View className="ml-2 flex-row items-center gap-2">
        {task.status !== "done" ? (
          <Pressable
            onPress={() => void completeTask(task.id)}
            accessibilityRole="button"
            accessibilityLabel={`Mark ${task.title} complete`}
            className="rounded-full bg-[#ECFDF5] px-2.5 py-1.5"
          >
            <Text className="text-[11px] font-semibold text-[#15803D]">Complete</Text>
          </Pressable>
        ) : null}
        <Pressable
          onPress={handleDelete}
          accessibilityRole="button"
          accessibilityLabel={`Delete ${task.title}`}
          className="rounded-full bg-[#FEF2F2] px-2.5 py-1.5"
        >
          <Text className="text-[11px] font-semibold text-[#DC2626]">Delete</Text>
        </Pressable>
      </View>
    </View>
  );
}
