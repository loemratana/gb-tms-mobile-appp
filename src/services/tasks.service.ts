import { api, type ApiEnvelope } from "@/lib/api";
import type {
  AssignMultipleUsersRequest,
  AssignTaskRequest,
  CreateTaskCommentRequest,
  CreateTaskRequest,
  KpiSummaryResponse,
  ManagerAssignedKpiResponse,
  PageResponse,
  TaskAssignmentResponse,
  TaskCommentResponse,
  TaskReminderSettingsResponse,
  TaskResponse,
  TaskSearchParams,
  TaskStatus,
  UpdateTaskReminderSettingsRequest,
  UpdateTaskRequest,
} from "@/features/tasks/types/task.types";

export async function createTask(input: CreateTaskRequest): Promise<TaskResponse> {
  const { data } = await api.post<ApiEnvelope<TaskResponse>>("/tasks", input);
  return data.data;
}

export async function searchTasks(
  params: TaskSearchParams = {}
): Promise<PageResponse<TaskResponse>> {
  const { data } = await api.get<ApiEnvelope<PageResponse<TaskResponse>>>("/tasks", {
    params,
  });
  return data.data;
}

export async function getTaskById(id: string): Promise<TaskResponse> {
  const { data } = await api.get<ApiEnvelope<TaskResponse>>(`/tasks/${id}`);
  return data.data;
}

export async function updateTask(
  id: string,
  input: UpdateTaskRequest
): Promise<TaskResponse> {
  const { data } = await api.put<ApiEnvelope<TaskResponse>>(`/tasks/${id}`, input);
  return data.data;
}

export async function assignTask(
  id: string,
  input: AssignTaskRequest
): Promise<TaskResponse> {
  const { data } = await api.patch<ApiEnvelope<TaskResponse>>(
    `/tasks/${id}/assignee`,
    input
  );
  return data.data;
}

/** Adds one or more additional collaborators to a task beyond its primary assignee. */
export async function assignAdditionalUsers(
  id: string,
  input: AssignMultipleUsersRequest
): Promise<TaskAssignmentResponse[]> {
  const { data } = await api.post<ApiEnvelope<TaskAssignmentResponse[]>>(
    `/tasks/${id}/assignees`,
    input
  );
  return data.data;
}

export async function changeTaskStatus(
  id: string,
  status: TaskStatus
): Promise<TaskResponse> {
  const { data } = await api.patch<ApiEnvelope<TaskResponse>>(`/tasks/${id}/status`, {
    status,
  });
  return data.data;
}

export async function getTaskReminderSettings(
  id: string
): Promise<TaskReminderSettingsResponse> {
  const { data } = await api.get<ApiEnvelope<TaskReminderSettingsResponse>>(
    `/tasks/${id}/reminder-settings`
  );
  return data.data;
}

export async function updateTaskReminderSettings(
  id: string,
  input: UpdateTaskReminderSettingsRequest
): Promise<TaskReminderSettingsResponse> {
  const { data } = await api.patch<ApiEnvelope<TaskReminderSettingsResponse>>(
    `/tasks/${id}/reminder-settings`,
    input
  );
  return data.data;
}

export async function addTaskComment(
  taskId: string,
  input: CreateTaskCommentRequest
): Promise<TaskCommentResponse> {
  const { data } = await api.post<ApiEnvelope<TaskCommentResponse>>(
    `/tasks/${taskId}/comments`,
    input
  );
  return data.data;
}

export async function listTaskComments(
  taskId: string
): Promise<TaskCommentResponse[]> {
  const { data } = await api.get<ApiEnvelope<TaskCommentResponse[]>>(
    `/tasks/${taskId}/comments`
  );
  return data.data;
}

export async function getMyKpiSummary(): Promise<KpiSummaryResponse> {
  const { data } = await api.get<ApiEnvelope<KpiSummaryResponse>>("/tasks/me/kpi");
  return data.data;
}

export async function getManagerAssignedKpi(): Promise<ManagerAssignedKpiResponse> {
  const { data } = await api.get<ApiEnvelope<ManagerAssignedKpiResponse>>(
    "/tasks/me/assigned-kpi"
  );
  return data.data;
}
