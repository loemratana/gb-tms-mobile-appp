import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  assignDepartmentManager,
  createDepartment,
  deleteDepartment,
  updateDepartment,
} from "@/services/departments.service";
import { departmentKeys } from "@/features/departments/hooks/useDepartments";
import type {
  AssignManagerRequest,
  DepartmentRequest,
  DepartmentResponse,
} from "@/features/departments/types/department.types";

export function useCreateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: DepartmentRequest) => createDepartment(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: departmentKeys.lists() });
    },
  });
}

function cacheDepartment(
  queryClient: ReturnType<typeof useQueryClient>,
  department: DepartmentResponse
): void {
  queryClient.setQueryData(departmentKeys.detail(department.id), department);
  void queryClient.invalidateQueries({ queryKey: departmentKeys.lists() });
}

export function useUpdateDepartment(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: DepartmentRequest) => updateDepartment(id, input),
    onSuccess: (department) => cacheDepartment(queryClient, department),
  });
}

export function useAssignDepartmentManager(departmentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AssignManagerRequest) =>
      assignDepartmentManager(departmentId, input),
    onSuccess: (department) => cacheDepartment(queryClient, department),
  });
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteDepartment(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: departmentKeys.lists() });
    },
  });
}
