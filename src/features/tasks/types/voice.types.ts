import type { Priority } from "@/features/tasks/types/task.types";

export type VoiceTranscribeResponse = {
  text: string;
  language: string;
};

export type VoiceAssigneeCandidate = {
  userId: string;
  fullName: string;
  /** Backend-computed match confidence against the department roster, 0-1. */
  score: number;
};

export type VoiceParseResponse = {
  title: string;
  description: string | null;
  priority: Priority;
  dueDate: string | null;
  /** The Khmer phrase the due date was resolved from (e.g. "ថ្ងៃស្អែក"), for display only. */
  dueDateText: string | null;
  assigneeCandidates: VoiceAssigneeCandidate[];
};

export type VoiceParseRequest = {
  text: string;
  language: string;
  departmentId: string;
};

/** Structurally matches `AssigneePickerOption` so callers can pass that array in directly. */
export type VoiceAssigneeOption = {
  id: string;
  name: string;
  avatar: string;
};
