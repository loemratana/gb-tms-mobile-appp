import { useLocalSearchParams, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import type { ScrollViewInstance } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  canAccessManagerArea,
  getSubmitWorkPathForRole,
  getTaskCommentsPathForRole,
  getTaskDetailPathForRole,
} from "@/features/auth/utils/navigation";
import { mapTaskResponseToEmployeeTask } from "@/features/tasks/utils/taskResponseAdapter";
import {
  formatDate,
  getCategoryLabel,
  getPriorityLabel,
  getTaskDisplayProgress,
  isTaskOverdue,
  resolveTaskSubtasks,
} from "@/features/tasks/utils/task.utils";
import {
  ManagerTaskActionsSheet,
  type ManagerTaskActionsSheetRef,
} from "@/features/tasks/components/detail/ManagerTaskActionsSheet";
import { ApproveSubmissionModal } from "@/features/tasks/components/detail/ApproveSubmissionModal";
import { RejectReasonModal } from "@/features/tasks/components/detail/RejectReasonModal";
import {
  TaskPrioritySheet,
  type TaskPrioritySheetRef,
} from "@/features/tasks/components/detail/TaskPrioritySheet";
import type { Priority } from "@/features/tasks/types/task.types";
import { TaskDetailHeader } from "@/features/tasks/components/detail/TaskDetailHeader";
import { AvatarStack } from "@/features/tasks/components/shared/AvatarStack";
import { PersonPickerSheet } from "@/features/tasks/components/shared/PersonPickerSheet";
import { StatusBadge } from "@/features/tasks/components/shared/StatusBadge";
import { SubtaskWorkList } from "@/features/tasks/components/detail/SubtaskWorkList";
import { useTaskReview } from "@/features/tasks/hooks/useTaskReview";
import { AttachmentsSection } from "@/features/tasks/components/detail/AttachmentsSection";
import { CommentsPreview } from "@/features/tasks/components/detail/CommentsPreview";
import { useTaskConversation } from "@/features/tasks/hooks/useTaskConversation";
import { SubmissionHistory } from "@/features/tasks/components/submissions/SubmissionHistory";
import { TaskDetailActionBar } from "@/features/tasks/components/detail/TaskDetailActionBar";
import { TaskDetailSkeleton } from "@/features/tasks/components/detail/TaskDetailSkeleton";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SegmentedControl, type SegmentOption } from "@/components/ui/SegmentedControl";
import { SkeletonBlock } from "@/components/ui/Skeleton";
import { StateView } from "@/components/ui/StateView";
import { ExpandableText } from "@/features/tasks/components/detail/ExpandableText";
import { TaskFactsGrid, type TaskFact } from "@/features/tasks/components/detail/TaskFactsGrid";
import {
  TaskReminderSheet,
  type TaskReminderSheetRef,
} from "@/features/tasks/components/reminders/TaskReminderSheet";
import {
  useAssignTask,
  useDeleteTask,
  useUpdateTask,
} from "@/features/tasks/hooks/useTaskMutations";
import { canDeleteTasks } from "@/features/auth/utils/permissions";
import { useTaskSubmissions } from "@/features/tasks/hooks/useSubmissions";
import {
  useTask,
  useTaskAttachments,
  useTasks,
} from "@/features/tasks/hooks/useTasks";
import { useCurrentUser } from "@/features/users/hooks/useUsers";
import { useAssignableUsers } from "@/features/tasks/hooks/useAssignableUsers";
import { useAuthStore } from "@/stores/authStore";
import { colors, priorityTone } from "@/styles";
import { toast } from "@/stores/toastStore";

// ---------- Constants ----------
/**
 * Roughly the stack push animation. Heavy work (the department task page and the
 * lower sections: submissions, comments, attachments) waits until it's done so
 * tapping a task slides the screen in immediately.
 */
const SCREEN_SETTLE_DELAY_MS = 350;

/** The lower part of the screen shows one of these at a time instead of one long scroll. */
type DetailSection = "work" | "comments" | "files";

