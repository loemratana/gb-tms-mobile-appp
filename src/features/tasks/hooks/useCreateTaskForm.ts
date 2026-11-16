import { useBottomSheetSpringConfigs } from "@gorhom/bottom-sheet";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ForwardedRef,
} from "react";
import { useForm, useWatch } from "react-hook-form";


import { toDateKey } from "@/features/calendar/utils/calendarDates";
import {
  createTaskSchema,
  type CreateTaskFormValues,
} from "@/features/tasks/schemas/createTask.schema";
import { describeTaskAudience } from "@/features/tasks/utils/taskAudience";
import { useDiscardGuard } from "@/hooks/useDiscardGuard";
import {
  useTaskSchedulePicker,
  type PickerTarget,
} from "./useTaskSchedulePicker";
import { useCreateTask } from "./useTaskMutations";
import { useCurrentUser } from "@/features/users/hooks/useUsers";
import {
  useDepartmentMembers,
  useDepartments,
  useDepartmentTree,
} from "@/features/departments/hooks/useDepartments";
import type { DepartmentTreeNode } from "@/features/departments/types/department.types";
import type { AssigneeOption } from "@/features/tasks/types/assignee.types";
import type { CreateTaskRequest } from "@/features/tasks/types/task.types";
import { useAssignableUsers } from "./useAssignableUsers";
import { getApiErrorMessage } from "@/lib/api";
import { toast } from "@/stores/toastStore";

export type CreateTaskBottomSheetRef = {
  present: () => void;
  dismiss: () => void;
};

/** PEOPLE = hand-picked list; DEPARTMENT = everyone in a department; POSITION = everyone in a position. */
export type AssignTarget = CreateTaskFormValues["assignTo"];

type Audience = { departmentId: string; departmentName: string; memberIds: string[] };
type PositionAudience = Audience & { name: string };

/** A blank task. Built on each open so "today" is never stale when the app stays open overnight. */
function emptyTaskForm(): CreateTaskFormValues {
  return {
    title: "",
    description: "",
    priority: "MEDIUM",
    assignTo: "PEOPLE",
    assignees: [],
    positionId: undefined,
    assignmentMode: "INDIVIDUAL",
    // Most tasks start today; the due date stays a deliberate choice.
    startDate: toDateKey(new Date()),
    dueDate: "",
  };
}

/** Active members of each department and position (from the org tree), minus the current user. */
function buildAudiences(tree: DepartmentTreeNode[] | undefined, meId: string | undefined) {
  const departments = new Map<string, Audience>();
  const positions = new Map<string, PositionAudience>();
  const notMe = (ids: string[]) => ids.filter((id) => id !== meId);
  for (const department of tree ?? []) {
    const all = department.unassignedMembers.map((member) => member.id);
    for (const position of department.positions) {
      const ids = position.members.map((member) => member.id);
      all.push(...ids);
      positions.set(position.id, {
        name: position.name,
        departmentId: department.id,
        departmentName: department.name,
        memberIds: notMe(ids),
      });
    }
    departments.set(department.id, {
      departmentId: department.id,
      departmentName: department.name,
      memberIds: notMe(all),
    });
  }
  return { departments, positions };
}

