import { useBottomSheetSpringConfigs } from "@gorhom/bottom-sheet";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import {
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ForwardedRef,
} from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { Alert } from "react-native";

import {
  createTaskSchema,
  resolveSubtaskForSubmit,
  type CreateTaskFormValues,
  type SubtaskFormValues,
} from "@/features/manager/components/create-task/taskFormSchema";
import type { SubtaskEditorSheetRef } from "@/features/manager/components/create-task/SubtaskEditorSheet";
import type { AssigneePickerOption } from "@/features/manager/components/shared/AssigneePicker";
import {
  useTaskSchedulePicker,
  type PickerTarget,
} from "@/features/manager/components/shared/useTaskSchedulePicker";
import { useDepartmentMembers } from "@/features/departments/hooks/useDepartments";
import type { VoiceExtractionApplyValues } from "@/features/tasks/components/voice/VoiceRecordingModal";
import { useCreateTask } from "@/features/tasks/hooks/useTaskMutations";
import { assignAdditionalUsers } from "@/services/tasks.service";
import { useCurrentUser } from "@/features/users/hooks/useUsers";
import type { ApiErrorResponse } from "@/lib/api";
import type { CreateTaskRequest } from "@/features/tasks/types/task.types";

export type CreateTaskBottomSheetRef = {
  present: () => void;
  dismiss: () => void;
};

/** Placeholder avatar for users who haven't uploaded one, matching the mock-data pattern used elsewhere in the app. */
function fallbackAvatar(name: string): string {
  return `https://i.pravatar.cc/100?u=${encodeURIComponent(name)}`;
}

type DatedFields = {
  scheduleType: CreateTaskFormValues["scheduleType"];
  startDate?: string;
  endDate?: string;
};

/** The backend only accepts date-only start/due dates — schedule "time" fields have no API equivalent. */
function toApiDates(fields: DatedFields): Pick<CreateTaskRequest, "startDate" | "dueDate"> {
  const usesDate = fields.scheduleType === "date" || fields.scheduleType === "both";
  return {
    startDate: usesDate ? fields.startDate || undefined : undefined,
    dueDate: usesDate ? fields.endDate || undefined : undefined,
  };
}

function todayIso(): string {
  return new Date().toISOString().split("T")[0];
}

function resolveErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data.message ?? error.message;
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}

