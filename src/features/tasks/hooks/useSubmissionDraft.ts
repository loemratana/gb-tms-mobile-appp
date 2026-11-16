import { useCallback, useEffect, useRef } from "react";

import { getItem, removeItem, setItem } from "@/lib/storage";
import { useAuthStore } from "@/stores/authStore";

/** The typed part of a work submission. Attachments aren't kept: picked files can be temporary. */
export type SubmissionDraft = { note: string; lateReason: string };

const SAVE_DELAY_MS = 600;

type SubmissionDraftStore = {
  load: () => Promise<SubmissionDraft | null>;
  /** Saves shortly after typing stops, so every keystroke isn't a storage write. */
  scheduleSave: (draft: SubmissionDraft) => void;
  clear: () => Promise<void>;
};

function isEmpty(draft: SubmissionDraft): boolean {
  return !draft.note.trim() && !draft.lateReason.trim();
}

function parseDraft(raw: string | null): SubmissionDraft | null {
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (
      typeof value === "object" &&
      value !== null &&
      "note" in value &&
      "lateReason" in value &&
      typeof value.note === "string" &&
      typeof value.lateReason === "string"
    ) {
      return { note: value.note, lateReason: value.lateReason };
    }
  } catch {
    // A corrupt draft is simply dropped.
  }
  return null;
}

/**
 * Keeps an unsent work note per task and user, so closing the sheet or leaving the app doesn't
 * lose what was typed. Cleared once the submission goes through.
 */
export function useSubmissionDraft(taskId: string | undefined): SubmissionDraftStore {
  const userId = useAuthStore((state) => state.user?.id);
  const key = taskId && userId ? `@tms/submission_draft/${userId}/${taskId}` : null;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // What the pending timer will write, so leaving the screen can write it right away instead.
  const pendingRef = useRef<{ key: string; draft: SubmissionDraft } | null>(null);

  const cancelPendingSave = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    pendingRef.current = null;
  }, []);

  const writeNow = useCallback((target: string, draft: SubmissionDraft) => {
    void (isEmpty(draft) ? removeItem(target) : setItem(target, JSON.stringify(draft)));
  }, []);

  useEffect(
    () => () => {
      const pending = pendingRef.current;
      if (timerRef.current) clearTimeout(timerRef.current);
      if (pending) writeNow(pending.key, pending.draft);
    },
    [writeNow],
  );

  const load = useCallback(async () => (key ? parseDraft(await getItem(key)) : null), [key]);

  const scheduleSave = useCallback(
    (draft: SubmissionDraft) => {
      if (!key) return;
      cancelPendingSave();
      pendingRef.current = { key, draft };
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        pendingRef.current = null;
        writeNow(key, draft);
      }, SAVE_DELAY_MS);
    },
    [key, cancelPendingSave, writeNow],
  );

  const clear = useCallback(async () => {
    cancelPendingSave();
    if (key) await removeItem(key);
  }, [key, cancelPendingSave]);

  return { load, scheduleSave, clear };
}
