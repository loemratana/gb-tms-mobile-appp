import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  addTaskComment,
  assignAdditionalUsers,
  assignTask,
  changeTaskStatus,
  createTask,
  deleteTask,
  updateTask,
  updateTaskReminderSettings,
} from "@/services/tasks.service";
import { deleteTaskAttachment, uploadTaskAttachment } from "@/services/attachments.service";
import { invalidateTaskListsAndSummaries, taskKeys } from "./useTasks";
import type {
  AssignMultipleUsersRequest,
  AssignTaskRequest,
  CreateTaskCommentRequest,
  CreateTaskRequest,
  TaskCommentResponse,
  TaskParticipant,
  TaskResponse,
  TaskStatus,
  UpdateTaskReminderSettingsRequest,
  UpdateTaskRequest,
} from "@/features/tasks/types/task.types";

type AttachmentUploadFile = { uri: string; name: string; mimeType: string };

type AttachmentUploadResult = {
  uploaded: number;
  failed: number;
  total: number;
  /** The first failure's error, so the caller can say why (e.g. file type not allowed). */
  firstError?: unknown;
};

/** Uploads files in parallel; one failed file doesn't fail the batch, so the caller can report partial success. */
export function useUploadTaskAttachments(taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (files: AttachmentUploadFile[]): Promise<AttachmentUploadResult> => {
      const results = await Promise.allSettled(
        files.map((file) => uploadTaskAttachment(taskId, file)),
      );
      const uploaded = results.filter((result) => result.status === "fulfilled").length;
      const firstFailure = results.find((result) => result.status === "rejected");
      return {
        uploaded,
        failed: results.length - uploaded,
        total: results.length,
        firstError: firstFailure?.status === "rejected" ? firstFailure.reason : undefined,
      };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: taskKeys.attachments(taskId) });
    },
  });
}

export function useDeleteTaskAttachment(taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (attachmentId: string) => deleteTaskAttachment(attachmentId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: taskKeys.attachments(taskId) });
    },
  });
}

export function useDeleteTask(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteTask(id),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: taskKeys.detail(id) });
      invalidateTaskListsAndSummaries(queryClient);
    },
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTaskRequest) => createTask(input),
    onSuccess: () => {
      invalidateTaskListsAndSummaries(queryClient);
    },
  });
}

function cacheTaskDetail(
  queryClient: ReturnType<typeof useQueryClient>,
  task: TaskResponse
): void {
  queryClient.setQueryData(taskKeys.detail(task.id), task);
  invalidateTaskListsAndSummaries(queryClient);
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
      invalidateTaskListsAndSummaries(queryClient);
    },
  });
}

/** Changes any task's status; the target id is passed per call (list screens act on many tasks). */
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

/**
 * Sends a comment and shows it in the thread immediately (marked pending) instead of waiting for
 * the server. On failure the thread rolls back and the caller gets the error to show.
 */
export function useAddTaskComment(taskId: string, author?: TaskParticipant | null) {
  const queryClient = useQueryClient();
  const key = taskKeys.comments(taskId);

  return useMutation({
    mutationFn: (input: CreateTaskCommentRequest) => addTaskComment(taskId, input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<TaskCommentResponse[]>(key);
      const optimistic: TaskCommentResponse = {
        id: `pending-${Date.now()}`,
        content: input.content,
        author: author ?? null,
        createdAt: new Date().toISOString(),
        pending: true,
      };
      queryClient.setQueryData<TaskCommentResponse[]>(key, [...(previous ?? []), optimistic]);
      return { previous };
    },
    onError: (_error, _input, context) => {
      queryClient.setQueryData(key, context?.previous);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: key });
      invalidateTaskListsAndSummaries(queryClient);
    },
  });
}
