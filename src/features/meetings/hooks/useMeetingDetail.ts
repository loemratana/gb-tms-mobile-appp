import { useRouter } from "expo-router";
import { Alert } from "react-native";

import { getMeetingFormPathForRole } from "@/features/auth/utils/navigation";
import { useCancelBooking, useMeeting } from "@/features/meetings/hooks/useMeetings";
import { getApiErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";

/** One meeting with its attendees, plus edit / cancel for the organizer (or an admin). */
export function useMeetingDetail(id: string | undefined) {
  const router = useRouter();
  const role = useAuthStore((state) => state.user?.role);
  const query = useMeeting(id);
  const cancelMutation = useCancelBooking();
  const meeting = query.data;
  const canEdit = Boolean(meeting?.canEdit);

  const edit = () => {
    if (!role || !meeting) return;
    router.push(getMeetingFormPathForRole(role, { bookingId: meeting.id }));
  };

  const confirmCancel = () => {
    if (!meeting) return;
    const roomFreed = meeting.room ? ` and ${meeting.room.name} becomes free` : "";
    Alert.alert(
      "Cancel this meeting?",
      `"${meeting.title}" will be removed from everyone's schedule${roomFreed}. Attendees are notified.`,
      [
        { text: "Keep meeting", style: "cancel" },
        {
          text: "Cancel meeting",
          style: "destructive",
          onPress: () => {
            cancelMutation.mutate(
              { id: meeting.id },
              {
                onSuccess: () => router.back(),
                onError: (error) => Alert.alert("Couldn't cancel the meeting", getApiErrorMessage(error)),
              },
            );
          },
        },
      ],
    );
  };

  return {
    meeting,
    isLoading: query.isLoading,
    isError: query.isError,
    errorMessage: query.isError ? getApiErrorMessage(query.error) : null,
    isRefreshing: query.isRefetching && !query.isLoading,
    refetch: () => void query.refetch(),
    canEdit,
    isCancelling: cancelMutation.isPending,
    edit,
    confirmCancel,
  };
}
