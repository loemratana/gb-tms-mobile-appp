import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ActivityTimeline } from "@/features/employee/components/task/ActivityTimeline";
import { AssignedPeopleSection } from "@/features/employee/components/task/AssignedPeopleSection";
import {
  SubmitWorkBottomSheet,
  type SubmitWorkBottomSheetRef,
} from "@/features/employee/components/task/SubmitWorkBottomSheet";
import { TaskDetailActionBar } from "@/features/employee/components/task/TaskDetailActionBar";
import { TaskDetailHeader } from "@/features/employee/components/task/TaskDetailHeader";
import { TaskHeroCard } from "@/features/employee/components/task/TaskHeroCard";
import { TaskInfoSection } from "@/features/employee/components/task/TaskInfoSection";
import { mapTaskResponseToEmployeeTask } from "@/features/employee/data/taskResponseAdapter";
import type { TaskActivity } from "@/features/employee/types/types";
import type { WorkUpdatePayload } from "@/features/employee/types/workUpdate";
import { uploadTaskAttachment } from "@/services/attachments.service";
import {
  TaskReminderSheet,
  type TaskReminderSheetRef,
} from "@/features/tasks/components/TaskReminderSheet";
import { TaskDetailSkeleton } from "@/features/tasks/components/TaskDetailSkeleton";
import {
  useAddTaskComment,
  useChangeTaskStatus,
} from "@/features/tasks/hooks/useTaskMutations";
import { useTask, useTaskComments } from "@/features/tasks/hooks/useTasks";
import { useCurrentUser } from "@/features/users/hooks/useUsers";

const ACTION_BAR_CLEARANCE = 92;

function activityTimestamp() {
  return new Date().toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function TaskDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: currentUser } = useCurrentUser();

  const { data: taskResponse, isLoading, isError, refetch } = useTask(id);
  const isAssignee = Boolean(
    currentUser?.id && taskResponse?.assignee?.id === currentUser.id
  );
  const changeStatusMutation = useChangeTaskStatus(id ?? "");
  const addCommentMutation = useAddTaskComment(id ?? "");
  const { data: comments } = useTaskComments(id);

  // Uploaded attachments reach the backend (see handleSubmitWork), but there's
  // no attachments list query yet, so this timeline note is session-local —
  // it won't survive leaving the screen even though the files themselves did.
  const [localActivities, setLocalActivities] = useState<TaskActivity[]>([]);

  const submitWorkSheetRef = useRef<SubmitWorkBottomSheetRef>(null);
  const reminderSheetRef = useRef<TaskReminderSheetRef>(null);

  const task = useMemo(() => {
    if (!taskResponse) return undefined;
    const mapped = mapTaskResponseToEmployeeTask(taskResponse);
    const commentActivities: TaskActivity[] = (comments ?? [])
      .map((comment) => ({
        id: comment.id,
        title: `${comment.author?.name ?? "Someone"}: ${comment.content}`,
        timestamp: new Date(comment.createdAt).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
        }),
        type: "comment" as const,
      }))
      .reverse();
    return {
      ...mapped,
      activities: [
        ...localActivities,
        ...commentActivities,
        ...(mapped.activities ?? []),
      ],
    };
  }, [taskResponse, comments, localActivities]);

  const handleSubmitWork = useCallback(
    async (payload: WorkUpdatePayload) => {
      const commentParts = [];
      if (payload.update) commentParts.push(payload.update);
      if (payload.notes) commentParts.push(`Notes: ${payload.notes}`);
      const commentContent = commentParts.join("\n\n");

      try {
        if (commentContent) {
          await addCommentMutation.mutateAsync({ content: commentContent });
        }
        if (payload.status) {
          await changeStatusMutation.mutateAsync(payload.status);
        }
      } catch {
        Alert.alert(
          "Couldn't submit",
          "Something went wrong sending your update. Please try again."
        );
        throw new Error("submit work failed");
      }

      if (payload.attachments.length > 0 && id) {
        const results = await Promise.allSettled(
          payload.attachments.map((attachment) =>
            uploadTaskAttachment(id, {
              uri: attachment.uri,
              name: attachment.name,
              mimeType: attachment.mimeType,
            })
          )
        );
        const uploaded = results.filter((r) => r.status === "fulfilled").length;
        const failed = results.length - uploaded;

        setLocalActivities((prev) => [
          {
            id: `local-files-${Date.now()}`,
            title:
              failed === 0
                ? `Uploaded ${uploaded} attachment${uploaded === 1 ? "" : "s"}`
                : `Uploaded ${uploaded} of ${results.length} attachment${
                    results.length === 1 ? "" : "s"
                  } — ${failed} failed`,
            timestamp: activityTimestamp(),
            type: "work_update",
          },
          ...prev,
        ]);

        if (failed > 0) {
          Alert.alert(
            "Some attachments failed",
            `${failed} attachment${failed === 1 ? "" : "s"} couldn't be uploaded. The rest of your update was sent.`
          );
        }
      }

      Alert.alert("Work submitted", "Your update was sent to your manager.");
    },
    [addCommentMutation, changeStatusMutation, id]
  );

  const openReminderSettings = useCallback(() => {
    reminderSheetRef.current?.present();
  }, []);

  if (isLoading) {
    return (
      <View className="flex-1 bg-[#F3F4F6]">
        <TaskDetailHeader title="Task" status="todo" onBack={() => router.back()} />
        <TaskDetailSkeleton />
      </View>
    );
  }

  if (isError || !task || !taskResponse) {
    return (
      <View className="flex-1 bg-[#F3F4F6]">
        <TaskDetailHeader title="Task" status="todo" onBack={() => router.back()} />
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

  return (
    <>
      <View className="flex-1 bg-[#F3F4F6]">
        <TaskDetailHeader
          title={task.title}
          status={task.status}
          onBack={() => router.back()}
          onReminder={openReminderSettings}
        />

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingBottom: ACTION_BAR_CLEARANCE + Math.max(insets.bottom, 12),
          }}
        >
          <View className="gap-5 px-4 pt-4">
            <TaskHeroCard task={task} />
            <AssignedPeopleSection
              task={task}
              currentUserId={currentUser?.id}
            />
            <TaskInfoSection task={task} />
            <ActivityTimeline task={task} />
          </View>
        </ScrollView>

        <TaskDetailActionBar
          status={task.status}
          isAssignee={isAssignee}
          bottomInset={insets.bottom}
          onSubmitWork={() => submitWorkSheetRef.current?.present(taskResponse.status)}
        />
      </View>

      <SubmitWorkBottomSheet
        ref={submitWorkSheetRef}
        onSubmit={handleSubmitWork}
      />
      <TaskReminderSheet ref={reminderSheetRef} taskId={id} />
    </>
  );
}
