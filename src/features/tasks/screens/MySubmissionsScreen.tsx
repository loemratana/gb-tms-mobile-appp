import { useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { getTaskDetailPathForRole } from "@/features/auth/utils/navigation";
import { StackHeader } from "@/components/layout/StackHeader";
import { Screen } from "@/components/layout/Screen";
import { ChipRow, type ChipOption } from "@/components/ui/ChipRow";
import { SubmissionList } from "@/features/tasks/components/submissions/SubmissionList";
import { useMySubmissions } from "@/features/tasks/hooks/useSubmissions";
import type { SubmissionStatus } from "@/features/tasks/types/submission.types";
import { useRefetchOnFocus } from "@/hooks/useRefetchOnFocus";
import { useAuthStore } from "@/stores/authStore";

type StatusFilter = "ALL" | SubmissionStatus;

const PAGE_SIZE = 50;

const FILTER_OPTIONS: ChipOption<StatusFilter>[] = [
  { key: "ALL", label: "All" },
  { key: "PENDING", label: "Awaiting review" },
  { key: "APPROVED", label: "Approved" },
  { key: "REJECTED", label: "Rejected" },
];

/** Everything the current user has submitted, across all tasks (GET /submissions/me). */
export default function MySubmissionsScreen() {
  const router = useRouter();
  const role = useAuthStore((state) => state.user?.role);
  const [filter, setFilter] = useState<StatusFilter>("ALL");

  const { data, isLoading, isError, refetch } = useMySubmissions({
    status: filter === "ALL" ? undefined : filter,
    size: PAGE_SIZE,
  });
  useRefetchOnFocus(refetch);

  return (
    <Screen header={<StackHeader title="My submissions" onBack={() => router.back()} />}>
      <View className="-mx-4 mb-4">
        <ChipRow options={FILTER_OPTIONS} active={filter} onChange={setFilter} />
      </View>
      <SubmissionList
        submissions={data?.content}
        totalElements={data?.totalElements}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => void refetch()}
        emptyTitle="No submissions yet"
        emptyMessage="Work you submit on your tasks shows up here with its review result."
        onOpenSubmission={(submission) => {
          if (role) router.push(getTaskDetailPathForRole(role, submission.taskId));
        }}
      />
    </Screen>
  );
}
