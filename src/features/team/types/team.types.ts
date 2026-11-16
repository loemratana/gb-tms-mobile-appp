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

/** What the team card describes: the viewer's department, or the people who report to them. */
export type TeamRosterInfo = {
  kind: "department" | "directReports";
  /** Department name, or "Reporting to you". */
  title: string;
  /** Department description, or which department the reports are in. */
  description: string | null;
  memberCount: number;
  /** Who leads this group: the department manager, or the viewer for their reports. */
  leadName: string;
  /** The lead's photo, when known. */
  leadAvatarUrl: string | null;
  isLeadYou: boolean;
};
