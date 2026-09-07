import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useCallback } from "react";
import { ActivityIndicator, Image, Pressable, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { applyShadow, pressScale, shadows } from "@/styles";

import {
  formatDate,
  getPriorityLabel,
  getStatusColor,
  getStatusLabel,
  getTaskDisplayProgress,
  isTaskOverdue,
} from "../helpers/helpers";
import type { Task } from "../types/types";

interface TaskCardProps {
  task: Task;
  /** Current employee's user id — used for the "You" assignee badge */
  currentUserId?: string;
  onPress?: (task: Task) => void;
  /** Confirms a newly-assigned task, moving it into progress. Only shown for
   * tasks that are still "todo" and assigned to the current employee. */
  onConfirm?: (task: Task) => void;
  confirming?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  currentUserId,
  onPress,
  onConfirm,
  confirming = false,
}) => {
  const statusColor = getStatusColor(task.status);
  const statusLabel = getStatusLabel(task.status);
  const priorityLabel = getPriorityLabel(task.priority);
  const displayProgress = getTaskDisplayProgress(task);
  const overdue = isTaskOverdue(task);
  const showProgress = task.status !== "done" && task.status !== "cancelled";

  const assignees = task.assignees ?? [];
  const assignedToMe = Boolean(currentUserId) && assignees.some(
    (person) => person.id === currentUserId
  );
  const showConfirm = Boolean(onConfirm) && assignedToMe && task.status === "todo";

  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const handlePressIn = useCallback(() => {
    scale.value = withSpring(pressScale, { damping: 18, stiffness: 320 });
  }, [scale]);
  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 18, stiffness: 320 });
  }, [scale]);

  return (
    <Animated.View style={[animatedStyle, { width: "100%" }]} className="mb-3">
      <Pressable
        onPress={() => onPress?.(task)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel={task.title}
        className="w-full rounded-2xl border border-[#E5E7EB] bg-white p-4"
        style={applyShadow(shadows.sm)}
      >
        <View className="flex-row items-start justify-between gap-3">
          <View className="min-w-0 flex-1 flex-row items-start gap-2.5">
            <View
              className="mt-1.5 h-2 w-2 rounded-full"
              style={{ backgroundColor: statusColor }}
            />
            <Text
              className="min-w-0 flex-1 text-[15px] font-bold leading-5 text-[#111827]"
              numberOfLines={2}
            >
              {task.title}
            </Text>
          </View>

          <View className="flex-row items-center">
            {assignedToMe ? (
              <View className="mr-1.5 h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[#F3F4F6]">
                <Text className="text-[9px] font-bold text-[#374151]">You</Text>
              </View>
            ) : null}
            <View className="flex-row">
              {assignees.slice(0, 3).map((person, idx) =>
                person.avatarUrl ? (
                  <Image
                    key={`${task.id}-${person.name}-${idx}`}
                    source={{ uri: person.avatarUrl }}
                    className="h-6 w-6 rounded-full border-2 border-white bg-[#E5E7EB]"
                    style={{ marginLeft: idx > 0 ? -8 : 0 }}
                  />
                ) : (
                  <View
                    key={`${task.id}-${person.name}-${idx}`}
                    className="h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[#E5E7EB]"
                    style={{ marginLeft: idx > 0 ? -8 : 0 }}
                  >
                    <Ionicons name="person" size={10} color="#6B7280" />
                  </View>
                )
              )}
            </View>
          </View>
        </View>

        {task.description ? (
          <Text className="ml-4.5 mt-1 text-[12px] text-[#9CA3AF]" numberOfLines={1}>
            {task.description}
          </Text>
        ) : null}

        <View className="ml-4.5 mt-3 flex-row items-center">
          <Ionicons
            name="time-outline"
            size={13}
            color={overdue ? "#EF4444" : "#9CA3AF"}
          />
          <Text
            className="ml-1 text-[12px] font-medium"
            style={{ color: overdue ? "#EF4444" : "#6B7280" }}
          >
            {formatDate(task.dueDate)}
          </Text>

          <View className="mx-2 h-0.5 w-0.5 rounded-full bg-[#D1D5DB]" />

          <Ionicons name="flag-outline" size={12} color="#9CA3AF" />
          <Text className="ml-1 text-[12px] font-medium text-[#6B7280]">
            {priorityLabel}
          </Text>

          <Text
            className="ml-auto text-[11px] font-bold tracking-wide"
            style={{ color: statusColor }}
          >
            {statusLabel}
          </Text>
        </View>

        {showProgress ? (
          <View className="ml-4.5 mt-3 h-1 overflow-hidden rounded-full bg-[#F3F4F6]">
            <View
              className="h-full rounded-full"
              style={{ width: `${displayProgress}%`, backgroundColor: statusColor }}
            />
          </View>
        ) : null}

        {showConfirm ? (
          <Pressable
            onPress={() => onConfirm?.(task)}
            disabled={confirming}
            accessibilityRole="button"
            accessibilityLabel="Confirm task"
            className="ml-4.5 mt-3 flex-row items-center justify-center rounded-xl py-2.5"
            style={{ backgroundColor: confirming ? "#A7F3A7" : "#32CD32" }}
          >
            {confirming ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={16} color="#FFFFFF" />
                <Text className="ml-1.5 text-[13px] font-bold text-white">
                  Confirm Task
                </Text>
              </>
            )}
          </Pressable>
        ) : null}
      </Pressable>
    </Animated.View>
  );
};
