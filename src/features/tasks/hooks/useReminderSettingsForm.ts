import { useCallback, useState } from "react";
import { Alert } from "react-native";

import { DEFAULT_REMINDER_TIMEZONE } from "@/features/tasks/utils/timezones";
import { useUpdateTaskReminderSettings } from "./useTaskMutations";
import { useTaskReminderSettings } from "./useTasks";
import { getApiErrorMessage } from "@/lib/api";

export const MAX_REMINDER_TIMES = 6;

type ReminderSettingsForm = {
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  isEnabled: boolean;
  setIsEnabled: (value: boolean) => void;
  timezone: string;
  setTimezone: (value: string) => void;
  /** "HH:mm", sorted ascending. */
  times: string[];
  /** Adds a time, or replaces the one at `index`. Duplicates are ignored. */
  saveTime: (value: string, index?: number) => void;
  removeTime: (index: number) => void;
  canAddTime: boolean;
  isDirty: boolean;
  isSaving: boolean;
  save: () => Promise<boolean>;
};

type Snapshot = { isEnabled: boolean; timezone: string; times: string[] };

const sameSnapshot = (a: Snapshot, b: Snapshot) =>
  a.isEnabled === b.isEnabled && a.timezone === b.timezone && a.times.join() === b.times.join();

/** Local edit state for a task's reminder settings, saved with `PATCH /tasks/{id}/reminder-settings`. */
export function useReminderSettingsForm(taskId: string | undefined): ReminderSettingsForm {
  const { data, isLoading, isError, refetch } = useTaskReminderSettings(taskId);
  const updateMutation = useUpdateTaskReminderSettings(taskId ?? "");

  const [saved, setSaved] = useState<Snapshot>({
    isEnabled: true,
    timezone: DEFAULT_REMINDER_TIMEZONE,
    times: [],
  });
  const [draft, setDraft] = useState<Snapshot>(saved);

  // Re-seed the form whenever the server copy changes (first load, or after a save).
  const [previousData, setPreviousData] = useState(data);
  if (data !== previousData) {
    setPreviousData(data);
    if (data) {
      const next = {
        isEnabled: data.enabled,
        timezone: data.timezone,
        times: [...data.reminderTimes].sort(),
      };
      setSaved(next);
      setDraft(next);
    }
  }

  const saveTime = useCallback((value: string, index?: number) => {
    setDraft((previous) => {
      const others = previous.times.filter((_, i) => i !== index);
      if (others.includes(value)) return { ...previous, times: others.sort() };
      return { ...previous, times: [...others, value].sort() };
    });
  }, []);

  const removeTime = useCallback((index: number) => {
    setDraft((previous) => ({ ...previous, times: previous.times.filter((_, i) => i !== index) }));
  }, []);

  const save = useCallback(async () => {
    try {
      await updateMutation.mutateAsync({
        enabled: draft.isEnabled,
        timezone: draft.timezone,
        reminderTimes: draft.times,
      });
      return true;
    } catch (error) {
      Alert.alert("Couldn't save reminders", getApiErrorMessage(error, "Please try again."));
      return false;
    }
  }, [updateMutation, draft]);

  return {
    isLoading,
    isError,
    refetch: () => void refetch(),
    isEnabled: draft.isEnabled,
    setIsEnabled: (value) => setDraft((previous) => ({ ...previous, isEnabled: value })),
    timezone: draft.timezone,
    setTimezone: (value) => setDraft((previous) => ({ ...previous, timezone: value })),
    times: draft.times,
    saveTime,
    removeTime,
    canAddTime: draft.times.length < MAX_REMINDER_TIMES,
    isDirty: !sameSnapshot(saved, draft),
    isSaving: updateMutation.isPending,
    save,
  };
}
