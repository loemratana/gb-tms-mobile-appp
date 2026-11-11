import { useLocalSearchParams, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import type { ScrollViewInstance } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  canAccessManagerArea,
  getTaskDetailPathForRole,
} from "@/features/auth/utils/navigation";
import { mapTaskResponseToEmployeeTask } from "@/features/tasks/utils/taskResponseAdapter";
import {
  formatDate,
  getCategoryLabel,
  getPriorityLabel,
  resolveTaskSubtasks,
} from "@/features/tasks/utils/task.utils";
import {
  ManagerTaskActionsSheet,
  type ManagerTaskActionsSheetRef,
} from "@/features/tasks/components/detail/ManagerTaskActionsSheet";
import { RejectReasonModal } from "@/features/tasks/components/detail/RejectReasonModal";
import {
  TaskPrioritySheet,
  type TaskPrioritySheetRef,
} from "@/features/tasks/components/detail/TaskPrioritySheet";
import type { Priority } from "@/features/tasks/types/task.types";
import { TaskDetailHeader } from "@/features/tasks/components/detail/TaskDetailHeader";
import type { AssigneeOption } from "@/features/tasks/types/assignee.types";
import { AvatarStack } from "@/features/tasks/components/shared/AvatarStack";
import { PersonPickerSheet } from "@/features/tasks/components/shared/PersonPickerSheet";
import { StatusBadge } from "@/features/tasks/components/shared/StatusBadge";
import { SubtaskWorkList } from "@/features/tasks/components/detail/SubtaskWorkList";
import { useTaskReview } from "@/features/tasks/hooks/useTaskReview";
import { AttachmentsSection } from "@/features/tasks/components/detail/AttachmentsSection";
import { ChatSection } from "@/features/tasks/components/detail/ChatSection";
import { SubmissionHistory } from "@/features/tasks/components/submissions/SubmissionHistory";
import {
  SubmitWorkBottomSheet,
  type SubmitWorkBottomSheetRef,
} from "@/features/tasks/components/submissions/SubmitWorkBottomSheet";
import { TaskDetailActionBar } from "@/features/tasks/components/detail/TaskDetailActionBar";
import { TaskDetailSkeleton } from "@/features/tasks/components/detail/TaskDetailSkeleton";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SkeletonBlock } from "@/components/ui/Skeleton";
import { StateView } from "@/components/ui/StateView";
import { PropertyRow } from "@/features/tasks/components/detail/PropertyRow";
import {
  TaskReminderSheet,
  type TaskReminderSheetRef,
} from "@/features/tasks/components/reminders/TaskReminderSheet";
import {
  useAddTaskComment,
  useAssignTask,
  useDeleteTask,
  useUpdateTask,
} from "@/features/tasks/hooks/useTaskMutations";
import { canDeleteTasks } from "@/features/auth/utils/permissions";
import { useTaskSubmissions } from "@/features/tasks/hooks/useSubmissions";
import { useSubmitWork } from "@/features/tasks/hooks/useSubmitWork";
import {
  useTask,
  useTaskAttachments,
  useTaskComments,
  useTasks,
} from "@/features/tasks/hooks/useTasks";
import { useCurrentUser, useDirectReports } from "@/features/users/hooks/useUsers";
import { useAuthStore } from "@/stores/authStore";
import { colors, priorityTone } from "@/styles";

// ---------- Constants ----------
/**
 * Roughly the stack push animation. Heavy work (the department task page and the
 * lower sections: submissions, comments, attachments) waits until it's done so
 * tapping a task slides the screen in immediately.
 */
