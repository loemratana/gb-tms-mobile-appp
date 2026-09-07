import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  assignManager,
  assignOrg,
  assignUserRole,
  createUser,
  deactivateUser,
  reactivateUser,
  updateUser,
  uploadUserAvatar,
} from "@/services/users.service";
import { userKeys } from "@/features/users/hooks/useUsers";
import type {
  AssignManagerRequest,
  AssignOrgRequest,
  AssignRoleRequest,
  UserCreateRequest,
  UserResponse,
  UserUpdateRequest,
} from "@/features/users/types/user.types";

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UserCreateRequest) => createUser(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

function cacheUser(
  queryClient: ReturnType<typeof useQueryClient>,
  user: UserResponse
): void {
  queryClient.setQueryData(userKeys.detail(user.id), user);

  // Keep GET /users/me in sync too, when the mutated user is the caller themself.
  const me = queryClient.getQueryData<UserResponse>(userKeys.me());
  if (me?.id === user.id) {
    queryClient.setQueryData(userKeys.me(), user);
  }

  void queryClient.invalidateQueries({ queryKey: userKeys.lists() });
}

export function useUpdateUser(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UserUpdateRequest) => updateUser(id, input),
    onSuccess: (user) => cacheUser(queryClient, user),
  });
}

/** Admin only — the backend rejects self-assignment, inactive managers, and cycles. */
export function useAssignManager(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AssignManagerRequest) => assignManager(id, input),
    onSuccess: (user) => {
      cacheUser(queryClient, user);
      void queryClient.invalidateQueries({ queryKey: userKeys.manager(id) });
      void queryClient.invalidateQueries({ queryKey: userKeys.hierarchy(id) });
    },
  });
}

/** Admin only. Does not change manager_id — use useAssignManager for reporting-line changes. */
export function useAssignOrg(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AssignOrgRequest) => assignOrg(id, input),
    onSuccess: (user) => cacheUser(queryClient, user),
  });
}

export function useAssignUserRole(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AssignRoleRequest) => assignUserRole(id, input),
    onSuccess: (user) => cacheUser(queryClient, user),
  });
}

export function useUploadUserAvatar(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: { uri: string; name: string; type: string }) =>
      uploadUserAvatar(id, file),
    onSuccess: (user) => cacheUser(queryClient, user),
  });
}

export function useDeactivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deactivateUser(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

export function useReactivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => reactivateUser(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}
