import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Controller } from "react-hook-form";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { TextField } from "@/components/ui/TextField";
import { StackHeader } from "@/components/layout/StackHeader";
import { Button } from "@/components/ui/Button";
import { SkeletonBlock } from "@/components/ui/Skeleton";
import { StateView } from "@/components/ui/StateView";
import { BookingPreviewNotice } from "@/features/meetings/components/form/BookingPreviewNotice";
import { FormField as Field } from "@/features/meetings/components/form/FormField";
import { FormSelectField } from "@/features/meetings/components/form/FormSelectField";
import { MeetingLocationFields } from "@/features/meetings/components/form/MeetingLocationFields";
import { MemberList } from "@/features/meetings/components/form/MemberList";
import { MemberPickerModal } from "@/features/meetings/components/form/MemberPickerModal";
import { RoomPickerModal } from "@/features/meetings/components/form/RoomPickerModal";
import { useMeeting } from "@/features/meetings/hooks/useMeetings";
import { useMeetingForm, type MeetingFormParams } from "@/features/meetings/hooks/useMeetingForm";
import type { BookingResponse } from "@/features/meetings/types/meeting.types";
import { formatDateKey } from "@/features/meetings/utils/meetingTime";
import { SchedulePickerOverlay } from "@/features/tasks/hooks/useTaskSchedulePicker";
import { getApiErrorMessage } from "@/lib/api";

type FormParams = { bookingId?: string; roomId?: string; date?: string };

/**
 * New / edit meeting route. When editing, the booking is loaded first so the form
 * mounts with its values (the text inputs are uncontrolled and read their initial value once).
 */
export default function MeetingFormScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<FormParams>();
  const existing = useMeeting(params.bookingId);

  if (params.bookingId && !existing.data) {
    return (
      <View className="flex-1 bg-subtle">
        <StackHeader title="Edit Meeting" onBack={() => router.back()} />
        <View className="gap-3 p-4">
          {existing.isError ? (
            <StateView
              variant="error"
              title="Couldn't load this meeting"
              message={getApiErrorMessage(existing.error)}
              actionLabel="Retry"
              onPressAction={() => void existing.refetch()}
            />
          ) : (
            [0, 1, 2, 3].map((row) => <SkeletonBlock key={row} height={48} radius={24} />)
          )}
        </View>
      </View>
    );
  }

  return <MeetingForm params={{ roomId: params.roomId, date: params.date }} booking={existing.data} />;
}

/** Name, date, start–end time, room and members, checked live against the server. */
function MeetingForm({ params, booking }: { params: MeetingFormParams; booking?: BookingResponse }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const form = useMeetingForm(params, booking);
  const [isRoomPickerOpen, setRoomPickerOpen] = useState(false);
  const [isMemberPickerOpen, setMemberPickerOpen] = useState(false);

  const title = form.isEdit ? "Edit Meeting" : "New Meeting";
  const { values, errors } = form;

  const removeTarget = (key: "departmentIds" | "positionIds" | "userIds", id: string) =>
    form.setTargets({ ...values.targets, [key]: values.targets[key].filter((item) => item !== id) });

  return (
    <View className="flex-1 bg-subtle">
      <StackHeader title={title} onBack={() => router.back()} />

      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        >
          <Field label="Name of meeting" error={errors.title?.message}>
            <Controller
              control={form.control}
              name="title"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextField
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="e.g. Weekly sync"
                  maxLength={200}
                  accessibilityLabel="Name of meeting"
                  isInvalid={Boolean(errors.title)}
                />
              )}
            />
          </Field>

          <Field label="Date" error={errors.date?.message}>
            <FormSelectField
              icon="calendar-outline"
              value={values.date ? formatDateKey(values.date) : ""}
              placeholder="Pick a date"
              accessibilityLabel="Date"
              hasError={Boolean(errors.date)}
              onPress={() => form.openPicker("startDate")}
            />
          </Field>

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Field label="Start time" error={errors.startTime?.message}>
                <FormSelectField
                  icon="time-outline"
                  value={values.startTime}
                  accessibilityLabel="Start time"
                  hasError={Boolean(errors.startTime)}
                  onPress={() => form.openPicker("startTime")}
                />
              </Field>
            </View>
            <View className="flex-1">
              <Field label="End time" error={errors.endTime?.message}>
                <FormSelectField
                  icon="time-outline"
                  value={values.endTime}
                  accessibilityLabel="End time"
                  hasError={Boolean(errors.endTime)}
                  onPress={() => form.openPicker("endTime")}
                />
              </Field>
            </View>
          </View>

          <MeetingLocationFields
            control={form.control}
            errors={errors}
            values={values}
            selectedRoom={form.selectedRoom}
            isRoomsLoading={form.isRoomsLoading}
            mapPin={form.mapPin}
            onChangeType={form.setLocationType}
            onChangeMapInput={form.setMapInput}
            onOpenRoomPicker={() => setRoomPickerOpen(true)}
          />

          <Field
            label="Members"
            action={
              <Pressable
                onPress={() => setMemberPickerOpen(true)}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="Add members"
                className="flex-row items-center gap-1"
              >
                <Text className="text-body-sm font-semibold text-brand">+ Add</Text>
              </Pressable>
            }
          >
            <MemberList
              organizer={form.organizer ?? undefined}
              organizerSubtitle={form.organizer && "position" in form.organizer ? form.organizer.position?.name : undefined}
              targets={values.targets}
              directory={form.directory}
              onRemove={removeTarget}
            />
          </Field>

          <Field label="Description (optional)" error={errors.description?.message}>
            <Controller
              control={form.control}
              name="description"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextField
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Agenda, links, what to prepare…"
                  multiline
                  accessibilityLabel="Description"
                />
              )}
            />
          </Field>

          <View className="mt-4">
            <BookingPreviewNotice preview={form.preview} isLoading={form.isPreviewing} />
          </View>
        </ScrollView>

        <View className="border-t border-line bg-surface px-4 pt-3" style={{ paddingBottom: Math.max(insets.bottom, 12) }}>
          {form.blockingReason ? (
            <Text className="mb-2 text-center text-caption text-error">{form.blockingReason}</Text>
          ) : null}
          <Button
            label={form.isEdit ? "Save changes" : "Create"}
            isLoading={form.isSubmitting}
            disabled={Boolean(form.blockingReason)}
            onPress={form.submit}
          />
        </View>
      </KeyboardAvoidingView>

      {isRoomPickerOpen ? (
        <RoomPickerModal
          visible
          rooms={form.rooms}
          isLoading={form.isRoomsLoading}
          selectedRoomId={values.roomId}
          availableRoomIds={form.availableRoomIds}
          attendeeCount={form.preview?.attendeeCount ?? 1}
          onSelect={form.setRoom}
          onClose={() => setRoomPickerOpen(false)}
        />
      ) : null}

      {isMemberPickerOpen ? (
        <MemberPickerModal
          visible
          directory={form.directory}
          isLoading={form.isDirectoryLoading}
          isError={form.isDirectoryError}
          organizerId={form.organizer?.id}
          value={values.targets}
          onConfirm={form.setTargets}
          onClose={() => setMemberPickerOpen(false)}
        />
      ) : null}

      <SchedulePickerOverlay overlayProps={form.pickerOverlay} />
    </View>
  );
}