const SCREEN_SETTLE_DELAY_MS = 350;

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
  // Managers can be assigned tasks too — they submit work the same way employees do.
  const isAssignee = Boolean(currentUser?.id && taskResponse?.assignee?.id === currentUser.id);
  const { submitWork } = useSubmitWork(id);
  const submitWorkSheetRef = useRef<SubmitWorkBottomSheetRef>(null);
  const { data: attachments } = useTaskAttachments(id);
  const { data: comments, isLoading: isLoadingComments } = useTaskComments(id);
  const assignMutation = useAssignTask(id ?? "");
  const updateTaskMutation = useUpdateTask(id ?? "");
  const deleteTaskMutation = useDeleteTask(id ?? "");
  const canDelete = canDeleteTasks(currentUser);
  const addCommentMutation = useAddTaskComment(id ?? "");

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

  // Managers may only assign to their direct reports (team scope), so offer just those.
  const { data: directReports, isLoading: isLoadingDirectReports } =
    useDirectReports(isManagerView ? currentUser?.id : undefined);
  const teamMembers = useMemo(
    () => (directReports ?? []).filter((member) => member.active),
    [directReports],
  );
  const reassignOptions = useMemo<AssigneeOption[]>(
    () =>
      teamMembers.map((member) => ({
        id: member.id,
        name: member.fullName,
        avatar: member.avatarUrl ?? null,
      })),
    [teamMembers],
  );
  const [reassignPickerVisible, setReassignPickerVisible] = useState(false);

  const scrollRef = useRef<ScrollViewInstance>(null);
  const actionsSheetRef = useRef<ManagerTaskActionsSheetRef>(null);
  const reminderSheetRef = useRef<TaskReminderSheetRef>(null);
  const prioritySheetRef = useRef<TaskPrioritySheetRef>(null);

  // Derived data
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
    canMarkReview,
    reviewLoading,
    rejectModalVisible,
    setRejectModalVisible,
    approve: handleApprove,
    reject: handleReject,
    markForReview: handleMarkReview,
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

    if (teamMembers.length === 0) {
      Alert.alert(
        "No team members found",
        "You have no active direct reports to reassign this task to.",
      );
      return;
    }

    setReassignPickerVisible(true);
  }, [task, teamMembers]);

  const handleReassignSelect = useCallback(
    (memberId: string) => {
      setReassignPickerVisible(false);
      const member = teamMembers.find((item) => item.id === memberId);
      assignMutation.mutate(
        { assigneeId: memberId },
        {
          onSuccess: () =>
            Alert.alert(
              "Reassigned",
              member ? `Task assigned to ${member.fullName}.` : "Task reassigned.",
            ),
          onError: () =>
            Alert.alert("Reassign failed", "Could not reassign this task."),
        },
      );
    },
    [teamMembers, assignMutation],
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
        { onError: () => Alert.alert("Update failed", "Could not update priority.") },
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

  const handleSendComment = useCallback(
    async (message: string) => {
      await addCommentMutation.mutateAsync({ content: message });
    },
    [addCommentMutation],
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
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 110 + Math.max(insets.bottom, 8),
        }}
      >
        {/* Title + status */}
        <View>
          <View className="mb-3 flex-row items-center gap-2">
            <StatusBadge status={task.status} />
            <Badge label={`${getPriorityLabel(task.priority)} priority`} tone={priorityTone[task.priority]} icon="flag" />
          </View>
          <Text className="text-display font-bold leading-8 text-fg" accessibilityRole="header">
            {task.title}
          </Text>
          {task.description ? (
            <Text className="mt-2 text-body leading-[22px] text-fg-sub">{task.description}</Text>
          ) : null}
          {subtasks.length > 0 ? (
            <View className="mt-4 gap-1.5">
              <Text className="text-label text-fg-soft">
                {completedSubtasks} of {subtasks.length} subtasks completed
              </Text>
              <ProgressBar value={(completedSubtasks / subtasks.length) * 100} accessibilityLabel="Subtask progress" />
            </View>
          ) : null}
        </View>
        {/* Parent task link (if this is a subtask) */}
        {parentTask ? (
          <Card onPress={() => openTask(parentTask.id)} className="mt-4" accessibilityLabel={`Subtask of ${parentTask.title}`}>
            <View className="flex-row items-center gap-2">
              <Ionicons name="git-branch-outline" size={16} color={colors.textSubtle} />
              <Text className="text-caption text-fg-soft">Subtask of</Text>
              <Text className="flex-1 text-body-sm font-semibold text-brand-strong" numberOfLines={1}>
                {parentTask.title}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textSubtle} />
            </View>
          </Card>
        ) : null}

        {/* Details */}
        <View className="mt-6">
          <SectionHeader title="Details" />
          <Card isFlush className="px-4 py-1">
            <PropertyRow
              icon="person-outline"
              label="Assignee"
              value={
                <View className="flex-row items-center gap-2">
                  <AvatarStack people={task.assignees} maxVisible={4} />
                  {isManagerView ? (
                    <Button label="Reassign" variant="ghost" size="sm" isFullWidth={false} onPress={handleReassign} />
                  ) : null}
                </View>
              }
            />
            <PropertyRow icon="calendar-outline" label="Due date" value={formatDate(task.dueDate)} hasDivider />
            {task.startDate ? (
              <PropertyRow icon="play-circle-outline" label="Started" value={formatDate(task.startDate)} hasDivider />
            ) : null}
            <PropertyRow
              icon="flag-outline"
              label="Priority"
              value={<Badge label={getPriorityLabel(task.priority)} tone={priorityTone[task.priority]} hasDot />}
              hasDivider
            />
            <PropertyRow icon="people-outline" label="Team" value={task.team ?? "—"} hasDivider />
            <PropertyRow
              icon="pricetag-outline"
              label="Category"
              value={task.category ? getCategoryLabel(task.category) : "—"}
              hasDivider
            />
          </Card>
        </View>

        {/* Subtasks Section */}
        {subtasks.length > 0 && (
          <View className="mt-6">
            <SectionHeader title="Subtasks" meta={String(subtasks.length)} />
            <SubtaskWorkList
              subtasks={subtasks}
              allTasks={subtaskTasks}
              onSubtaskPress={openTask}
            />
          </View>
        )}

        {isScreenSettled ? (
        <>
        {/* Submitted work */}
        <View className="mt-6 border-t border-line-soft pt-6">
          <SubmissionHistory
            submissions={submissions}
            isLoading={isLoadingSubmissions}
            isError={isSubmissionsError}
            onRetry={() => void refetchSubmissions()}
          />
        </View>

        {/* Comment */}
        <View className="mt-6 border-t border-line-soft pt-6">
          <ChatSection
            onSend={handleSendComment}
            comments={comments}
            isLoadingComments={isLoadingComments}
          />
        </View>

        {/* Attachments */}
        <View className="mt-6 border-t border-line-soft pt-6">
          <AttachmentsSection
            taskId={id}
            attachments={attachments ?? []}
            currentUserId={currentUser?.id}
            canDeleteAny={isManagerView}
          />
        </View>
        </>
        ) : (
          <View className="mt-6 gap-3 border-t border-line-soft pt-6">
            <SkeletonBlock height={14} className="w-1/3" />
            <SkeletonBlock height={64} radius={16} className="w-full" />
          </View>
        )}

        {/* Extra bottom padding */}
        <View className="h-8" />
      </ScrollView>

      {!showReviewBar && isAssignee && taskResponse ? (
        <TaskDetailActionBar
          status={task.status}
          isAssignee={isAssignee}
          bottomInset={insets.bottom}
          onSubmitWork={() => submitWorkSheetRef.current?.present(taskResponse.status)}
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
              <Button label="Approve" icon="checkmark" isLoading={reviewLoading} onPress={() => void handleApprove()} />
            </View>
          </View>
        </View>
      )}

      <TaskReminderSheet ref={reminderSheetRef} taskId={id} />
      <SubmitWorkBottomSheet ref={submitWorkSheetRef} onSubmit={submitWork} />

      {isManagerView ? (
        <>
          <ManagerTaskActionsSheet
            ref={actionsSheetRef}
            canMarkReview={canMarkReview}
            onReassign={handleReassign}
            onChangePriority={handleChangePriority}
            onMarkReview={() => void handleMarkReview()}
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
            isLoading={isLoadingDirectReports}
            selectionMode="single"
            selectedId={taskResponse?.assignee?.id}
            onSelect={handleReassignSelect}
          />
        </>
      ) : null}
    </View>
  );
}
