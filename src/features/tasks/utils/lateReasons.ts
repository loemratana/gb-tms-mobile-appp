/** A ready-made answer to "why is this late?", so most people can answer with one tap. */
export type LateReasonPreset = {
  id: string;
  /** Sent to the server and shown to the reviewer. */
  label: string;
  icon: "hourglass-outline" | "git-branch-outline" | "flash-outline" | "construct-outline" | "medkit-outline";
};

export const LATE_REASON_PRESETS: readonly LateReasonPreset[] = [
  // Waiting for approval or information from someone else
  { id: "waiting", label: "រង់ចាំការអនុម័ត ឬព័ត៌មានពីអ្នកដទៃ", icon: "hourglass-outline" },
  // The work was more complex than expected
  { id: "complex", label: "ការងារស្មុគស្មាញជាងការរំពឹងទុក", icon: "git-branch-outline" },
  // Other urgent work had to come first
  { id: "urgent", label: "មានការងារបន្ទាន់ផ្សេងទៀតត្រូវធ្វើមុន", icon: "flash-outline" },
  // Technical or equipment problems
  { id: "technical", label: "មានបញ្ហាបច្ចេកទេស ឬឧបករណ៍", icon: "construct-outline" },
  // Sick or a personal matter
  { id: "personal", label: "ឈឺ ឬមានធុរៈផ្ទាល់ខ្លួន", icon: "medkit-outline" },
];

/** "Other": the person writes their own reason. */
export const OTHER_LATE_REASON_ID = "other";

/** A preset, plus any extra detail the person added: "រង់ចាំការអនុម័ត… — finance signs on Friday". */
export function composeLateReason(presetLabel: string | undefined, detail: string): string {
  const extra = detail.trim();
  if (!presetLabel) return extra;
  return extra ? `${presetLabel} — ${extra}` : presetLabel;
}

/**
 * Turns a saved reason back into the popup's choice, so reopening it shows what was picked before.
 * A reason that doesn't start with a preset is treated as "Other" with the whole text as detail.
 */
export function splitLateReason(reason: string): { presetId: string | undefined; detail: string } {
  const text = reason.trim();
  if (!text) return { presetId: undefined, detail: "" };
  const preset = LATE_REASON_PRESETS.find((item) => text === item.label || text.startsWith(`${item.label} — `));
  if (!preset) return { presetId: OTHER_LATE_REASON_ID, detail: text };
  return { presetId: preset.id, detail: text.slice(preset.label.length).replace(/^ — /, "") };
}
