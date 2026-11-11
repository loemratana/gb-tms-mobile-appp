import { useBottomSheetSpringConfigs } from "@gorhom/bottom-sheet";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  type ForwardedRef,
} from "react";
import { useForm, useWatch } from "react-hook-form";
import { Alert } from "react-native";

import {
  createTaskSchema,
  type CreateTaskFormValues,
} from "@/features/tasks/schemas/createTask.schema";
import type { AssigneeOption } from "@/features/tasks/types/assignee.types";
import {
  useTaskSchedulePicker,
  type PickerTarget,
} from "./useTaskSchedulePicker";
import { useCreateTask } from "./useTaskMutations";
import { assignAdditionalUsers } from "@/services/tasks.service";
import { useCurrentUser, useDirectReports } from "@/features/users/hooks/useUsers";
import { getApiErrorMessage } from "@/lib/api";
import type { CreateTaskRequest } from "@/features/tasks/types/task.types";

export type CreateTaskBottomSheetRef = {
  present: () => void;
  dismiss: () => void;
};

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

export function useCreateTaskForm(ref: ForwardedRef<CreateTaskBottomSheetRef>) {
  const sheetRef = useRef<BottomSheetModal>(null);

  const createTaskMutation = useCreateTask();
  const { data: currentUser, isLoading: isCurrentUserLoading } = useCurrentUser();
  const departmentId = currentUser?.department?.id;
  // Managers may only assign to their direct reports (team scope), so offer just those.
  const {
    data: directReports,
    isLoading: isMembersLoading,
    isError: isMembersError,
  } = useDirectReports(currentUser?.id);
  const isLoadingAssignees = isCurrentUserLoading || isMembersLoading;
  const assigneeLoadError = !currentUser?.department
    ? currentUser
      ? "Your account has no department assigned, so tasks can't be created."
      : undefined
    : isMembersError
      ? "Couldn't load your team members."
      : undefined;
  const assigneeOptions = useMemo<AssigneeOption[]>(
    () =>
      (directReports ?? [])
        .filter((member) => member.active)
        .map((member) => ({
          id: member.id,
          name: member.fullName,
          avatar: member.avatarUrl ?? null,
        })),
    [directReports],
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
    },
  });

  const scheduleType = useWatch({ control, name: "scheduleType" }) ?? "date";
  const startDate = useWatch({ control, name: "startDate" }) ?? "";
  const endDate = useWatch({ control, name: "endDate" }) ?? "";
  const startTime = useWatch({ control, name: "startTime" }) ?? "";
  const endTime = useWatch({ control, name: "endTime" }) ?? "";

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


  useImperativeHandle(ref, () => ({
    present: () => {
      reset();
      sheetRef.current?.present();
    },
    dismiss: () => sheetRef.current?.dismiss(),
  }));

  const onSubmit = useCallback(() => {
    void handleSubmit(async (values) => {
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

        reset();
        sheetRef.current?.dismiss();

        Alert.alert("Task Created", `"${values.title}" (${parentTask.taskCode}) created.`);
      } catch (error) {
        Alert.alert("Couldn't create task", getApiErrorMessage(error));
      }
    })();
  }, [handleSubmit, departmentId, createTaskMutation, reset, sheetRef]);

  return {
    sheetRef,
    snapPoints,
    animationConfigs,
    control,
    errors,
    isSubmitting,
    scheduleType,
    startDate,
    endDate,
    startTime,
    endTime,
    departmentId,
    assigneeOptions,
    isLoadingAssignees,
    assigneeLoadError,
    applySchedule,
    openPicker,
    overlayProps,
    onSubmit: () => void onSubmit(),
  };
}
