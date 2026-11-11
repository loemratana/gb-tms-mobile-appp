/** A person who can be picked as a task assignee. */
export type AssigneeOption = {
  id: string;
  name: string;
  /** Null when the person has no photo; `Avatar` then shows their initials. */
  avatar: string | null;
};
