import {
  DndProvider,
  type DndProviderProps,
} from "@mgcrea/react-native-dnd";
import React, { useCallback } from "react";
import { ScrollView, View } from "react-native";
import { runOnJS } from "react-native-reanimated";

import { Task, TaskStatus } from "../types/types";
import { BoardColumn } from "./BoardColumn";

const COLUMNS: TaskStatus[] = ["todo", "in_progress", "review", "done"];

type TaskBoardProps = {
  tasks: Task[];
  onMoveTask: (taskId: string, status: TaskStatus) => void;
  onTaskPress?: (task: Task) => void;
};

export function TaskBoard({ tasks, onMoveTask, onTaskPress }: TaskBoardProps) {
  const tasksByStatus = COLUMNS.reduce(
    (groups, status) => {
      groups[status] = tasks.filter((task) => task.status === status);
      return groups;
    },
    {
      todo: [],
      in_progress: [],
      review: [],
      done: [],
      cancelled: [],
    } as Record<TaskStatus, Task[]>
  );

  const moveTask = useCallback(
    (taskId: string, status: TaskStatus) => {
      onMoveTask(taskId, status);
    },
    [onMoveTask]
  );

  const handleDragEnd = useCallback<NonNullable<DndProviderProps["onDragEnd"]>>(
    ({ active, over }) => {
      "worklet";
      if (!over) return;

      const taskId = String(active.id);
      const nextStatus = String(over.id) as TaskStatus;
      if (!COLUMNS.includes(nextStatus)) return;

      runOnJS(moveTask)(taskId, nextStatus);
    },
    [moveTask]
  );

  return (
    <View className="flex-1">
      <DndProvider
        activationDelay={300}
        onDragEnd={handleDragEnd}
        style={{ flex: 1 }}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-1"
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 16,
            paddingTop: 8,
            paddingBottom: 20,
          }}
        >
          {COLUMNS.map((status) => (
            <BoardColumn
              key={status}
              status={status}
              tasks={tasksByStatus[status]}
              onTaskPress={onTaskPress}
            />
          ))}
        </ScrollView>
      </DndProvider>
    </View>
  );
}
