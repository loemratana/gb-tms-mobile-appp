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
  phoneNumber: string | null;
  avatarUrl: string | null;
  position: DepartmentMemberPositionRef | null;
};

export type DepartmentTreePositionNode = {
  id: string;
  name: string;
  members: DepartmentMemberResponse[];
};

/** Department → positions → active members. Departments have no parent, so there is no department nesting. */
export type DepartmentTreeNode = {
  id: string;
  name: string;
  description: string | null;
  manager: DepartmentManagerRef | null;
  memberCount: number;
  positions: DepartmentTreePositionNode[];
  /** Members of the department with no position. */
  unassignedMembers: DepartmentMemberResponse[];
};
