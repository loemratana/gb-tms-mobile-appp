import { themeTokens } from "./colorScheme";

/**
 * Semantic tones shared by badges, status dots, priority flags and charts.
 * `color` = dot / icon / solid fill, `subtle` = light background, `fg` = text on `subtle`.
 */
export type Tone = "neutral" | "info" | "success" | "warning" | "error" | "violet" | "faint";

export type ToneColors = { color: string; subtle: string; fg: string };

export const toneColors: Record<Tone, ToneColors> = {
  neutral: { color: themeTokens.fg.soft, subtle: themeTokens.subtle, fg: themeTokens.fg.sub },
  info: { color: themeTokens.info.DEFAULT, subtle: themeTokens.info.subtle, fg: themeTokens.info.fg },
  success: { color: themeTokens.success.DEFAULT, subtle: themeTokens.success.subtle, fg: themeTokens.success.fg },
  warning: { color: themeTokens.warning.DEFAULT, subtle: themeTokens.warning.subtle, fg: themeTokens.warning.fg },
  error: { color: themeTokens.error.DEFAULT, subtle: themeTokens.error.subtle, fg: themeTokens.error.fg },
  violet: { color: themeTokens.violet.DEFAULT, subtle: themeTokens.violet.subtle, fg: themeTokens.violet.fg },
  faint: { color: themeTokens.fg.faint, subtle: themeTokens.subtle, fg: themeTokens.fg.soft },
};

/** App-side task statuses (`TaskStatus` in features/tasks/types/taskView.types). */
export const taskStatusTone = {
  todo: "warning",
  in_progress: "info",
  review: "violet",
  done: "success",
  cancelled: "neutral",
} as const satisfies Record<string, Tone>;

/** API task statuses (`TaskStatus` in features/tasks/types/task.types). */
export const apiTaskStatusTone = {
  TODO: "warning",
  IN_PROGRESS: "info",
  IN_REVIEW: "violet",
  APPROVED: "success",
  DONE: "success",
  REJECTED: "error",
  BLOCKED: "warning",
  CANCELLED: "neutral",
} as const satisfies Record<string, Tone>;

/** Priorities, in either the app's lowercase or the API's uppercase form. */
export const priorityTone = {
  low: "neutral",
  medium: "info",
  high: "warning",
  urgent: "error",
  LOW: "neutral",
  MEDIUM: "info",
  HIGH: "warning",
  URGENT: "error",
} as const satisfies Record<string, Tone>;
