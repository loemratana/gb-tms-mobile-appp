import Ionicons from "@expo/vector-icons/Ionicons";
import { Image, Text, View } from "react-native";

import { CARD_SHADOW } from "@/features/employee/components/task/cardStyles";
import type { Task } from "@/features/employee/types/types";

type AssignedPeopleSectionProps = {
  task: Task;
  currentUserId?: string;
};

export function AssignedPeopleSection({
  task,
  currentUserId,
}: AssignedPeopleSectionProps) {
  const manager = task.assignedManager;
  const assignees = task.assignees ?? [];
  const isMe = (person: { id?: string }) =>
    Boolean(currentUserId) && person.id === currentUserId;
  const assignedToMe = assignees.some(isMe);
  const teamAssignees = assignees.filter((person) => !isMe(person));
  const isTeamTask = assignees.length > 1;

  return (
    <View>
      <Text className="mb-3 text-[13px] font-semibold uppercase tracking-[1px] text-[#9CA3AF]">
        People
      </Text>

      <View
        className="flex-row items-center rounded-3xl border border-[#E5E7EB] bg-white px-4 py-4"
        style={CARD_SHADOW}
      >
        {/* Manager — left */}
        <View className="min-w-0 flex-1 flex-row items-center">
          {manager?.avatarUrl ? (
            <Image
              source={{ uri: manager.avatarUrl }}
              className="mr-2.5 h-11 w-11 rounded-full bg-[#F3F4F6]"
            />
          ) : (
            <View className="mr-2.5 h-11 w-11 items-center justify-center rounded-full bg-[#F3F4F6]">
              <Ionicons name="briefcase" size={16} color="#6B7280" />
            </View>
          )}
          <View className="min-w-0 flex-1">
            <Text className="text-[10px] font-medium uppercase tracking-wide text-[#9CA3AF]">
              Manager
            </Text>
            <Text
              className="mt-0.5 text-[13px] font-semibold text-[#6B7280]"
              numberOfLines={1}
            >
              {manager?.name ?? "—"}
            </Text>
            <Text className="mt-0.5 text-[11px] text-[#9CA3AF]" numberOfLines={1}>
              Assigned by
            </Text>
          </View>
        </View>

        {/* Arrow connector */}
        <View className="mx-2 h-9 w-9 items-center justify-center rounded-full bg-[#F3F4F6]">
          <Ionicons name="arrow-forward" size={18} color="#32CD32" />
        </View>

        {/* Employee / Team — right */}
        <View className="min-w-0 flex-1 flex-row items-center justify-end">
          <View className="mr-2.5 min-w-0 flex-1 items-end">
            <Text className="text-[10px] font-medium uppercase tracking-wide text-[#9CA3AF]">
              {isTeamTask ? "Team" : "Assignee"}
            </Text>

            {assignedToMe && !isTeamTask ? (
              <Text
                className="mt-0.5 text-[13px] font-bold text-[#111827]"
                numberOfLines={1}
              >
                Assigned to me
              </Text>
            ) : null}

            {assignedToMe && isTeamTask ? (
              <Text
                className="mt-0.5 text-[13px] font-bold text-[#111827]"
                numberOfLines={1}
              >
                You + {teamAssignees.length}
              </Text>
            ) : null}

            {!assignedToMe && isTeamTask ? (
              <Text
                className="mt-0.5 text-[13px] font-bold text-[#111827]"
                numberOfLines={1}
              >
                {assignees.length} teammates
              </Text>
            ) : null}

            {!assignedToMe && !isTeamTask ? (
              <Text
                className="mt-0.5 text-[13px] font-bold text-[#111827]"
                numberOfLines={1}
              >
                {assignees[0]?.name ?? "Unassigned"}
              </Text>
            ) : null}

            <Text className="mt-0.5 text-[11px] text-[#6B7280]" numberOfLines={1}>
              {isTeamTask
                ? assignees[0]?.department ?? "Department"
                : assignees[0]?.role ?? "Employee"}
            </Text>
          </View>

          <View className="flex-row">
            {assignees.slice(0, 3).map((person, idx) =>
              person.avatarUrl ? (
                <Image
                  key={`${task.id}-${person.name}-${idx}`}
                  source={{ uri: person.avatarUrl }}
                  className="h-10 w-10 rounded-full border-2 border-white bg-[#F3F4F6]"
                  style={{ marginLeft: idx > 0 ? -10 : 0 }}
                />
              ) : (
                <View
                  key={`${task.id}-${person.name}-${idx}`}
                  className="h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-[#F3F4F6]"
                  style={{ marginLeft: idx > 0 ? -10 : 0 }}
                >
                  <Ionicons name="person" size={14} color="#6B7280" />
                </View>
              )
            )}
            {assignees.length > 3 ? (
              <View
                className="h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-[#E5E7EB]"
                style={{ marginLeft: -10 }}
              >
                <Text className="text-[10px] font-bold text-[#6B7280]">
                  +{assignees.length - 3}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>
    </View>
  );
}
