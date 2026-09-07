import { api, type ApiEnvelope } from "@/lib/api";
import type { PageResponse } from "@/features/tasks/types/task.types";
import type {
  AssignManagerRequest,
  AssignOrgRequest,
  AssignRoleRequest,
  EmployeeHierarchy,
  UserCreateRequest,
  UserManagerInfo,
  UserResponse,
  UserSearchParams,
  UserUpdateRequest,
} from "@/features/users/types/user.types";

export async function createUser(input: UserCreateRequest): Promise<UserResponse> {
  const { data } = await api.post<ApiEnvelope<UserResponse>>("/users", input);
  return data.data;
}

export async function searchUsers(
  params: UserSearchParams = {}
): Promise<PageResponse<UserResponse>> {
  const { data } = await api.get<ApiEnvelope<PageResponse<UserResponse>>>("/users", {
    params,
  });
  return data.data;
}

export async function getCurrentUser(): Promise<UserResponse> {
  const { data } = await api.get<ApiEnvelope<UserResponse>>("/users/me");
  return data.data;
}

export async function getUserById(id: string): Promise<UserResponse> {
  const { data } = await api.get<ApiEnvelope<UserResponse>>(`/users/${id}`);
  return data.data;
}

export async function updateUser(
  id: string,
  input: UserUpdateRequest
): Promise<UserResponse> {
  const { data } = await api.put<ApiEnvelope<UserResponse>>(`/users/${id}`, input);
  return data.data;
}

export async function deactivateUser(id: string): Promise<void> {
  await api.delete(`/users/${id}`);
}

export async function reactivateUser(id: string): Promise<void> {
  await api.patch(`/users/${id}/activate`);
}

export async function assignUserRole(
  id: string,
  input: AssignRoleRequest
): Promise<UserResponse> {
  const { data } = await api.put<ApiEnvelope<UserResponse>>(`/users/${id}/role`, input);
  return data.data;
}

/** null when the user has no manager (top-level). */
export async function getUserManager(id: string): Promise<UserManagerInfo | null> {
  const { data } = await api.get<ApiEnvelope<UserManagerInfo | null>>(`/users/${id}/manager`);
  return data.data;
}

/** Direct reports only — not recursive. Use getUserHierarchy for the full downline. */
export async function getDirectReports(id: string): Promise<UserResponse[]> {
  const { data } = await api.get<ApiEnvelope<UserResponse[]>>(`/users/${id}/reports`);
  return data.data;
}

export async function getUserHierarchy(id: string): Promise<EmployeeHierarchy> {
  const { data } = await api.get<ApiEnvelope<EmployeeHierarchy>>(`/users/${id}/hierarchy`);
  return data.data;
}

/** Admin only — rejects self-assignment, inactive managers, and cycles server-side. */
export async function assignManager(
  id: string,
  input: AssignManagerRequest
): Promise<UserResponse> {
  const { data } = await api.patch<ApiEnvelope<UserResponse>>(`/users/${id}/manager`, input);
  return data.data;
}

/** Admin only. Does not change manager_id — use assignManager for reporting-line changes. */
export async function assignOrg(id: string, input: AssignOrgRequest): Promise<UserResponse> {
  const { data } = await api.patch<ApiEnvelope<UserResponse>>(`/users/${id}/org`, input);
  return data.data;
}

export async function uploadUserAvatar(
  id: string,
  file: { uri: string; name: string; type: string }
): Promise<UserResponse> {
  const formData = new FormData();
  formData.append("file", file as unknown as Blob);

  const { data } = await api.post<ApiEnvelope<UserResponse>>(
    `/users/${id}/avatar`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data.data;
}
