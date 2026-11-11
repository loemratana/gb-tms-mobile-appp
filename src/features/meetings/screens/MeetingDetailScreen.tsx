import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import type { ComponentProps, ReactNode } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { StackHeader } from "@/components/layout/StackHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SkeletonBlock } from "@/components/ui/Skeleton";
import { StateView } from "@/components/ui/StateView";
import { AttendanceCard } from "@/features/meetings/components/detail/AttendanceCard";
import { useMeetingDetail } from "@/features/meetings/hooks/useMeetingDetail";
import { getMeetingPlace, openLocationUrl } from "@/features/meetings/utils/meetingLocation";
import { getMeetingStatus } from "@/features/meetings/utils/meetingStatus";
import { formatDateKey, formatTimeRange } from "@/features/meetings/utils/meetingTime";
import { getRemoteImageUrl } from "@/lib/remoteImage";
import { colors } from "@/styles";

function InfoRow({ icon, children }: { icon: ComponentProps<typeof Ionicons>["name"]; children: ReactNode }) {
  return (
    <View className="flex-row items-start gap-3">
      <View className="h-9 w-9 items-center justify-center rounded-full bg-brand-subtle">
        <Ionicons name={icon} size={17} color={colors.brandStrong} />
      </View>
      <View className="min-w-0 flex-1 justify-center" style={{ minHeight: 36 }}>
        {children}
      </View>
    </View>
  );
}

/** Meeting detail: when, where, who, and edit / cancel for the organizer. */
export default function MeetingDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const detail = useMeetingDetail(id);
  const { meeting } = detail;

  const renderBody = () => {
    if (detail.isLoading) {
      return (
        <View className="gap-3">
          <SkeletonBlock height={120} radius={16} />
          <SkeletonBlock height={160} radius={16} />
        </View>
      );
    }
    if (detail.isError || !meeting) {
      return (
        <StateView
          variant="error"
          title="Couldn't load this meeting"
          message={detail.errorMessage ?? undefined}
          actionLabel="Retry"
          onPressAction={detail.refetch}
        />
      );
    }

    const status = getMeetingStatus(meeting);
    const place = getMeetingPlace(meeting);
    const location = meeting.location;
    const placeDetail =
      place.type === "ROOM" && meeting.room
        ? [meeting.room.location, `${meeting.room.capacity} seats`].filter(Boolean).join(" · ")
        : place.type === "EXTERNAL"
          ? location?.address
          : location?.meetingUrl;
    const groups = [
      ...meeting.targets.departments.map((department) => `${department.name} (department)`),
      ...meeting.targets.positions.map(
        (position) => `${position.name}${position.departmentName ? ` · ${position.departmentName}` : ""}`,
      ),
    ];

    return (
      <View className="gap-4">
        <Card>
          <Badge label={status.label} tone={status.tone} hasDot />
          <Text className="mt-2 text-display font-bold text-fg" accessibilityRole="header">
            {meeting.title}
          </Text>
          <View className="mt-4 gap-3">
            <InfoRow icon="calendar-outline">
              <Text className="text-body-sm font-semibold text-fg">{formatDateKey(meeting.date)}</Text>
              <Text className="text-label text-fg-soft">
                {formatTimeRange(meeting.startTime, meeting.endTime)} · {meeting.durationMinutes} min
              </Text>
            </InfoRow>
            <InfoRow icon={place.icon}>
              <Text className="text-body-sm font-semibold text-fg">{place.label}</Text>
              {placeDetail ? (
                <Text className="text-label text-fg-soft" numberOfLines={2}>
                  {placeDetail}
                </Text>
              ) : null}
            </InfoRow>
            {location?.note ? (
              <InfoRow icon="information-circle-outline">
                <Text className="text-body-sm text-fg-sub">{location.note}</Text>
              </InfoRow>
            ) : null}
          </View>
          {location?.mapUrl ? (
            <View className="mt-4">
              <Button
                label="Open in Google Maps"
                icon="navigate-outline"
                variant="outline"
                onPress={() => void openLocationUrl(location.mapUrl ?? "")}
              />
            </View>
          ) : null}
          {location?.meetingUrl ? (
            <View className="mt-4">
              <Button
                label="Join meeting"
                icon="videocam-outline"
                onPress={() => void openLocationUrl(location.meetingUrl ?? "")}
              />
            </View>
          ) : null}
          {meeting.room?.coverImageUrl ? (
            <Image
              source={{ uri: getRemoteImageUrl(meeting.room.coverImageUrl) }}
              style={{ height: 140, borderRadius: 12, marginTop: 16, backgroundColor: colors.mutedBg }}
              contentFit="cover"
              accessibilityLabel={`Photo of ${meeting.room.name}`}
            />
          ) : null}
        </Card>

        {meeting.status === "CANCELLED" ? (
          <Card variant="subtle">
            <Text className="text-body-sm font-semibold text-error">
              Cancelled{meeting.cancelledBy ? ` by ${meeting.cancelledBy.fullName}` : ""}
            </Text>
            {meeting.cancelReason ? <Text className="mt-1 text-caption text-fg-sub">{meeting.cancelReason}</Text> : null}
          </Card>
        ) : null}

        {meeting.description ? (
          <Card>
            <SectionHeader title="Description" />
            <Text className="text-body text-fg-sub">{meeting.description}</Text>
          </Card>
        ) : null}

        <AttendanceCard bookingId={meeting.id} invitedGroups={groups} />
      </View>
    );
  };

  return (
    <View className="flex-1 bg-subtle">
      <StackHeader title="Meeting" onBack={() => router.back()} />
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={detail.isRefreshing} onRefresh={detail.refetch} />}
      >
        {renderBody()}
      </ScrollView>

      {detail.canEdit ? (
        <View
          className="flex-row gap-3 border-t border-line bg-surface px-4 pt-3"
          style={{ paddingBottom: Math.max(insets.bottom, 12) }}
        >
          <View className="flex-1">
            <Button
              label="Cancel meeting"
              variant="outline"
              isLoading={detail.isCancelling}
              onPress={detail.confirmCancel}
            />
          </View>
          <View className="flex-1">
            <Button label="Edit" icon="create-outline" onPress={detail.edit} />
          </View>
        </View>
      ) : null}
    </View>
  );
}
