import { useRouter } from "expo-router";
import { Text, View } from "react-native";

import { StackHeader } from "@/components/layout/StackHeader";
import { Screen } from "@/components/layout/Screen";
import { SubmissionList } from "@/features/tasks/components/submissions/SubmissionList";
import { usePendingReviewSubmissions } from "@/features/tasks/hooks/useSubmissions";
import { useRefetchOnFocus } from "@/hooks/useRefetchOnFocus";

const PAGE_SIZE = 50;

/**
 * Submissions waiting for the current manager's review, oldest first
 * (GET /submissions/pending-review). Their own submissions never appear —
 * someone else has to review those. Approve / Reject happen on the task screen.
 */
export default function ReviewQueueScreen() {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = usePendingReviewSubmissions({ size: PAGE_SIZE });
  useRefetchOnFocus(refetch);

  return (
    <Screen header={<StackHeader title="Review queue" onBack={() => router.back()} />}>
      <View className="mb-4 px-1">
        <Text className="text-caption text-fg-soft">
          Oldest first. Open a submission to see its files and approve or reject it.
        </Text>
      </View>
      <SubmissionList
        submissions={data?.content}
        totalElements={data?.totalElements}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => void refetch()}
        emptyTitle="Nothing to review"
        emptyMessage="When your team submits work, it will wait here for your review."
        showSubmitter
        onOpenSubmission={(submission) =>
          router.push({ pathname: "/(manager)/tasks/[id]", params: { id: submission.taskId } })
        }
      />
    </Screen>
  );
}
