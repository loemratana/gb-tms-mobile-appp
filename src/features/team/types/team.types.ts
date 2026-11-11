export type TeamRosterMember = {
  id: string;
  name: string;
  email: string;
  phoneNumber: string | null;
  role: string;
  /** null when the person hasn't uploaded a photo — `Avatar` shows their initials. */
  avatarUrl: string | null;
  isManager: boolean;
};

export type TeamRosterInfo = {
  department: string;
  description: string | null;
  memberCount: number;
  managerName: string;
  /** The manager's photo, when the manager is one of the listed members. */
  managerAvatarUrl: string | null;
};
