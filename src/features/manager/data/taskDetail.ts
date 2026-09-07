import type { Task } from "@/features/employee/types/types";

export type TaskAttachment = {
  id: string;
  name: string;
  type: "image" | "document";
  size: string;
  uri: string;
};

export type ManagerTaskDetailExtras = {
  attachments: TaskAttachment[];
};

const DEFAULT_ATTACHMENTS: TaskAttachment[] = [
  {
    id: "a2",
    name: "checkout-preview.png",
    type: "image",
    size: "1.1 MB",
    uri: "https://picsum.photos/seed/tms-checkout/1400/1000",
  },
  {
    id: "a4",
    name: "dashboard-mockup.png",
    type: "image",
    size: "980 KB",
    uri: "https://picsum.photos/seed/tms-dashboard/1400/1000",
  },
  {
    id: "a3",
    name: "api-notes.pdf",
    type: "document",
    size: "860 KB",
    uri: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  },
  {
    id: "a1",
    name: "mobile-flow-v2.fig",
    type: "document",
    size: "4.2 MB",
    uri: "https://picsum.photos/seed/tms-flow/1400/1000",
  },
];

/**
 * Attachments have no backend endpoint yet (see TaskDetailScreen's own
 * "not wired up to the backend yet" note on the employee side) — these stay
 * a fixed demo set until an upload API exists.
 */
export function getManagerTaskDetailExtras(task: Task): ManagerTaskDetailExtras {
  return {
    attachments: DEFAULT_ATTACHMENTS,
  };
}
