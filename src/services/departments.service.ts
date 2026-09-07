import { api, type ApiEnvelope } from "@/lib/api";
import type {
  AssignManagerRequest,
  DepartmentMemberResponse,
  DepartmentRequest,
  DepartmentResponse,
} from "@/features/departments/types/department.types";

export async function listDepartments(): Promise<DepartmentResponse[]> {
  const { data } = await api.get<ApiEnvelope<DepartmentResponse[]>>("/departments");
  return data.data;
}

export async function getDepartmentMembers(
  departmentId: string
): Promise<DepartmentMemberResponse[]> {
  const { data } = await api.get<ApiEnvelope<DepartmentMemberResponse[]>>(
    `/departments/${departmentId}/members`
  );
  return data.data;
}

export async function getDepartmentById(id: string): Promise<DepartmentResponse> {
  const { data } = await api.get<ApiEnvelope<DepartmentResponse>>(`/departments/${id}`);
  return data.data;
}

export async function createDepartment(
  input: DepartmentRequest
): Promise<DepartmentResponse> {
  const { data } = await api.post<ApiEnvelope<DepartmentResponse>>("/departments", input);
  return data.data;
}

export async function updateDepartment(
  id: string,
  input: DepartmentRequest
): Promise<DepartmentResponse> {
  const { data } = await api.put<ApiEnvelope<DepartmentResponse>>(
    `/departments/${id}`,
    input
  );
  return data.data;
}

export async function deleteDepartment(id: string): Promise<void> {
  await api.delete(`/departments/${id}`);
}

export async function assignDepartmentManager(
  departmentId: string,
  input: AssignManagerRequest
): Promise<DepartmentResponse> {
  const { data } = await api.put<ApiEnvelope<DepartmentResponse>>(
    `/departments/${departmentId}/manager`,
    input
  );
  return data.data;
}
