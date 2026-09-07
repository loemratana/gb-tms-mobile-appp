import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  addTaskComment,
  assignAdditionalUsers,
  assignTask,
  changeTaskStatus,
  createTask,
  updateTask,
  updateTaskReminderSettings,
} from "@/services/tasks.service";
import { taskKeys } from "@/features/tasks/hooks/useTasks";
import type {
  AssignMultipleUsersRequest,
  AssignTaskRequest,
  CreateTaskCommentRequest,
  CreateTaskRequest,
  TaskResponse,
  TaskStatus,
  UpdateTaskReminderSettingsRequest,
  UpdateTaskRequest,
} from "@/features/tasks/types/task.types";

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTaskRequest) => createTask(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
}

function cacheTaskDetail(
  queryClient: ReturnType<typeof useQueryClient>,
  task: TaskResponse
): void {
  queryClient.setQueryData(taskKeys.detail(task.id), task);
  void queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
}

export function useUpdateTask(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateTaskRequest) => updateTask(id, input),
    onSuccess: (task) => cacheTaskDetail(queryClient, task),
  });
}

export function useAssignTask(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AssignTaskRequest) => assignTask(id, input),
    onSuccess: (task) => cacheTaskDetail(queryClient, task),
  });
}

export function useAssignAdditionalUsers(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AssignMultipleUsersRequest) => assignAdditionalUsers(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: taskKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
}

export function useChangeTaskStatus(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (status: TaskStatus) => changeTaskStatus(id, status),
    onSuccess: (task) => cacheTaskDetail(queryClient, task),
  });
}

/** Same as {@link useChangeTaskStatus}, but for list screens with many tasks
 * where the target id isn't known until the mutation is triggered. */
export function useChangeAnyTaskStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      changeTaskStatus(id, status),
    onSuccess: (task) => cacheTaskDetail(queryClient, task),
  });
}

export function useUpdateTaskReminderSettings(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateTaskReminderSettingsRequest) =>
      updateTaskReminderSettings(id, input),
    onSuccess: (settings) => {
      queryClient.setQueryData(taskKeys.reminderSettings(id), settings);
      void queryClient.invalidateQueries({ queryKey: taskKeys.reminderSettings(id) });
    },
  });
}

export function useAddTaskComment(taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTaskCommentRequest) => addTaskComment(taskId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: taskKeys.comments(taskId) });
    },
  });
}