export function useCreateTaskForm(ref: ForwardedRef<CreateTaskBottomSheetRef>) {
  const sheetRef = useRef<BottomSheetModal>(null);
  const subtaskEditorRef = useRef<SubtaskEditorSheetRef>(null);
  const sheetIndexRef = useRef(0);

  const createTaskMutation = useCreateTask();
  const { data: currentUser, isLoading: isCurrentUserLoading } = useCurrentUser();
  const departmentId = currentUser?.department?.id;
  const {
    data: departmentMembers,
    isLoading: isMembersLoading,
    isError: isMembersError,
  } = useDepartmentMembers(departmentId);
  const isLoadingAssignees = isCurrentUserLoading || isMembersLoading;
  const assigneeLoadError = !currentUser?.department
    ? currentUser
      ? "Your account has no department assigned, so no team members can be listed."
      : undefined
    : isMembersError
      ? "Couldn't load department members."
      : undefined;
  const assigneeOptions = useMemo<AssigneePickerOption[]>(
    () =>
      (departmentMembers ?? []).map((member) => ({
        id: member.id,
        name: member.fullName,
        avatar: member.avatarUrl ?? fallbackAvatar(member.fullName),
      })),
    [departmentMembers],
  );

  const snapPoints = useMemo(() => ["85%", "100%"], []);

  const animationConfigs = useBottomSheetSpringConfigs({
    damping: 70,
    stiffness: 400,
    mass: 0.35,
    overshootClamping: true,
  });

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateTaskFormValues>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "MEDIUM",
      assignees: [],
      scheduleType: "date",
      startDate: "",
      endDate: "",
      startTime: "",
      endTime: "",
      subtasks: [],
    },
  });

  const { fields, append, update, remove } = useFieldArray({
    control,
    name: "subtasks",
  });

  const subtasks = useWatch({ control, name: "subtasks" }) ?? [];
  const scheduleType = useWatch({ control, name: "scheduleType" }) ?? "date";
  const startDate = useWatch({ control, name: "startDate" }) ?? "";
  const endDate = useWatch({ control, name: "endDate" }) ?? "";
  const startTime = useWatch({ control, name: "startTime" }) ?? "";
  const endTime = useWatch({ control, name: "endTime" }) ?? "";
  const assignees = useWatch({ control, name: "assignees" }) ?? [];

  const pickScheduleField = useCallback(
    (target: PickerTarget, value: string) => {
      setValue(target, value, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    },
    [setValue],
  );

  const applySchedule = useCallback(
    (next: {
      scheduleType: CreateTaskFormValues["scheduleType"];
      startDate?: string;
      endDate?: string;
      startTime?: string;
      endTime?: string;
    }) => {
      setValue("scheduleType", next.scheduleType, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setValue("startDate", next.startDate ?? "", {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setValue("endDate", next.endDate ?? "", {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setValue("startTime", next.startTime ?? "", {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setValue("endTime", next.endTime ?? "", {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    },
    [setValue],
  );

  const { openPicker, overlayProps } = useTaskSchedulePicker(
    { scheduleType, startDate, endDate, startTime, endTime },
    pickScheduleField,
  );

  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  const openVoiceModal = useCallback(() => setIsVoiceModalOpen(true), []);
  const closeVoiceModal = useCallback(() => setIsVoiceModalOpen(false), []);

  const handleVoiceApply = useCallback(
    (values: VoiceExtractionApplyValues) => {
      setValue("title", values.title, { shouldDirty: true, shouldValidate: true });
      setValue("description", values.description, { shouldDirty: true, shouldValidate: true });
      setValue("priority", values.priority, { shouldDirty: true, shouldValidate: true });
      if (values.assigneeId) {
        setValue("assignees", [values.assigneeId], { shouldDirty: true, shouldValidate: true });
      }
      if (values.dueDate) {
        applySchedule({
          scheduleType: "date",
          startDate: startDate || todayIso(),
          endDate: values.dueDate,
        });
      }
      setIsVoiceModalOpen(false);
    },
    [setValue, applySchedule, startDate],
  );

  useImperativeHandle(ref, () => ({
    present: () => {
      reset();
      sheetRef.current?.present();
    },
    dismiss: () => sheetRef.current?.dismiss(),
  }));

  const handleClose = useCallback(() => {
    if (sheetIndexRef.current >= 1) {
      sheetRef.current?.snapToIndex(0, animationConfigs);
      return;
    }
    sheetRef.current?.dismiss();
  }, [animationConfigs]);

  const handleSheetChange = useCallback((index: number) => {
    sheetIndexRef.current = index;
  }, []);

  const handleSubtaskSave = useCallback(
    (values: SubtaskFormValues, index?: number) => {
      if (index !== undefined) {
        update(index, values);
        return;
      }
      append(values);
    },
    [append, update],
  );

  // Not memoized: `subtasks` (from useWatch) is a new array reference every render,
  // so a useCallback here would never actually skip recreating this function.
  const openSubtaskEditor = (index?: number) => {
    if (index === undefined) {
      subtaskEditorRef.current?.open();
      return;
    }
    subtaskEditorRef.current?.open(subtasks[index], index);
  };

  const onSubmit = handleSubmit(async (values) => {
    if (!departmentId) {
      Alert.alert(
        "Can't create task",
        "Your account has no department assigned. Contact an admin before creating tasks.",
      );
      return;
    }

    const [assigneeId, ...additionalAssigneeIds] = values.assignees;

    try {
      const parentTask = await createTaskMutation.mutateAsync({
        title: values.title.trim(),
        description: values.description.trim() || undefined,
        priority: values.priority,
        status: "TODO",
        departmentId,
        assigneeId,
        ...toApiDates(values),
      });

      if (additionalAssigneeIds.length > 0) {
        await assignAdditionalUsers(parentTask.id, { userIds: additionalAssigneeIds });
      }

      for (const subtask of values.subtasks) {
        const resolved = resolveSubtaskForSubmit(subtask, values);
        await createTaskMutation.mutateAsync({
          title: resolved.title,
          description: resolved.description || undefined,
          priority: values.priority,
          status: "TODO",
          departmentId,
          assigneeId: resolved.assigneeId,
          parentTaskId: parentTask.id,
          ...toApiDates(resolved),
        });
      }

      reset();
      sheetRef.current?.dismiss();

      const subtaskNote =
        values.subtasks.length > 0
          ? ` with ${values.subtasks.length} subtask${values.subtasks.length === 1 ? "" : "s"}`
          : "";

      Alert.alert(
        "Task Created",
        `"${values.title}" (${parentTask.taskCode}) created${subtaskNote}.`,
      );
    } catch (error) {
      Alert.alert("Couldn't create task", resolveErrorMessage(error));
    }
  });

  return {
    sheetRef,
    subtaskEditorRef,
    snapPoints,
    animationConfigs,
    handleSheetChange,
    handleClose,
    control,
    errors,
    isSubmitting,
    fields,
    remove,
    subtasks,
    scheduleType,
    startDate,
    endDate,
    startTime,
    endTime,
    assignees,
    departmentId,
    assigneeOptions,
    isLoadingAssignees,
    assigneeLoadError,
    applySchedule,
    openPicker,
    overlayProps,
    isVoiceModalOpen,
    openVoiceModal,
    closeVoiceModal,
    handleVoiceApply,
    handleSubtaskSave,
    openSubtaskEditor,
    onSubmit: () => void onSubmit(),
  };
}
