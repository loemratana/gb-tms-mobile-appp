export type TeamRosterMember = {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl: string;
  isManager: boolean;
};

export type TeamRosterInfo = {
  department: string;
  description: string | null;
  memberCount: number;
  managerName: string;
};
