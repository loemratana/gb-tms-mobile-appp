import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Calendar,
  ChevronRight,
  Clock,
  Flag,
  Folder,
  Tag,
  UserPlus,
  Users,
} from "lucide-react-native";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useDepartmentMembers } from "@/features/departments/hooks/useDepartments";
import { mapTaskResponseToEmployeeTask } from "@/features/employee/data/taskResponseAdapter";
import {
  formatDate,
  getCategoryLabel,
  getPriorityLabel,
  getSubtaskCompletionProgress,
  resolveTaskSubtasks,
} from "@/features/employee/helpers/helpers";
import type { TaskPriority } from "@/features/employee/types/types";
import { PRIORITY_OPTIONS } from "@/features/manager/components/create-task/taskFormSchema";
import { AttachmentsSection } from "@/features/manager/components/task-detail/AttachmentsSection";
import { ChatSection } from "@/features/manager/components/task-detail/ChatSection";
import {
  ManagerTaskActionsSheet,
  type ManagerTaskActionsSheetRef,
} from "@/features/manager/components/task-detail/ManagerTaskActionsSheet";
import { RejectReasonModal } from "@/features/manager/components/task-detail/RejectReasonModal";
import { TaskDetailHeader } from "@/features/manager/components/task-detail/TaskDetailHeader";
import type { AssigneePickerOption } from "@/features/manager/components/shared/AssigneePicker";
import { ReassignPickerModal } from "@/features/manager/components/shared/ReassignPickerModal";
import { AvatarStack } from "@/features/manager/components/task/AvatarStack";
import { SegmentedProgressBar } from "@/features/manager/components/task/SegmentedProgressBar";
import { StatusBadge } from "@/features/manager/components/task/StatusBadge";
import { SubtaskWorkList } from "@/features/manager/components/task/SubtaskWorkList";
import { getManagerTaskDetailExtras } from "@/features/manager/data/taskDetail";
import { useTaskReview } from "@/features/manager/hooks/useTaskReview";
import { TaskDetailSkeleton } from "@/features/tasks/components/TaskDetailSkeleton";
import {
  TaskReminderSheet,
  type TaskReminderSheetRef,
} from "@/features/tasks/components/TaskReminderSheet";
import {
  useAddTaskComment,
  useAssignTask,
  useUpdateTask,
} from "@/features/tasks/hooks/useTaskMutations";
import { useTask, useTasks } from "@/features/tasks/hooks/useTasks";

// ---------- Constants ----------
const CARD_SHADOW = Platform.select({
  ios: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  android: { elevation: 1 },
});

const PRIORITY_COLORS = {
  low: "#32CD32",
  medium: "#F59E0B",
  high: "#EF4444",
  urgent: "#EF4444",
};

const PRIORITY_BG = {
  low: "rgba(50,205,50,0.10)",
  medium: "rgba(245,158,11,0.10)",
  high: "rgba(239,68,68,0.10)",
  urgent: "rgba(239,68,68,0.10)",
};

// ---------- Subcomponents (internal) ----------

// Priority Badge (pill)
const PriorityBadge = ({ priority }: { priority: TaskPriority }) => {
  const label = getPriorityLabel(priority);
  const color = PRIORITY_COLORS[priority];
  const bg = PRIORITY_BG[priority];
  return (
    <View
      className="rounded-full px-2.5 py-0.5"
      style={{ backgroundColor: bg }}
    >
      <Text className="text-[11px] font-semibold" style={{ color }}>
        {label}
      </Text>
    </View>
  );
};

// Quick Info Item (for grid)
const QuickInfoItem = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <View className="flex-row items-center gap-2 py-1.5">
    <View className="w-5 items-center">{icon}</View>
    <View>
      <Text className="text-[11px] text-[#6B7280]">{label}</Text>
      <Text className="text-[13px] font-semibold text-[#111827]">{value}</Text>
    </View>
  </View>
);