export function useCreateTaskForm(ref: ForwardedRef<CreateTaskBottomSheetRef>) {
  const sheetRef = useRef<BottomSheetModal>(null);

  const createTaskMutation = useCreateTask();
  const { data: currentUser, isLoading: isCurrentUserLoading } = useCurrentUser();
  // Offer exactly who the server lets this user assign: everyone for admins (tasks:assign:all),
  // their department for department scope, their direct reports for managers (team scope).
  const {
    scope: assignScope,
    options: assigneeOptions,
    isLoading: isMembersLoading,
    isError: isMembersError,
  } = useAssignableUsers();

  // Admins choose which department the task belongs to (default: their own), and can hand it to a
  // whole department or a position. Everyone else creates tasks in their own department for people.
  const canPickDepartment = assignScope === "all";
  const [pickedDepartmentId, setPickedDepartmentId] = useState<string | undefined>();
  const [departmentPickerVisible, setDepartmentPickerVisible] = useState(false);
  const [positionPickerVisible, setPositionPickerVisible] = useState(false);
  const departmentsQuery = useDepartments(canPickDepartment);
  const departmentOptions = useMemo<AssigneeOption[]>(
    () =>
      (departmentsQuery.data ?? [])
        .filter((department) => department.active)
        .map((department) => ({ id: department.id, name: department.name, avatar: department.avatar }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [departmentsQuery.data],
  );
  const departmentId = (canPickDepartment ? pickedDepartmentId : undefined) ?? currentUser?.department?.id;
  const hasOwnDepartment = Boolean(currentUser?.department?.id);
  const departmentName =
    departmentOptions.find((option) => option.id === departmentId)?.name ??
    (departmentId === currentUser?.department?.id ? currentUser?.department?.name : undefined);

  // An admin's "select all" means everyone in the chosen department, not the whole company.
  const { data: pickedDepartmentMembers } = useDepartmentMembers(canPickDepartment ? departmentId : undefined);

  // Department → positions → members, to list positions and show how many people a choice reaches.
  const treeQuery = useDepartmentTree(canPickDepartment);
  const audiences = useMemo(
    () => buildAudiences(treeQuery.data, currentUser?.id),
    [treeQuery.data, currentUser?.id],
  );
  const positionOptions = useMemo<AssigneeOption[]>(
    () =>
      [...audiences.positions.entries()]
        .map(([id, position]) => ({ id, name: `${position.name} · ${position.departmentName}`, avatar: null }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [audiences],
  );

  const isLoadingAssignees = isCurrentUserLoading || isMembersLoading;
  const assigneeLoadError =
    !departmentId && currentUser && !canPickDepartment
      ? "Your account has no department assigned, so tasks can't be created."
      : isMembersError
        ? "Couldn't load the people you can assign."
        : undefined;

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
    formState: { errors, isSubmitting, isDirty },
  } = useForm<CreateTaskFormValues>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: emptyTaskForm(),
  });
  // Picking a department lives outside the form, so count it as a change too.
  const hasChanges = isDirty || pickedDepartmentId !== undefined;

  const startDate = useWatch({ control, name: "startDate" }) ?? "";
  const selectedAssignees = useWatch({ control, name: "assignees" }) ?? [];
  const watchedAssignTo = useWatch({ control, name: "assignTo" }) ?? "PEOPLE";
  const assignTo: AssignTarget = canPickDepartment ? watchedAssignTo : "PEOPLE";
  const positionId = useWatch({ control, name: "positionId" });
  const selectedPosition = positionId ? audiences.positions.get(positionId) : undefined;

  // A task for a position is filed under the position's own department.
  const taskDepartmentId = assignTo === "POSITION" ? selectedPosition?.departmentId : departmentId;
  // Who gets the task when it isn't a hand-picked list (undefined until a choice is made / the tree loads).
  const groupMemberIds =
    assignTo === "DEPARTMENT"
      ? departmentId
        ? audiences.departments.get(departmentId)?.memberIds
        : undefined
      : assignTo === "POSITION"
        ? selectedPosition?.memberIds
        : undefined;
  const audienceCount = assignTo === "PEOPLE" ? selectedAssignees.length : (groupMemberIds?.length ?? 0);
  const isMultiAssignee = audienceCount > 1;

  const isLoadingTree = treeQuery.isLoading;
  const isTreeError = treeQuery.isError;
  const positionName = selectedPosition?.name;
  const positionDepartmentName = selectedPosition?.departmentName;
  const groupSize = groupMemberIds?.length;
  // What a department / position choice reaches, shown before creating.
  const audienceSummary = useMemo(
    () =>
      assignTo === "DEPARTMENT" || (assignTo === "POSITION" && positionId)
        ? describeTaskAudience({
            assignTo,
            audienceCount: groupSize,
            isLoading: isLoadingTree,
            loadError: isTreeError ? "Couldn't load departments and positions." : undefined,
            departmentName,
            positionName,
            positionDepartmentName,
          })
        : undefined,
    [assignTo, positionId, groupSize, isLoadingTree, isTreeError, departmentName, positionName, positionDepartmentName],
  );

  const allAssigneeIds = useMemo(() => {
    const assignable = assigneeOptions.map((option) => option.id);
    if (!canPickDepartment) return assignable;
    // Only the chosen department's members that are also assignable (active, not yourself).
    const inDepartment = new Set((pickedDepartmentMembers ?? []).map((member) => member.id));
    return assignable.filter((id) => inDepartment.has(id));
  }, [assigneeOptions, canPickDepartment, pickedDepartmentMembers]);
  const selectAllAssignees = useCallback(() => {
    setValue("assignees", allAssigneeIds, { shouldDirty: true, shouldValidate: true });
  }, [setValue, allAssigneeIds]);
  const dueDate = useWatch({ control, name: "dueDate" }) ?? "";

  // The shared picker calls the second date "endDate"; for a task that's the due date.
  const pickScheduleField = useCallback(
    (target: PickerTarget, value: string) => {
      const field = target === "endDate" ? "dueDate" : "startDate";
      setValue(field, value, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
    },
    [setValue],
  );

  // A task's dates must be today or later (the API's @FutureOrPresent), so the pickers start at today.
  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);
  const { openPicker, overlayProps } = useTaskSchedulePicker(
    { startDate, endDate: dueDate },
    pickScheduleField,
    { minimumDate: today },
  );

  useImperativeHandle(ref, () => ({
    present: () => {
      reset(emptyTaskForm());
      setPickedDepartmentId(undefined);
      setPositionPickerVisible(false);
      sheetRef.current?.present();
    },
    dismiss: () => sheetRef.current?.dismiss(),
  }));

  const onSubmit = useCallback(() => {
    void handleSubmit(async (values) => {
      const target: AssignTarget = canPickDepartment ? values.assignTo : "PEOPLE";
      if (!taskDepartmentId) {
        toast.warning(
          "Can't create task",
          canPickDepartment
            ? "Choose the department this task belongs to."
            : "Your account has no department assigned. Contact an admin before creating tasks.",
        );
        return;
      }
      if (target !== "PEOPLE" && groupMemberIds?.length === 0) {
        toast.warning(
          "Can't create task",
          target === "DEPARTMENT"
            ? "This department has no active members to assign."
            : "Nobody active holds this position.",
        );
        return;
      }

      // A department or position with one person in it is just a normal task for that person.
      const soleMember = target !== "PEOPLE" && groupMemberIds?.length === 1 ? groupMemberIds[0] : undefined;
      const peopleCount = target === "PEOPLE" ? values.assignees.length : (groupMemberIds?.length ?? 0);
      const isMulti = soleMember ? false : target === "PEOPLE" ? values.assignees.length > 1 : true;

      let assignment: Partial<CreateTaskRequest>;
      if (soleMember) assignment = { assigneeId: soleMember };
      else if (target === "DEPARTMENT")
        assignment = { assignWholeDepartment: true, assignmentMode: values.assignmentMode };
      else if (target === "POSITION")
        assignment = { assignPositionId: values.positionId, assignmentMode: values.assignmentMode };
      else if (isMulti) assignment = { assigneeIds: values.assignees, assignmentMode: values.assignmentMode };
      else assignment = { assigneeId: values.assignees[0] };

      try {
        // One call: the server creates either a group task (one subtask per person) or one shared task,
        // and resolves "whole department" / "everyone in a position" itself.
        const created = await createTaskMutation.mutateAsync({
          title: values.title.trim(),
          description: values.description.trim() || undefined,
          priority: values.priority,
          status: "TODO",
          departmentId: taskDepartmentId,
          ...assignment,
          startDate: values.startDate,
          dueDate: values.dueDate,
        });

        reset(emptyTaskForm());
        setPickedDepartmentId(undefined);
        sheetRef.current?.dismiss();

        const people = peopleCount > 0 ? `${peopleCount} people` : "everyone";
        const detail = !isMulti
          ? ""
          : values.assignmentMode === "SHARED"
            ? ` Shared with ${people} — anyone can submit.`
            : ` Each of the ${people} got their own copy.`;
        toast.success("Task created", `"${values.title}" (${created.taskCode}) created.${detail}`);
      } catch (error) {
        toast.error("Couldn't create task", getApiErrorMessage(error));
      }
    })();
  }, [handleSubmit, taskDepartmentId, groupMemberIds, canPickDepartment, createTaskMutation, reset, sheetRef]);

  const dismissSheet = useCallback(() => sheetRef.current?.dismiss(), []);
  const requestClose = useDiscardGuard(hasChanges && !isSubmitting, dismissSheet, {
    title: "Discard this task?",
    message: "The task hasn't been created yet. What you've entered will be lost.",
  });

  return {
    sheetRef,
    snapPoints,
    animationConfigs,
    control,
    errors,
    isSubmitting,
    /** Something was entered: swipe-down and backdrop taps go through `requestClose` instead. */
    hasChanges,
    requestClose,
    startDate,
    dueDate,
    departmentId,
    assigneeOptions,
    isLoadingAssignees,
    assigneeLoadError,
    isMultiAssignee,
    canSelectAllAssignees:
      assignTo === "PEOPLE" &&
      allAssigneeIds.length > 1 &&
      allAssigneeIds.some((id) => !selectedAssignees.includes(id)),
    selectAllLabel:
      assignScope === "all"
        ? `Select all in ${departmentName ?? "department"}`
        : assignScope === "department"
          ? "Select whole department"
          : "Select whole team",
    canPickDepartment,
    /**
     * The department picker shows for "Whole department", and for "Specific people" only when the
     * admin has no department of their own; otherwise people-tasks are filed under theirs.
     */
    showDepartmentField: canPickDepartment && (assignTo === "DEPARTMENT" || (assignTo === "PEOPLE" && !hasOwnDepartment)),
    departmentName,
    departmentOptions,
    isLoadingDepartments: departmentsQuery.isLoading,
    departmentLoadError: departmentsQuery.isError ? "Couldn't load departments." : undefined,
    departmentPickerVisible,
    openDepartmentPicker: () => setDepartmentPickerVisible(true),
    closeDepartmentPicker: () => setDepartmentPickerVisible(false),
    selectDepartment: (id: string) => {
      setPickedDepartmentId(id);
      setDepartmentPickerVisible(false);
    },
    assignTo,
    setAssignTo: (target: AssignTarget) => {
      // "Specific people" files the task under your own department (its picker is hidden), so a
      // department chosen for "Whole department" mustn't carry over unseen.
      if (target === "PEOPLE" && hasOwnDepartment) setPickedDepartmentId(undefined);
      setValue("assignTo", target);
    },
    /** People a department/position choice reaches (you excluded); undefined while unknown. */
    audienceSummary,
    isLoadingAudience: isLoadingTree,
    audienceLoadError: isTreeError ? "Couldn't load departments and positions." : undefined,
    positionId,
    positionName,
    positionDepartmentName,
    positionOptions,
    positionError: errors.positionId?.message,
    positionPickerVisible,
    openPositionPicker: () => setPositionPickerVisible(true),
    closePositionPicker: () => setPositionPickerVisible(false),
    selectPosition: (id: string) => {
      setValue("positionId", id, { shouldDirty: true, shouldValidate: true });
      setPositionPickerVisible(false);
    },
    assigneePickerTitle:
      assignScope === "all" ? "Select people" : assignScope === "department" ? "Select department members" : "Select team members",
    selectAllAssignees,
    openPicker,
    overlayProps,
    onSubmit: () => void onSubmit(),
  };
}
