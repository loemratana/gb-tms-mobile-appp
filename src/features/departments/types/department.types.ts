export type DepartmentManagerRef = {
  id: string;
  name: string;
  email: string;
  profile: string;
};

export type DepartmentResponse = {
  id: string;
  name: string;
  description: string | null;
  manager: DepartmentManagerRef | null;
  avatar: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type DepartmentRequest = {
  name: string;
  description?: string;
  managerId?: string;
};

export type AssignManagerRequest = {
  managerId: string;
};

export type DepartmentMemberPositionRef = {
  id: string;
  name: string;
};

export type DepartmentMemberResponse = {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  position: DepartmentMemberPositionRef | null;
};
