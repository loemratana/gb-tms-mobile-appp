import Ionicons from "@expo/vector-icons/Ionicons";
import { ActivityIndicator, Text, View } from "react-native";

import type { BookingPreviewResponse } from "@/features/meetings/types/meeting.types";
import { colors, toneColors, type Tone } from "@/styles";

type BookingPreviewNoticeProps = {
  preview: BookingPreviewResponse | undefined;
  isLoading: boolean;
};

function Line({ tone, icon, text }: { tone: Tone; icon: "people-outline" | "alert-circle-outline" | "time-outline"; text: string }) {
  return (
    <View className="flex-row items-start gap-2">
      <Ionicons name={icon} size={16} color={toneColors[tone].color} style={{ marginTop: 1 }} />
      <Text className="min-w-0 flex-1 text-caption" style={{ color: toneColors[tone].fg }}>
        {text}
      </Text>
    </View>
  );
}

/** What the server says about the draft: headcount vs capacity, clashes, invite scope. */
export function BookingPreviewNotice({ preview, isLoading }: BookingPreviewNoticeProps) {
  if (!preview) {
    return isLoading ? (
      <View className="flex-row items-center gap-2 rounded-2xl bg-surface px-4 py-3">
        <ActivityIndicator size="small" color={colors.brand} />
        <Text className="text-caption text-fg-soft">Checking availability and attendees…</Text>
      </View>
    ) : null;
  }

  const hasProblem =
    preview.fitsRoom === false || preview.roomAvailable === false || preview.scopeViolations.length > 0;
  const tone: Tone = hasProblem ? "error" : "info";
  const capacityText =
    preview.roomCapacity !== undefined
      ? `${preview.attendeeCount} attending · room holds ${preview.roomCapacity}`
      : `${preview.attendeeCount} attending`;

  return (
    <View
      className="gap-2 rounded-2xl px-4 py-3"
      style={{ backgroundColor: toneColors[tone].subtle }}
      accessibilityLiveRegion="polite"
    >
      <Line tone={preview.fitsRoom === false ? "error" : "info"} icon="people-outline" text={capacityText} />
      {preview.roomAvailable === false ? (
        <Line tone="error" icon="alert-circle-outline" text="This room is already booked at this time." />
      ) : null}
      {preview.scopeViolations.length > 0 ? (
        <Line
          tone="error"
          icon="alert-circle-outline"
          text={`You can't invite: ${preview.scopeViolations.join(", ")}`}
        />
      ) : null}
      {preview.attendeesWithConflicts ? (
        <Line
          tone="warning"
          icon="time-outline"
          text={`${preview.attendeesWithConflicts} attendee(s) already have another meeting then.`}
        />
      ) : null}
      {preview.fitsRoom === false && preview.suggestedRooms && preview.suggestedRooms.length > 0 ? (
        <Text className="text-caption text-fg-sub">
          Free rooms that fit: {preview.suggestedRooms.map((room) => `${room.name} (${room.capacity})`).join(", ")}
        </Text>
      ) : null}
    </View>
  );
}
