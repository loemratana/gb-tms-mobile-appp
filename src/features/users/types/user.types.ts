export type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

export type UserPositionRef = { id: string; name: string };
export type UserDepartmentRef = { id: string; name: string };
export type UserManagerRef = { id: string; name: string };
export type UserRoleRef = { id: string; name: string };

export type UserResponse = {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string | null;
  avatarUrl: string | null;
  status: UserStatus;
  active: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  position: UserPositionRef | null;
  department: UserDepartmentRef | null;
  manager: UserManagerRef | null;
  /** Older API shape: a single role. */
  role?: UserRoleRef | null;
  /** Current API shape (`UserResponse.roles`): a set of roles. */
  roles?: UserRoleRef[] | null;
  /** Effective permission names (e.g. "tasks:assign:team"). Only sent by `GET /users/me`. */
  permissions?: string[] | null;
};

export type UserCreateRequest = {
  email: string;
  password: string;
  fullName: string;
  /** Server pattern: optional "+", then 6–20 digits, spaces, "()" or "-". */
  phoneNumber?: string;
  positionId?: string;
  managerId?: string;
  roleId: string;
  avatarUrl?: string;
};

export type UserUpdateRequest = {
  email?: string;
  fullName?: string;
  phoneNumber?: string;
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

export type PerformanceRating = "EXCELLENT" | "GOOD" | "AVERAGE" | "NEEDS_IMPROVEMENT" | "NO_DATA";

export type PerformanceTaskBrief = {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string;
  progress: number;
  /** Negative when overdue. */
  daysUntilDue: number;
};

/** GET /users/{id}/performance — all rates are 0-100 with one decimal place. */
export type UserPerformanceResponse = {
  user: {
    id: string;
    fullName: string;
    email: string;
    avatarUrl: string | null;
    positionName: string | null;
    departmentName: string | null;
  };
  from: string | null;
  to: string | null;
  tasks: {
    total: number;
    active: number;
    completed: number;
    todo: number;
    inProgress: number;
    inReview: number;
    rejected: number;
    blocked: number;
    cancelled: number;
    overdue: number;
    completedOnTime: number;
    completedLate: number;
  };
  rates: {
    completionRate: number;
    onTimeRate: number;
    overdueRate: number;
  };
  effort: {
    avgCompletionDays: number | null;
    totalEstimatedHours: number;
    totalActualHours: number;
    estimateAccuracy: number | null;
  };
  submissions: {
    total: number;
    approved: number;
    rejected: number;
    pending: number;
    approvalRate: number;
    firstPassApprovalRate: number;
    avgRoundsPerTask: number;
  };
  /** 0-100: 40% completion, 30% on-time, 30% first-pass approval. */
  performanceScore: number;
  rating: PerformanceRating;
  statusBreakdown: { status: string; count: number }[];
  priorityBreakdown: { priority: string; total: number; completed: number; overdue: number; completionRate: number }[];
  /** Last 6 months, oldest first; month is "yyyy-MM". */
  monthlyTrend: { month: string; assigned: number; completed: number; completedOnTime: number }[];
  upcomingDeadlines: PerformanceTaskBrief[];
  overdueTasks: PerformanceTaskBrief[];
  insights: string[];
};

export type UserPerformanceParams = {
  /** yyyy-MM-dd, filters by task creation date. */
  from?: string;
  to?: string;
};
