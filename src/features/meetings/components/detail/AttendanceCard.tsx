import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { IconButton } from "@/components/ui/IconButton";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SkeletonBlock } from "@/components/ui/Skeleton";
import { useMeetingAttendance } from "@/features/meetings/hooks/useMeetingAttendance";
import type { AttendanceEntry, AttendanceStatus } from "@/features/meetings/types/meeting.types";
import { ATTENDANCE_META } from "@/features/meetings/utils/attendanceStatus";
import { callPhone } from "@/features/team/utils/contact";
import { colors, toneColors } from "@/styles";

type AttendanceCardProps = {
  bookingId: string;
  /** "Sales (department)", "Team Lead · IT"… shown above the list. */
  invitedGroups: string[];
};

function StatusChoice({
  status,
  isActive,
  isDisabled,
  onPress,
}: {
  status: AttendanceStatus;
  isActive: boolean;
  isDisabled: boolean;
  onPress: () => void;
}) {
  const meta = ATTENDANCE_META[status];
  const tone = toneColors[meta.tone];
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="radio"
      accessibilityState={{ selected: isActive, disabled: isDisabled }}
      accessibilityLabel={meta.label}
      className="flex-1 items-center rounded-lg border py-1.5"
      style={{
        borderColor: isActive ? tone.color : colors.border,
        backgroundColor: isActive ? tone.subtle : colors.surface,
        opacity: isDisabled ? 0.5 : 1,
      }}
    >
      <Text className="text-label font-semibold" style={{ color: isActive ? tone.fg : colors.textMuted }}>
        {meta.label}
      </Text>
    </Pressable>
  );
}

function AttendeeRow({
  entry,
  canMark,
  isPending,
  onSetStatus,
}: {
  entry: AttendanceEntry;
  canMark: boolean;
  isPending: boolean;
  onSetStatus: (entry: AttendanceEntry, status: AttendanceStatus) => void;
}) {
  const meta = ATTENDANCE_META[entry.status];
  const phoneNumber = entry.user.phoneNumber;
  const checkedInTime = entry.checkedInAt
    ? new Date(entry.checkedInAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
    : null;
  const detail = [
    entry.organizer ? "Organizer" : entry.user.departmentName,
    checkedInTime ? `in at ${checkedInTime}${entry.method === "QR" ? " (QR)" : ""}` : null,
    entry.note,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <View className="gap-2 border-b border-line-soft py-2.5">
      <View className="flex-row items-center gap-3">
        <Avatar name={entry.user.fullName} imageUrl={entry.user.avatarUrl} size={36} />
        <View className="min-w-0 flex-1 gap-1">
          {/* Name shrinks (ellipsis) before the status badge does, so the status is always readable. */}
          <View className="flex-row items-center gap-2">
            <Text className="min-w-0 shrink text-body-sm font-semibold text-fg" numberOfLines={1}>
              {entry.user.fullName}
            </Text>
            <View className="shrink-0 justify-center">
              {isPending ? (
                <ActivityIndicator size="small" color={colors.brand} />
              ) : (
                <Badge label={meta.label} tone={meta.tone} hasDot />
              )}
            </View>
          </View>
          {detail ? (
            <Text className="text-label text-fg-soft" numberOfLines={1}>
              {detail}
            </Text>
          ) : null}
        </View>
        {phoneNumber ? (
          <IconButton
            icon="call"
            variant="success"
            accessibilityLabel={`Call ${entry.user.fullName}, ${phoneNumber}`}
            onPress={() => void callPhone(phoneNumber, entry.user.fullName)}
          />
        ) : null}
      </View>
      {/* {canMark ? (
        <View className="flex-row gap-1.5" accessibilityRole="radiogroup" accessibilityLabel={`Attendance of ${entry.user.fullName}`}>
          {MARKABLE_STATUSES.map((status) => (
            <StatusChoice
              key={status}
              status={status}
              isActive={entry.status === status}
              isDisabled={isPending}
              onPress={() => onSetStatus(entry, status)}
            />
          ))}
        </View>
      ) : null} */}
    </View>
  );
}

/** Who came: counts, check-in / QR buttons, and the per-person list (editable for the organizer). */
export function AttendanceCard({ bookingId, invitedGroups }: AttendanceCardProps) {
  const model = useMeetingAttendance(bookingId);
  const { attendance } = model;

  if (model.isLoading) {
    return (
      <Card>
        <SkeletonBlock height={18} width="40%" />
        <View className="mt-3 gap-2">
          <SkeletonBlock height={40} />
          <SkeletonBlock height={40} />
        </View>
      </Card>
    );
  }

  if (model.isError || !attendance) {
    return (
      <Card>
        <SectionHeader title="Attendance" />
        <Text className="text-caption text-fg-soft">Couldn&apos;t load attendance.</Text>
        <View className="mt-2">
          <Button label="Retry" variant="outline" size="sm" isFullWidth={false} onPress={model.refetch} />
        </View>
      </Card>
    );
  }

  const { counts } = attendance;
  const summary = [
    { label: "Present", value: counts.present, tone: toneColors.success },
    { label: "Late", value: counts.late, tone: toneColors.warning },
    { label: "Absent", value: counts.absent, tone: toneColors.error },
    { label: "Excused", value: counts.excused, tone: toneColors.violet },
  ];

  return (
    <Card>
      <SectionHeader title="Attendance" meta={`${counts.present + counts.late} of ${counts.total} in`} />

      <View className="flex-row gap-2">
        {summary.map((item) => (
          <View key={item.label} className="flex-1 items-center rounded-xl py-2" style={{ backgroundColor: item.tone.subtle }}>
            <Text className="text-headline font-bold" style={{ color: item.tone.fg }}>
              {item.value}
            </Text>
            <Text className="text-micro font-medium" style={{ color: item.tone.fg }}>
              {item.label}
            </Text>
          </View>
        ))}
      </View>

      {model.canCheckIn || model.canShowCode ? (
        <View className="mt-3 gap-2">
          {model.canCheckIn ? <Button label="Check in" icon="qr-code-outline" onPress={model.openScanner} /> : null}
          {model.canShowCode ? (
            <Button label="Show check-in QR" icon="qr-code-outline" variant="outline" onPress={model.openCode} />
          ) : null}
        </View>
      ) : null}

      {model.myEntry && !model.myEntry.organizer && !model.canCheckIn ? (
        <Text className="mt-3 text-caption text-fg-soft">
          Your attendance: <Text className="font-semibold text-fg">{ATTENDANCE_META[model.myEntry.status].label}</Text>
          {!attendance.checkInOpen && model.myEntry.status === "UNKNOWN"
            ? " — check-in opens 10 minutes before the meeting."
            : ""}
        </Text>
      ) : null}

      {invitedGroups.length > 0 ? (
        <View className="mt-3 flex-row flex-wrap gap-2">
          {invitedGroups.map((group) => (
            <View key={group} className="rounded-full bg-brand-subtle px-3 py-1">
              <Text className="text-label font-medium text-brand-strong">{group}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {attendance.canMark ? (
        <Text className="mt-3 text-label text-fg-soft">
          Tap a status to set it; tap it again to clear. Anyone still unmarked 15 minutes after the meeting is set to
          Absent.
        </Text>
      ) : null}

      <View className="mt-1">
        {attendance.attendees.map((entry) => (
          <AttendeeRow
            key={entry.user.id}
            entry={entry}
            canMark={attendance.canMark}
            isPending={model.pendingUserId === entry.user.id}
            onSetStatus={model.setStatus}
          />
        ))}
      </View>
    </Card>
  );
}