// ---------- Main Screen ----------
export default function ManagerTaskDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: taskResponse, isLoading, isError, refetch } = useTask(id);
  const assignMutation = useAssignTask(id ?? "");
  const updateTaskMutation = useUpdateTask(id ?? "");
  const addCommentMutation = useAddTaskComment(id ?? "");

  const task = useMemo(
    () =>
      taskResponse ? mapTaskResponseToEmployeeTask(taskResponse) : undefined,
    [taskResponse],
  );

  const departmentId = taskResponse?.department?.id;

  // Pulls the rest of the department's tasks purely to resolve subtask/parent
  // relationships client-side — there's no "subtasks of X" endpoint yet.
  const { data: departmentTasksPage } = useTasks(
    { departmentId, size: 200 },
    Boolean(departmentId),
  );
  const allTasks = useMemo(
    () =>
      (departmentTasksPage?.content ?? []).map(mapTaskResponseToEmployeeTask),
    [departmentTasksPage],
  );

  const { data: departmentMembers, isLoading: isLoadingDepartmentMembers } =
    useDepartmentMembers(departmentId);
  const reassignOptions = useMemo<AssigneePickerOption[]>(
    () =>
      (departmentMembers ?? []).map((member) => ({
        id: member.id,
        name: member.fullName,
        avatar:
          member.avatarUrl ??
          `https://i.pravatar.cc/100?u=${encodeURIComponent(member.fullName)}`,
      })),
    [departmentMembers],
  );
  const [reassignPickerVisible, setReassignPickerVisible] = useState(false);

  const scrollRef = useRef<ScrollView>(null);
  const actionsSheetRef = useRef<ManagerTaskActionsSheetRef>(null);
  const reminderSheetRef = useRef<TaskReminderSheetRef>(null);

  // Derived data
  const subtasks = useMemo(
    () => (task ? resolveTaskSubtasks(allTasks, task) : []),
    [allTasks, task],
  );
  const displayProgress =
    subtasks.length > 0
      ? getSubtaskCompletionProgress(subtasks)
      : (task?.progress ?? 0);

  const parentTask = useMemo(
    () =>
      task?.parentId
        ? allTasks.find((item) => item.id === task.parentId)
        : undefined,
    [allTasks, task],
  );

  const handleSubtaskPress = useCallback(
    (subtaskId: string) => {
      router.push({
        pathname: "/(manager)/tasks/[id]",
        params: { id: subtaskId },
      });
    },
    [router],
  );

  const {
    isReviewPending,
    canMarkReview,
    reviewLoading,
    rejectModalVisible,
    setRejectModalVisible,
    approve: handleApprove,
    reject: handleReject,
    markForReview: handleMarkReview,
  } = useTaskReview(id, taskResponse);

  const openActions = useCallback(() => {
    actionsSheetRef.current?.present();
  }, []);

  const openReminderSettings = useCallback(() => {
    reminderSheetRef.current?.present();
  }, []);

  const handleRequestUpdate = useCallback(() => {
    Alert.alert("Request sent", "An update request was sent to the assignee.");
  }, []);

  const handleReassign = useCallback(() => {
    if (!task) return;

    if (!departmentMembers || departmentMembers.length === 0) {
      Alert.alert(
        "No teammates found",
        "There are no other members in this department to reassign to.",
      );
      return;
    }

    setReassignPickerVisible(true);
  }, [task, departmentMembers]);

  const handleReassignSelect = useCallback(
    (memberId: string) => {
      setReassignPickerVisible(false);
      const member = departmentMembers?.find((item) => item.id === memberId);
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
    [departmentMembers, assignMutation],
  );

  const handleChangePriority = useCallback(() => {
    if (!task || !taskResponse) return;

    Alert.alert(
      "Change Priority",
      `Current: ${getPriorityLabel(task.priority)}`,
      [
        ...PRIORITY_OPTIONS.map((option) => ({
          text: option.label,
          onPress: () => {
            updateTaskMutation.mutate(
              {
                title: taskResponse.title,
                description: taskResponse.description ?? undefined,
                priority: option.id,
                dueDate: taskResponse.dueDate ?? undefined,
              },
              {
                onSuccess: () =>
                  Alert.alert(
                    "Priority updated",
                    `Priority set to ${option.label}.`,
                  ),
                onError: () =>
                  Alert.alert("Update failed", "Could not update priority."),
              },
            );
          },
        })),
        { text: "Cancel", style: "cancel" as const },
      ],
    );
  }, [task, taskResponse, updateTaskMutation]);

  const handleSendComment = useCallback(
    async (message: string) => {
      try {
        await addCommentMutation.mutateAsync({ content: message });
      } catch {
        Alert.alert(
          "Couldn't send",
          "Your comment wasn't sent. Please try again.",
        );
      }
    },
    [addCommentMutation],
  );

  if (isLoading) {
    return (
      <View className="flex-1 bg-[#F8FAFC]">
        <TaskDetailHeader
          title="Task"
          status="todo"
          onBack={() => router.back()}
        />
        <TaskDetailSkeleton />
      </View>
    );
  }

  if (isError || !task) {
    return (
      <View className="flex-1 bg-[#F8FAFC]">
        <TaskDetailHeader
          title="Task"
          status="todo"
          onBack={() => router.back()}
        />
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-base font-bold text-[#111827]">
            {isError ? "Couldn't load this task" : "Task not found"}
          </Text>
          <Text className="mt-1 text-center text-sm text-[#6B7280]">
            {isError
              ? "Check your connection and try again."
              : "This task may have been removed or is unavailable."}
          </Text>
          {isError ? (
            <Pressable
              onPress={() => void refetch()}
              accessibilityRole="button"
              accessibilityLabel="Retry loading task"
              className="mt-4 rounded-full bg-[#ECFDF5] px-4 py-2"
            >
              <Text className="text-[13px] font-semibold text-[#15803D]">
                Retry
              </Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    );
  }

  const extras = getManagerTaskDetailExtras(task);

  // ---------- Render ----------
  return (
    <View className="flex-1 bg-[#F8FAFC]">
      <TaskDetailHeader
        title={task.title}
        status={task.status}
        onBack={() => router.back()}
        onMore={openActions}
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
        {/* Hero Section */}
        <Animated.View
          entering={FadeIn.duration(400)}
          className="bg-white rounded-2xl p-4"
          style={CARD_SHADOW}
        >
          <View className="flex-row items-center gap-2 mb-2">
            <PriorityBadge priority={task.priority} />
            <StatusBadge status={task.status} />
          </View>
          <Text className="text-[22px] font-bold text-[#111827] leading-7">
            {task.title}
          </Text>
          {task.description && (
            <Text className="mt-1.5 text-[14px] text-[#6B7280] leading-5">
              {task.description}
            </Text>
          )}
          <View className="mt-3">
            <SegmentedProgressBar progress={displayProgress} animated />
            {subtasks.length > 0 && (
              <Text className="mt-1 text-[12px] text-[#6B7280]">
                {subtasks.filter((s) => s.status === "done").length} of{" "}
                {subtasks.length} subtasks completed
              </Text>
            )}
          </View>
        </Animated.View>
        {/* Parent Task Link (if subtask) */}
        {parentTask && (
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/(manager)/tasks/[id]",
                params: { id: parentTask.id },
              })
            }
            className="mt-4 flex-row items-center rounded-2xl bg-white px-4 py-3"
            style={CARD_SHADOW}
          >
            <Text className="text-[12px] font-medium text-[#6B7280]">
              Subtask of
            </Text>
            <Text
              className="ml-2 flex-1 text-[13px] font-semibold text-[#2563EB]"
              numberOfLines={1}
            >
              {parentTask.title}
            </Text>
            <ChevronRight size={16} color="#2563EB" />
          </Pressable>
        )}

        {/* Quick Information Grid */}
        <View className="mt-4 bg-white rounded-2xl p-4" style={CARD_SHADOW}>
          <Text className="text-[15px] font-semibold text-[#111827] mb-2">
            Quick Information
          </Text>
          <View className="flex-row flex-wrap">
            <View className="w-1/2">
              <QuickInfoItem
                icon={<Calendar size={16} color="#6B7280" />}
                label="Due Date"
                value={formatDate(task.dueDate)}
              />
            </View>
            <View className="w-1/2">
              <QuickInfoItem
                icon={<Flag size={16} color="#6B7280" />}
                label="Priority"
                value={getPriorityLabel(task.priority)}
              />
            </View>
            <View className="w-1/2">
              <QuickInfoItem
                icon={<Folder size={16} color="#6B7280" />}
                label="Project"
                value={task.project ?? "—"}
              />
            </View>
            <View className="w-1/2">
              <QuickInfoItem
                icon={<Users size={16} color="#6B7280" />}
                label="Team"
                value={task.team ?? "—"}
              />
            </View>
            <View className="w-1/2">
              <QuickInfoItem
                icon={<Tag size={16} color="#6B7280" />}
                label="Category"
                value={task.category ? getCategoryLabel(task.category) : "—"}
              />
            </View>
            {task.startDate && (
              <View className="w-1/2">
                <QuickInfoItem
                  icon={<Clock size={16} color="#6B7280" />}
                  label="Started"
                  value={formatDate(task.startDate)}
                />
              </View>
            )}
          </View>
        </View>

        {/* Employee / Assignee Section */}
        <View className="mt-4 bg-white rounded-2xl p-4" style={CARD_SHADOW}>
          <Text className="text-[15px] font-semibold text-[#111827] mb-2">
            Assignees
          </Text>
          <View className="flex-row items-center gap-3">
            <AvatarStack people={task.assignees} maxVisible={4} />
            <View className="flex-1">
              <Text className="text-[14px] font-semibold text-[#111827]">
                {task.assignees[0]?.name || "Unassigned"}
              </Text>
            </View>
            <Pressable
              onPress={handleReassign}
              className="flex-row items-center gap-1 rounded-full bg-[#F3F4F6] px-3 py-1.5"
            >
              <UserPlus size={14} color="#6B7280" />
              <Text className="text-[12px] font-medium text-[#6B7280]">
                Reassign
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Subtasks Section */}
        {subtasks.length > 0 && (
          <View className="mt-4 bg-white rounded-2xl p-4" style={CARD_SHADOW}>
            <Text className="text-[15px] font-semibold text-[#111827] mb-2">
              Subtasks
            </Text>
            <SubtaskWorkList
              subtasks={subtasks}
              allTasks={allTasks}
              onSubtaskPress={handleSubtaskPress}
            />
          </View>
        )}

        {/* Comment */}
        <View className="mt-4">
          <ChatSection onSend={(message) => void handleSendComment(message)} />
        </View>

        {/* Attachments */}
        <View className="mt-4">
          <AttachmentsSection attachments={extras.attachments} />
        </View>

        {/* Extra bottom padding */}
        <View className="h-8" />
      </ScrollView>

      {isReviewPending && (
        <View
          className="absolute bottom-0 left-0 right-0 border-t border-[#E5E7EB] bg-white px-4 pt-3"
          style={[CARD_SHADOW, { paddingBottom: Math.max(insets.bottom, 12) }]}
        >
          <View className="flex-row gap-2">
            <Pressable
              onPress={() => void handleApprove()}
              disabled={reviewLoading}
              className="flex-1 items-center rounded-2xl bg-[#32CD32] py-3"
            >
              <Text className="text-[14px] font-bold text-white">Approve</Text>
            </Pressable>

            <Pressable
              onPress={() => setRejectModalVisible(true)}
              disabled={reviewLoading}
              className="flex-1 items-center rounded-2xl bg-[#EF4444] py-3"
            >
              <Text className="text-[14px] font-bold text-white">Reject</Text>
            </Pressable>
          </View>
        </View>
      )}

      <ManagerTaskActionsSheet
        ref={actionsSheetRef}
        canMarkReview={canMarkReview}
        onRequestUpdate={handleRequestUpdate}
        onReassign={handleReassign}
        onChangePriority={handleChangePriority}
        onMarkReview={() => void handleMarkReview()}
      />

      <RejectReasonModal
        visible={rejectModalVisible}
        taskTitle={task.title}
        submitting={reviewLoading}
        onClose={() => setRejectModalVisible(false)}
        onConfirm={(reason) => void handleReject(reason)}
      />

      <TaskReminderSheet ref={reminderSheetRef} taskId={id} />

      <ReassignPickerModal
        visible={reassignPickerVisible}
        onClose={() => setReassignPickerVisible(false)}
        employees={reassignOptions}
        onSelect={handleReassignSelect}
        isLoading={isLoadingDepartmentMembers}
      />
    </View>
  );
}
