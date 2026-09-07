import { Check } from "lucide-react-native";
import { Image, Pressable, Text, TextInput, View } from "react-native";

import type { Priority } from "@/features/tasks/types/task.types";
import type {
  VoiceAssigneeCandidate,
  VoiceAssigneeOption,
} from "@/features/tasks/types/voice.types";

const PRIORITY_LABELS: Record<Priority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

type TaskExtractionResultProps = {
  title: string;
  description: string;
  priority: Priority;
  dueDate: string | null;
  dueDateText: string | null;
  candidates: VoiceAssigneeCandidate[];
  employees: readonly VoiceAssigneeOption[];
  selectedAssigneeId: string | undefined;
  onChangeTitle: (value: string) => void;
  onChangeDescription: (value: string) => void;
  onChangePriority: (value: Priority) => void;
  onSelectAssignee: (id: string | undefined) => void;
};

function FieldLabel({ children }: { children: string }) {
  return <Text className="mb-1.5 mt-3 text-[12px] font-semibold text-[#374151]">{children}</Text>;
}

export function TaskExtractionResult({
  title,
  description,
  priority,
  dueDate,
  dueDateText,
  candidates,
  employees,
  selectedAssigneeId,
  onChangeTitle,
  onChangeDescription,
  onChangePriority,
  onSelectAssignee,
}: TaskExtractionResultProps) {
  return (
    <View className="mt-4 rounded-2xl border border-[#E5E7EB] bg-white p-4">
      <FieldLabel>Title</FieldLabel>
      <TextInput
        value={title}
        onChangeText={onChangeTitle}
        className="h-11 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-3 text-[15px] text-[#111827]"
      />

      <FieldLabel>Description</FieldLabel>
      <TextInput
        value={description}
        onChangeText={onChangeDescription}
        multiline
        textAlignVertical="top"
        className="min-h-[72px] rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2 text-[15px] text-[#111827]"
      />

      <FieldLabel>Priority</FieldLabel>
      <View className="flex-row gap-2">
        {(Object.keys(PRIORITY_LABELS) as Priority[]).map((option) => {
          const selected = priority === option;
          return (
            <Pressable
              key={option}
              onPress={() => onChangePriority(option)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              className={`h-9 flex-1 items-center justify-center rounded-lg border ${
                selected ? "border-[#32CD32] bg-[#F0FDF4]" : "border-[#E5E7EB] bg-[#F9FAFB]"
              }`}
            >
              <Text
                className={`text-[12px] font-semibold ${selected ? "text-[#16A34A]" : "text-[#6B7280]"}`}
              >
                {PRIORITY_LABELS[option]}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {dueDate ? (
        <>
          <FieldLabel>Due date</FieldLabel>
          <View className="flex-row items-center gap-2 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2.5">
            <Text className="text-[15px] text-[#111827]">{dueDate}</Text>
            {dueDateText ? (
              <Text className="text-[12px] text-[#9CA3AF]">from &ldquo;{dueDateText}&rdquo;</Text>
            ) : null}
          </View>
        </>
      ) : null}

      <FieldLabel>Assign to</FieldLabel>
      {candidates.length === 0 ? (
        <Text className="text-[13px] text-[#6B7280]">
          No name recognized — pick an assignee below.
        </Text>
      ) : (
        <View className="gap-2">
          {candidates.map((candidate) => {
            const employee = employees.find((item) => item.id === candidate.userId);
            const selected = selectedAssigneeId === candidate.userId;
            return (
              <Pressable
                key={candidate.userId}
                onPress={() => onSelectAssignee(candidate.userId)}
                className={`flex-row items-center rounded-xl border px-3 py-2.5 ${
                  selected ? "border-[#32CD32] bg-[#F0FDF4]" : "border-[#E5E7EB] bg-[#F9FAFB]"
                }`}
              >
                {employee ? (
                  <Image source={{ uri: employee.avatar }} className="h-8 w-8 rounded-full" />
                ) : null}
                <View className="ml-3 flex-1">
                  <Text className="text-[14px] font-medium text-[#111827]">
                    {employee?.name ?? candidate.fullName}
                  </Text>
                  <Text className="text-[11px] text-[#9CA3AF]">
                    {Math.round(candidate.score * 100)}% match
                  </Text>
                </View>
                {selected ? (
                  <View className="h-5 w-5 items-center justify-center rounded-full bg-[#32CD32]">
                    <Check size={12} color="white" />
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}
