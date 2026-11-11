import { useKeepAwake } from "expo-keep-awake";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";

import { StackHeader } from "@/components/layout/StackHeader";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StateView } from "@/components/ui/StateView";
import { useAttendance, useCheckInCode } from "@/features/meetings/hooks/useAttendance";
import { formatTimeRange } from "@/features/meetings/utils/meetingTime";
import { getApiErrorMessage } from "@/lib/api";
import { colors } from "@/styles";

const QR_SIZE = 248;

/**
 * Organizer's phone turned toward the room: a QR code that changes every ~30 s, with a
 * live "8 of 12 checked in" counter. The screen stays on while it's open.
 */
export default function CheckInCodeScreen() {
  useKeepAwake();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const code = useCheckInCode(id);
  const attendance = useAttendance(id, true);

  const counts = attendance.data?.counts;
  const checkedIn = counts ? counts.present + counts.late : (code.data?.checkedInCount ?? 0);
  const total = counts?.total ?? code.data?.attendeeCount ?? 0;

  return (
    <View className="flex-1 bg-subtle">
      <StackHeader title="Check-in code" onBack={() => router.back()} />
      <View className="flex-1 items-center justify-center p-6">
        {code.isLoading ? (
          <ActivityIndicator color={colors.brand} />
        ) : code.isError || !code.data ? (
          <StateView
            variant="error"
            icon="qr-code-outline"
            title="Check-in isn't open"
            message={getApiErrorMessage(code.error)}
            actionLabel="Try again"
            onPressAction={() => void code.refetch()}
          />
        ) : (
          <View className="w-full items-center rounded-3xl border border-line bg-surface p-6">
            <Text className="text-center text-title font-semibold text-fg" accessibilityRole="header">
              {code.data.title}
            </Text>
            <Text className="mt-1 text-center text-body-sm text-fg-soft">
              {code.data.location ?? code.data.roomName} · {formatTimeRange(code.data.startTime, code.data.endTime)}
            </Text>

            <View className="my-6 rounded-2xl bg-white p-3" accessible accessibilityLabel="Meeting check-in QR code">
              <QRCode value={code.data.payload} size={QR_SIZE} />
            </View>

            <Text className="text-center text-caption text-fg-soft">
              Attendees open Meetings → the meeting → Check in, and scan this code. It changes every{" "}
              {code.data.refreshSeconds} seconds.
            </Text>

            <View className="mt-6 w-full gap-2">
              <View className="flex-row items-baseline justify-between">
                <Text className="text-body-sm font-semibold text-fg">Checked in</Text>
                <Text className="text-body-sm font-semibold text-fg">
                  {checkedIn} of {total}
                </Text>
              </View>
              <ProgressBar value={total > 0 ? (checkedIn / total) * 100 : 0} tone="success" accessibilityLabel={`${checkedIn} of ${total} checked in`} />
            </View>
          </View>
        )}
      </View>
    </View>
  );
}
