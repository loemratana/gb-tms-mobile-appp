import { Pencil, Plus, X } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";
import type { FieldArrayWithId } from "react-hook-form";

import type {
  CreateTaskFormValues,
  SubtaskFormValues,
} from "@/features/manager/components/create-task/taskFormSchema";

type SubtaskListSectionProps = {
  fields: FieldArrayWithId<CreateTaskFormValues, "subtasks", "id">[];
  subtasks: SubtaskFormValues[];
  onAdd: () => void;
  onEdit: (index: number) => void;
  onRemove: (index: number) => void;
};

export function SubtaskListSection({
  fields,
  subtasks,
  onAdd,
  onEdit,
  onRemove,
}: SubtaskListSectionProps) {
  return (
    <View className="mt-4">
      <View className="mb-3 flex-row items-center justify-between">
        <View>
          <Text className="text-[13px] font-semibold text-[#374151]">Subtasks</Text>
          <Text className="mt-0.5 text-[12px] text-[#6B7280]">
            Optional — break work into smaller steps
          </Text>
        </View>
        {subtasks.length > 0 ? (
          <View className="rounded-full bg-[#ECFDF5] px-2 py-0.5">
            <Text className="text-[11px] font-semibold text-[#15803D]">
              {subtasks.length}
            </Text>
          </View>
        ) : null}
      </View>

      {fields.map((field, index) => {
        const subtask = subtasks[index];
        if (!subtask?.title) return null;

        return (
          <View
            key={field.id}
            className="mb-2 flex-row items-center rounded-xl border border-[#E5E7EB] bg-white px-3 py-3"
          >
            <View className="mr-2 h-2 w-2 rounded-full bg-[#32CD32]" />
            <Pressable className="flex-1 pr-2" onPress={() => onEdit(index)}>
              <Text className="text-[14px] font-semibold text-[#111827]">
                {subtask.title}
              </Text>
              <Text className="mt-1 text-[12px] text-[#6B7280]" numberOfLines={1}>
                {subtask.inheritFromParent
                  ? "Uses parent assignees & schedule"
                  : `${subtask.assignees.length} custom assignee${
                      subtask.assignees.length === 1 ? "" : "s"
                    }`}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => onEdit(index)}
              hitSlop={8}
              className="mr-1 h-8 w-8 items-center justify-center"
              accessibilityLabel={`Edit ${subtask.title}`}
            >
              <Pencil size={16} color="#6B7280" />
            </Pressable>

            <Pressable
              onPress={() => onRemove(index)}
              hitSlop={8}
              className="h-8 w-8 items-center justify-center"
              accessibilityLabel={`Remove ${subtask.title}`}
            >
              <X size={16} color="#6B7280" />
            </Pressable>
          </View>
        );
      })}

      <Pressable
        onPress={onAdd}
        className="flex-row items-center justify-center rounded-xl border border-dashed border-[#D1D5DB] bg-[#F9FAFB] px-4 py-3"
        accessibilityRole="button"
        accessibilityLabel="Add subtask"
      >
        <Plus size={16} color="#32CD32" />
        <Text className="ml-2 text-[14px] font-semibold text-[#32CD32]">Add subtask</Text>
      </Pressable>
    </View>
  );
}