/** "Due today", "In 3 days", "2 days late" for a YYYY-MM-DD due date (device's local calendar). */
function describeDue(dueDate: string | undefined, isFinished: boolean): string | undefined {
  if (!dueDate || isFinished) return undefined;
  const [year, month, day] = dueDate.slice(0, 10).split("-").map(Number);
  if (!year || !month || !day) return undefined;
  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const days = Math.round((Date.UTC(year, month - 1, day) - today) / 86_400_000);
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  if (days > 1) return `In ${days} days`;
  return days === -1 ? "1 day late" : `${-days} days late`;
}

// ---------- Main Screen ----------
/**
 * Task detail for both roles. Everyone sees the task, comments, attachments and
 * (when assigned) Submit Work; managers additionally get review, reassign and
 * the actions sheet.
 */
export default function TaskDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: taskResponse, isLoading, isError, refetch } = useTask(id);
  const { data: currentUser } = useCurrentUser();
  const role = useAuthStore((state) => state.user?.role);
  const isManagerView = role ? canAccessManagerArea(role) : false;
  // Managers can be assigned tasks too — they submit work the same way employees do. On a shared
  // task every collaborator can submit, not just the primary assignee.
  const isAssignee = Boolean(
    currentUser?.id &&
      (taskResponse?.assignee?.id === currentUser.id ||
        taskResponse?.assignees?.some((person) => person.id === currentUser.id)),
  );
  // A group task has no assignee: each member works on their own subtask, and its status follows them.
  const isGroupTask = Boolean(taskResponse?.groupTask);
  const isSharedTask = !isGroupTask && (taskResponse?.assignees?.length ?? 0) > 1;
  const { data: attachments } = useTaskAttachments(id);
  const conversation = useTaskConversation(id);
  const assignMutation = useAssignTask(id ?? "");
  const updateTaskMutation = useUpdateTask(id ?? "");
  const deleteTaskMutation = useDeleteTask(id ?? "");
  const canDelete = canDeleteTasks(currentUser);

  const task = useMemo(
    () =>
      taskResponse ? mapTaskResponseToEmployeeTask(taskResponse) : undefined,
    [taskResponse],
  );

  const departmentId = taskResponse?.department?.id;
  const parentTaskId = taskResponse?.parentTaskId ?? undefined;

  const [isScreenSettled, setIsScreenSettled] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setIsScreenSettled(true), SCREEN_SETTLE_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  // There's no "subtasks of X" endpoint, so subtasks come from the department's
  // task page. Subtasks can't have their own subtasks, so skip it for them.
  const { data: departmentTasksPage } = useTasks(
    { departmentId, size: 200 },
    Boolean(departmentId) && Boolean(taskResponse) && !parentTaskId && isScreenSettled,
  );
  // Only this task's subtasks are mapped — not the whole 200-task page.
  const subtaskTasks = useMemo(
    () =>
      (departmentTasksPage?.content ?? [])
        .filter((item) => item.parentTaskId === id)
        .map(mapTaskResponseToEmployeeTask),
    [departmentTasksPage, id],
  );

  // A subtask links back to its parent: one small request instead of the department page.
  const { data: parentTaskResponse } = useTask(parentTaskId);

  // Same people the server lets this user assign: everyone for admins, the department or the
  // direct reports for narrower scopes.
  const {
    scope: assignScope,
    options: reassignOptions,
    isLoading: isLoadingReassignOptions,
  } = useAssignableUsers(isManagerView);
  const [reassignPickerVisible, setReassignPickerVisible] = useState(false);

  const scrollRef = useRef<ScrollViewInstance>(null);
  const actionsSheetRef = useRef<ManagerTaskActionsSheetRef>(null);
  const reminderSheetRef = useRef<TaskReminderSheetRef>(null);
  const prioritySheetRef = useRef<TaskPrioritySheetRef>(null);

  // Derived data
  // The server's flag (business timezone) wins; older servers don't send it, so fall back to the device's date.
  const isOverdue = taskResponse ? (taskResponse.overdue ?? (task ? isTaskOverdue(task) : false)) : false;
  const subtasks = useMemo(
    () => (task ? resolveTaskSubtasks(subtaskTasks, task) : []),
    [subtaskTasks, task],
  );
  const completedSubtasks = subtasks.filter((subtask) => subtask.status === "done").length;
  const parentTask = useMemo(
    () => (parentTaskResponse ? mapTaskResponseToEmployeeTask(parentTaskResponse) : undefined),
    [parentTaskResponse],
  );

  const openTask = useCallback(
    (taskId: string) => {
      if (!role) return;
      router.push(getTaskDetailPathForRole(role, taskId));
    },
    [role, router],
  );

  const {
    data: submissions,
    isLoading: isLoadingSubmissions,
    isError: isSubmissionsError,
    refetch: refetchSubmissions,
  } = useTaskSubmissions(id);
  const pendingSubmission = submissions?.find((submission) => submission.status === "PENDING");

  const {
    isReviewPending,
    isOwnSubmission,
    reviewLoading,
    rejectModalVisible,
    setRejectModalVisible,
    approveModalVisible,
    setApproveModalVisible,
    approve: handleApprove,
    reject: handleReject,
  } = useTaskReview(id, taskResponse, pendingSubmission, currentUser?.id);
  // Reviewers never decide their own work; they get the assignee's action bar instead.
  const showReviewBar = isManagerView && isReviewPending && !isOwnSubmission;

  const openActions = useCallback(() => {
    actionsSheetRef.current?.present();
  }, []);

  const openReminderSettings = useCallback(() => {
    reminderSheetRef.current?.present();
  }, []);

  const handleReassign = useCallback(() => {
    if (!task) return;

    if (!isLoadingReassignOptions && reassignOptions.length === 0) {
      toast.warning(
        "No one to reassign to",
        assignScope === "team"
          ? "You have no active direct reports to reassign this task to."
          : "There are no other active users to reassign this task to.",
      );
      return;
    }

    setReassignPickerVisible(true);
  }, [task, isLoadingReassignOptions, reassignOptions.length, assignScope]);

  const handleReassignSelect = useCallback(
    (memberId: string) => {
      setReassignPickerVisible(false);
      const member = reassignOptions.find((item) => item.id === memberId);
      assignMutation.mutate(
        { assigneeId: memberId },
        {
          onSuccess: () =>
            toast.success(
              "Reassigned",
              member ? `Task assigned to ${member.name}.` : "Task reassigned.",
            ),
          onError: () =>
            toast.error("Reassign failed", "Could not reassign this task."),
        },
      );
    },
    [reassignOptions, assignMutation],
  );

  const handleChangePriority = useCallback(() => {
    prioritySheetRef.current?.present();
  }, []);

  // The new priority badge is the confirmation; only failures need an alert.
  const handleSelectPriority = useCallback(
    (priority: Priority) => {
      if (!taskResponse) return;
      updateTaskMutation.mutate(
        {
          title: taskResponse.title,
          description: taskResponse.description ?? undefined,
          priority,
          dueDate: taskResponse.dueDate ?? undefined,
        },
        { onError: () => toast.error("Update failed", "Could not update priority.") },
      );
    },
    [taskResponse, updateTaskMutation],
  );

  const handleDelete = useCallback(() => {
    if (!task) return;
    const subtaskNote = subtasks.length > 0 ? ` Its ${subtasks.length} subtask(s) will be deleted too.` : "";
    Alert.alert("Delete task?", `"${task.title}" will be removed for everyone.${subtaskNote}`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () =>
          deleteTaskMutation.mutate(undefined, {
            onSuccess: () => router.back(),
            onError: () => Alert.alert("Delete failed", "Could not delete this task."),
          }),
      },
    ]);
  }, [task, subtasks.length, deleteTaskMutation, router]);

  const [activeSection, setActiveSection] = useState<DetailSection>("work");

  const explainAssignmentMode = useCallback(() => {
    if (isGroupTask) {
      const progress =
        taskResponse?.memberCount != null
          ? `\n\n${taskResponse.completedMemberCount ?? 0} of ${taskResponse.memberCount} approved so far.`
          : "";
      Alert.alert(
        "Group task",
        `Each person has their own copy (listed under Work) and submits it separately. The task closes automatically once everyone is approved.${progress}`,
      );
    } else {
      Alert.alert("Shared task", "Anyone assigned can submit the work, and one approval completes it for everyone.");
    }
  }, [isGroupTask, taskResponse]);

  const openChat = useCallback(
    (options?: { focus?: boolean }) => {
      if (!role || !id) return;
      router.push(getTaskCommentsPathForRole(role, id, options));
    },
    [role, id, router],
  );

  if (isLoading) {
    return (
      <View className="flex-1 bg-surface">
        <TaskDetailHeader onBack={() => router.back()} />
        <TaskDetailSkeleton />
      </View>
    );
  }

  if (isError || !task) {
    return (
      <View className="flex-1 bg-surface">
        <TaskDetailHeader onBack={() => router.back()} />
        <View className="flex-1 justify-center">
          {isError ? (
            <StateView
              variant="error"
              title="Couldn't load this task"
              message="Check your connection and try again."
              actionLabel="Try again"
              onPressAction={() => void refetch()}
            />
          ) : (
            <StateView
              variant="empty"
              icon="document-outline"
              title="Task not found"
              message="This task may have been removed or is unavailable."
            />
          )}
        </View>
      </View>
    );
  }

  // ---------- Display values ----------
  const isFinished = task.status === "done" || task.status === "cancelled";
  const progress = getTaskDisplayProgress(task);
  const canReassign = isManagerView && !isGroupTask;
  const assigneeNames = task.assignees.map((person) => person.name);

  const facts: TaskFact[] = [
    {
      key: "due",
      icon: "calendar-outline",
      label: "Due",
      value: task.dueDate ? formatDate(task.dueDate) : "No due date",
      hint: describeDue(task.dueDate, isFinished),
      isAlert: isOverdue,
      accessibilityLabel: `Due ${task.dueDate ? formatDate(task.dueDate) : "date not set"}`,
    },
    {
      key: "priority",
      icon: "flag-outline",
      label: "Priority",
      value: <Badge label={getPriorityLabel(task.priority)} tone={priorityTone[task.priority]} icon="flag" />,
      onPress: isManagerView ? handleChangePriority : undefined,
      accessibilityLabel: `Priority ${getPriorityLabel(task.priority)}${isManagerView ? ". Change priority" : ""}`,
    },
    {
      key: "assignees",
      icon: "person-outline",
      label: isGroupTask ? "Members" : task.assignees.length > 1 ? "Assignees" : "Assignee",
      value: (
        <View className="flex-row items-center gap-2">
          <AvatarStack people={task.assignees} maxVisible={3} size={24} />
          {task.assignees.length === 1 ? (
            <Text className="min-w-0 flex-1 text-body-sm font-semibold text-fg" numberOfLines={1}>
              {task.assignees[0].name}
            </Text>
          ) : null}
        </View>
      ),
      hint: canReassign ? "Tap to reassign" : undefined,
      onPress: canReassign ? handleReassign : undefined,
      accessibilityLabel: `${assigneeNames.length > 0 ? `Assigned to ${assigneeNames.join(", ")}` : "Unassigned"}${
        canReassign ? ". Reassign" : ""
      }`,
    },
    subtasks.length > 0
      ? {
          key: "progress",
          icon: "pie-chart-outline",
          label: "Progress",
          value: (
            <View className="gap-1.5 pt-1">
              <ProgressBar value={progress} accessibilityLabel="Task progress" />
            </View>
          ),
          hint: `${completedSubtasks} of ${subtasks.length} done · ${progress}%`,
          accessibilityLabel: `Progress ${progress} percent, ${completedSubtasks} of ${subtasks.length} done`,
        }
      : {
          key: "start",
          icon: "play-circle-outline",
          label: "Start",
          value: task.startDate ? formatDate(task.startDate) : "Not set",
          accessibilityLabel: `Start ${task.startDate ? formatDate(task.startDate) : "not set"}`,
        },
  ];

  // Secondary details on one quiet line, only the ones that exist (no rows of "—").
  const metaLine = [
    task.team,
    task.category ? getCategoryLabel(task.category) : undefined,
    subtasks.length > 0 && task.startDate ? `Started ${formatDate(task.startDate)}` : undefined,
  ]
    .filter(Boolean)
    .join("  ·  ");

  const commentCount = conversation.count;
  const fileCount = attachments?.length ?? 0;
  const sectionTabs: SegmentOption<DetailSection>[] = [
    { value: "work", label: subtasks.length > 0 ? "Work" : "Submissions" },
    { value: "comments", label: commentCount > 0 ? `Comments ${commentCount}` : "Comments" },
    { value: "files", label: fileCount > 0 ? `Files ${fileCount}` : "Files" },
  ];

  // ---------- Render ----------
  return (
    <View className="flex-1 bg-surface">
      <TaskDetailHeader
        onBack={() => router.back()}
        onMore={isManagerView ? openActions : undefined}
        onReminder={openReminderSettings}
      />

      <ScrollView
        ref={scrollRef}
        className="flex-1"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 110 + Math.max(insets.bottom, 8),
        }}
      >
        {/* ── 1. What is it ─────────────────────────────────────────────── */}
        <View>
          {parentTask ? (
            <Pressable
              onPress={() => openTask(parentTask.id)}
              accessibilityRole="link"
              accessibilityLabel={`Subtask of ${parentTask.title}`}
              hitSlop={6}
              className="mb-2 flex-row items-center gap-1 self-start"
            >
              <Ionicons name="git-branch-outline" size={13} color={colors.textSubtle} />
              <Text className="text-label text-fg-soft">Subtask of</Text>
              <Text className="max-w-[220px] text-label font-semibold text-brand-strong" numberOfLines={1}>
                {parentTask.title}
              </Text>
              <Ionicons name="chevron-forward" size={13} color={colors.brandStrong} />
            </Pressable>
          ) : null}

          <View className="mb-2.5 flex-row flex-wrap items-center gap-2">
            <StatusBadge status={task.status} />
            {isOverdue ? <Badge label="Overdue" tone="error" icon="alert-circle" /> : null}
            {isGroupTask || isSharedTask ? (
              <Pressable
                onPress={explainAssignmentMode}
                accessibilityRole="button"
                accessibilityLabel={isGroupTask ? "Group task. What does this mean?" : "Shared task. What does this mean?"}
                hitSlop={6}
              >
                <Badge
                  label={isGroupTask ? "Group task" : "Shared task"}
                  tone="info"
                  icon={isGroupTask ? "people" : "share-social"}
                />
              </Pressable>
            ) : null}
          </View>

          {/* No fixed line height: Khmer stacks vowels and subscripts above and below the line. */}
          <Text className="py-1 text-display font-bold text-fg" accessibilityRole="header">
            {task.title}
          </Text>
          {task.description ? (
            <View className="mt-2">
              <ExpandableText text={task.description} className="text-body text-fg-sub" />
            </View>
          ) : null}
        </View>

        {/* ── 2. Key facts at a glance ──────────────────────────────────── */}
        <View className="mt-5">
          <TaskFactsGrid facts={facts} />
          {metaLine ? <Text className="mt-2 px-1 text-label text-fg-faint">{metaLine}</Text> : null}
        </View>

        {/* ── 3. Everything else, one tab at a time ─────────────────────── */}
        <View className="mt-6">
          <SegmentedControl options={sectionTabs} value={activeSection} onChange={setActiveSection} />
        </View>

        <View className="mt-4">
          {!isScreenSettled ? (
            <View className="gap-3">
              <SkeletonBlock height={14} className="w-1/3" />
              <SkeletonBlock height={64} radius={16} className="w-full" />
            </View>
          ) : activeSection === "work" ? (
            <View className="gap-6">
              {subtasks.length > 0 ? (
                <View>
                  <SectionHeader title={isGroupTask ? "Members" : "Subtasks"} meta={`${completedSubtasks}/${subtasks.length}`} />
                  <SubtaskWorkList subtasks={subtasks} allTasks={subtaskTasks} onSubtaskPress={openTask} />
                </View>
              ) : null}
              <SubmissionHistory
                submissions={submissions}
                isLoading={isLoadingSubmissions}
                isError={isSubmissionsError}
                onRetry={() => void refetchSubmissions()}
                // With subtasks the tab reads "Work", so the list needs its own title.
                showTitle={subtasks.length > 0}
              />
            </View>
          ) : activeSection === "comments" ? (
            <CommentsPreview
              comments={conversation.comments}
              count={conversation.count}
              isLoading={conversation.isLoading}
              currentUserId={conversation.currentUserId}
              roleOf={conversation.roleOf}
              onOpenChat={openChat}
              showTitle={false}
            />
          ) : (
            <AttachmentsSection
              taskId={id}
              attachments={attachments ?? []}
              currentUserId={currentUser?.id}
              canDeleteAny={isManagerView}
            />
          )}
        </View>

        {/* Extra bottom padding */}
        <View className="h-8" />
      </ScrollView>

      {!showReviewBar && isAssignee && taskResponse ? (
        <TaskDetailActionBar
          status={task.status}
          isAssignee={isAssignee}
          bottomInset={insets.bottom}
          onSubmitWork={() => {
            if (role && id) router.push(getSubmitWorkPathForRole(role, id));
          }}
        />
      ) : null}

      {showReviewBar && (
        <View
          className="absolute bottom-0 left-0 right-0 border-t border-line bg-surface px-4 pt-3"
          style={{ paddingBottom: Math.max(insets.bottom, 12) }}
        >
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Button
                label="Reject"
                variant="outline"
                icon="close"
                disabled={reviewLoading}
                onPress={() => setRejectModalVisible(true)}
              />
            </View>
            <View className="flex-1">
              <Button label="Approve" icon="checkmark" isLoading={reviewLoading} onPress={() => setApproveModalVisible(true)} />
            </View>
          </View>
        </View>
      )}

      <TaskReminderSheet ref={reminderSheetRef} taskId={id} />

      {isManagerView ? (
        <>
          <ManagerTaskActionsSheet
            ref={actionsSheetRef}
            canReassign={!isGroupTask}
            onReassign={handleReassign}
            onChangePriority={handleChangePriority}
            canDelete={canDelete}
            onDelete={handleDelete}
          />
          {taskResponse ? (
            <TaskPrioritySheet
              ref={prioritySheetRef}
              current={taskResponse.priority}
              onSelect={handleSelectPriority}
            />
          ) : null}
          <ApproveSubmissionModal
            visible={approveModalVisible}
            taskTitle={task.title}
            submitting={reviewLoading}
            onClose={() => setApproveModalVisible(false)}
            onConfirm={(comment) => void handleApprove(comment)}
          />
          <RejectReasonModal
            visible={rejectModalVisible}
            taskTitle={task.title}
            submitting={reviewLoading}
            onClose={() => setRejectModalVisible(false)}
            onConfirm={(reason) => void handleReject(reason)}
          />
          <PersonPickerSheet
            visible={reassignPickerVisible}
            title="Reassign to"
            onClose={() => setReassignPickerVisible(false)}
            people={reassignOptions}
            isLoading={isLoadingReassignOptions}
            selectionMode="single"
            selectedId={taskResponse?.assignee?.id}
            onSelect={handleReassignSelect}
          />
        </>
      ) : null}
    </View>
  );
}
