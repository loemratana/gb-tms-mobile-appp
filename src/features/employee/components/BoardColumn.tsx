import { Ionicons } from "@expo/vector-icons";
import { Draggable, Droppable } from "@mgcrea/react-native-dnd";
import React from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";

import {
  formatDate,
  getPriorityColor,
  getPriorityLabel,
  getStatusColor,
  getStatusLabel,
} from "../helpers/helpers";
import { Task, TaskStatus } from "../types/types";

interface BoardColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onTaskPress?: (task: Task) => void;
}

function BoardTaskCard({
  task,
  onPress,
}: {
  task: Task;
  onPress?: (task: Task) => void;
}) {
  const priorityColor = getPriorityColor(task.priority);
  const priorityLabel = getPriorityLabel(task.priority);

  return (
    <View className="mb-2.5 flex-row overflow-hidden rounded-2xl border border-gray-200 bg-white">
      {/* Drag handle only */}
      <Draggable
        id={task.id}
        data={{ status: task.status }}
        activationDelay={120}
        style={{ width: 36 }}
      >
        <View className="h-full min-h-[88px] w-9 items-center justify-center border-r border-gray-200 bg-gray-50">
          <Ionicons name="menu" size={18} color="#9CA3AF" />
        </View>
      </Draggable>

      {/* Tap body to open */}
      <Pressable className="flex-1 p-3" onPress={() => onPress?.(task)}>
        <View className="flex-row items-start justify-between gap-2">
          <Text
            className="flex-1 text-sm font-bold text-gray-900"
            numberOfLines={2}
          >
            {task.title}
          </Text>
          <View
            className="rounded-full px-2 py-0.5"
            style={{ backgroundColor: `${priorityColor}20` }}
          >
            <Text
              className="text-[11px] font-semibold"
              style={{ color: priorityColor }}
            >
              {priorityLabel}
            </Text>
          </View>
        </View>

        <View className="mt-2 flex-row items-center">
          <Ionicons name="calendar-outline" size={13} color="#6B7280" />
          <Text className="ml-1 text-xs text-gray-500">
            {formatDate(task.dueDate)}
          </Text>
        </View>

        <View className="mt-2.5">
          <View className="flex-row items-center">
            <View className="mr-2 flex-row">
              {(task.assignees ?? []).slice(0, 3).map((person, idx) =>
                person.avatarUrl ? (
                  <Image
                    key={`${task.id}-a-${idx}`}
                    source={{ uri: person.avatarUrl }}
                    className="h-5 w-5 rounded-full border border-white"
                    style={{ marginLeft: idx > 0 ? -6 : 0 }}
                  />
                ) : null
              )}
            </View>
            <Text className="flex-1 text-xs font-semibold text-[#111827]" numberOfLines={1}>
              {(task.assignees?.length ?? 0) > 1
                ? `${task.assignees.length} teammates`
                : task.assignees?.[0]?.name ?? "Assignee"}
            </Text>
          </View>
          <Text className="mt-0.5 text-[10px] text-[#9CA3AF]" numberOfLines={1}>
            Manager · {task.assignedManager?.name ?? "—"}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}

export const BoardColumn: React.FC<BoardColumnProps> = ({
  status,
  tasks,
  onTaskPress,
}) => {
  const statusColor = getStatusColor(status);
  const statusLabel = getStatusLabel(status);

  return (
    <View className="mr-3.5 min-h-[440px] w-[300px] self-stretch">
      <View className="h-1 rounded-t-2xl" style={{ backgroundColor: statusColor }} />

      <Droppable
        id={status}
        style={{
          flex: 1,
          backgroundColor: "#FFFFFF",
          borderBottomLeftRadius: 16,
          borderBottomRightRadius: 16,
          borderWidth: 1,
          borderTopWidth: 0,
          borderColor: "#E5E7EB",
          paddingHorizontal: 12,
          paddingTop: 12,
          paddingBottom: 10,
        }}
      >
        <View className="flex-row items-center justify-between">
          <Text className="text-[15px] font-bold text-gray-900">
            {statusLabel}
          </Text>
          <View
            className="h-[26px] min-w-[26px] items-center justify-center rounded-full px-2"
            style={{ backgroundColor: `${statusColor}18` }}
          >
            <Text className="text-xs font-bold" style={{ color: statusColor }}>
              {tasks.length}
            </Text>
          </View>
        </View>

        <Text className="mb-3 mt-1 text-[11px] text-gray-400">
          Tap card to open · drag ☰ to move
        </Text>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 8 }}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
          keyboardShouldPersistTaps="handled"
        >
          {tasks.map((task) => (
            <BoardTaskCard
              key={task.id}
              task={task}
              onPress={onTaskPress}
            />
          ))}

          {tasks.length === 0 ? (
            <View className="min-h-[140px] items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50">
              <Text className="text-[13px] text-gray-400">Drop tasks here</Text>
            </View>
          ) : null}
        </ScrollView>
      </Droppable>
    </View>
  );
};
