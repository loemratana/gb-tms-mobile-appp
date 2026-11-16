import { useCallback, useMemo } from "react";

import { useCurrentUser } from "@/features/users/hooks/useUsers";
import { useAddTaskComment } from "./useTaskMutations";
import { useTask, useTaskComments } from "./useTasks";

/** Which quick replies fit the person writing. */
export type ConversationViewer = "assignee" | "reviewer";

/**
 * Everything a task's comment thread needs, shared by the preview on the task screen and the
 * full-screen chat: the messages, who "me" is, a role tag per speaker, and sending.
 *
 * @param pollMs how often to check for new messages while mounted.
 */
export function useTaskConversation(taskId: string | undefined, pollMs?: number) {
  const { data: task } = useTask(taskId);
  const { data: currentUser } = useCurrentUser();
  const commentsQuery = useTaskComments(taskId, pollMs);

  // Passing the author lets a sent comment appear in the thread instantly, before the server answers.
  const author = useMemo(
    () =>
      currentUser
        ? {
            id: currentUser.id,
            name: currentUser.fullName,
            email: currentUser.email,
            avatarUrl: currentUser.avatarUrl,
          }
        : null,
    [currentUser],
  );
  const addComment = useAddTaskComment(taskId ?? "", author);

  const send = useCallback(
    async (content: string) => {
      await addComment.mutateAsync({ content });
    },
    [addComment],
  );

  const isOnTask = useCallback(
    (userId: string) =>
      task?.assignee?.id === userId || Boolean(task?.assignees?.some((person) => person.id === userId)),
    [task],
  );

  // Tag each speaker with their part in the task, so a thread with several people stays readable.
  const roleOf = useCallback(
    (userId: string) => {
      if (!task) return undefined;
      if (isOnTask(userId)) return "Assignee";
      if (task.creator?.id === userId || task.assignedBy?.id === userId) return "Assigned by";
      return undefined;
    },
    [task, isOnTask],
  );

  const comments = useMemo(() => commentsQuery.data ?? [], [commentsQuery.data]);

  return {
    task,
    comments,
    /** Sent messages only (an in-flight one isn't counted yet). */
    count: comments.filter((comment) => !comment.pending).length,
    isLoading: commentsQuery.isLoading,
    isError: commentsQuery.isError,
    refetch: commentsQuery.refetch,
    send,
    currentUserId: currentUser?.id,
    roleOf,
    viewer: (currentUser?.id && isOnTask(currentUser.id) ? "assignee" : "reviewer") as ConversationViewer,
  };
}
