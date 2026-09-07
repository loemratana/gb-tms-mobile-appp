export type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

export type UserPositionRef = { id: string; name: string };
export type UserDepartmentRef = { id: string; name: string };
export type UserManagerRef = { id: string; name: string };
export type UserRoleRef = { id: string; name: string };

export type UserResponse = {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  status: UserStatus;
  active: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  position: UserPositionRef | null;
  department: UserDepartmentRef | null;
  manager: UserManagerRef | null;
  /** A user has exactly one role — see task-management-api's User.role (role_id, NOT NULL). */
  role: UserRoleRef;
};

export type UserCreateRequest = {
  email: string;
  password: string;
  fullName: string;
  positionId?: string;
  managerId?: string;
  roleId: string;
  avatarUrl?: string;
};

export type UserUpdateRequest = {
  email?: string;
  fullName?: string;
  /** Sic — typo in the real API field name (`avartarUrl`, not `avatarUrl`). Send exactly this key. */
  avartarUrl?: string;
  positionId?: string;
  managerId?: string;
  roleId?: string;
};

export type AssignRoleRequest = {
  roleId: string;
};

export type AssignManagerRequest = {
  /** null clears the manager, making the user top-level. */
  managerId: string | null;
};

export type AssignOrgRequest = {
  /** Either field may be omitted to leave it unchanged; at least one must be provided. */
  departmentId?: string;
  positionId?: string;
};

export type UserManagerInfo = {
  id: string;
  name: string;
  email: string | null;
  profile: string | null;
};

/** One employee within a management chain or subordinate listing (GET /{id}/hierarchy). */
export type OrgMemberRef = {
  id: string;
  fullName: string;
  email: string | null;
  avatarUrl: string | null;
  position: UserPositionRef | null;
  department: UserDepartmentRef | null;
  managerId: string | null;
  /** Distance from the employee the query was anchored on. */
  level: number;
};

export type EmployeeHierarchy = {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  /** Depth below the top-level (root) employee; 0 = top-level. */
  level: number;
  /** Ancestors from the immediate manager up to the root. Empty if top-level. */
  managementChain: OrgMemberRef[];
  /** Every employee under this one, at any depth, top-down. Empty if a leaf. */
  subordinates: OrgMemberRef[];
};

export type UserSearchParams = {
  keyword?: string;
  departmentId?: string;
  positionId?: string;
  managerId?: string;
  roleId?: string;
  userStatus?: UserStatus;
  active?: boolean;
  page?: number;
  size?: number;
  sort?: string;
};
