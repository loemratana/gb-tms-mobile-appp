import { useLocalSearchParams, useRouter } from "expo-router";
import type { ReactNode } from "react";
import { Controller } from "react-hook-form";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { TextField } from "@/components/ui/TextField";
import { StackHeader } from "@/components/layout/StackHeader";
import { Button } from "@/components/ui/Button";
import { SegmentedControl, type SegmentOption } from "@/components/ui/SegmentedControl";
import { SkeletonBlock } from "@/components/ui/Skeleton";
import { StateView } from "@/components/ui/StateView";
import { FacilityPicker } from "@/features/meetings/components/admin/FacilityPicker";
import { RoomPhotoManager } from "@/features/meetings/components/admin/RoomPhotoManager";
import { useRoom } from "@/features/meetings/hooks/useMeetings";
import { useRoomEditor } from "@/features/meetings/hooks/useRoomEditor";
import type { RoomResponse, RoomStatus } from "@/features/meetings/types/meeting.types";
import { ROOM_STATUS_META, ROOM_STATUSES } from "@/features/meetings/utils/roomStatus";
import { getApiErrorMessage } from "@/lib/api";

const STATUS_OPTIONS: SegmentOption<RoomStatus>[] = ROOM_STATUSES.map((status) => ({
  value: status,
  label: ROOM_STATUS_META[status].label,
}));


function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="rounded-2xl border border-line bg-surface p-4">
      <Text className="mb-3 text-headline font-semibold text-fg" accessibilityRole="header">
        {title}
      </Text>
      {children}
    </View>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <View className="mb-3">
      <Text className="mb-1.5 text-caption font-semibold text-fg-sub">{label}</Text>
      {children}
      {error ? <Text className="mt-1 text-label text-error">{error}</Text> : null}
    </View>
  );
}

/** Create (id "new") or edit a room. Loads the room first so the form starts with its values. */
export default function RoomEditorScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const isNew = id === "new";
  const room = useRoom(isNew ? undefined : id);

  if (!isNew && !room.data) {
    return (
      <View className="flex-1 bg-subtle">
        <StackHeader title="Edit room" onBack={() => router.back()} />
        <View className="gap-3 p-4">
          {room.isError ? (
            <StateView
              variant="error"
              title="Couldn't load this room"
              message={getApiErrorMessage(room.error)}
              actionLabel="Retry"
              onPressAction={() => void room.refetch()}
            />
          ) : (
            [0, 1, 2].map((row) => <SkeletonBlock key={row} height={120} radius={16} />)
          )}
        </View>
      </View>
    );
  }

  return <RoomEditor key={room.data?.id ?? "new"} room={room.data} />;
}

function RoomEditor({ room }: { room: RoomResponse | undefined }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const editor = useRoomEditor(room);
  const { errors } = editor;

  const textField = (
    name: "name" | "code" | "location" | "capacity",
    label: string,
    placeholder: string,
    options: { keyboardType?: "number-pad"; autoCapitalize?: "characters" | "sentences"; maxLength?: number } = {},
  ) => (
    <Field label={label} error={errors[name]?.message}>
      <Controller
        control={editor.control}
        name={name}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            accessibilityLabel={label}
            keyboardType={options.keyboardType}
            autoCapitalize={options.autoCapitalize ?? "sentences"}
            maxLength={options.maxLength}
            isInvalid={Boolean(errors[name])}
          />
        )}
      />
    </Field>
  );

  return (
    <View className="flex-1 bg-subtle">
      <StackHeader title={editor.isEdit ? "Edit room" : "New room"} onBack={() => router.back()} />

      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 24 }}
        >
          <Section title="Photos">
            {editor.isEdit ? (
              <RoomPhotoManager
                images={editor.images}
                remaining={editor.remainingImages}
                isUploading={editor.isUploading}
                isBusy={editor.isUpdatingImages || editor.isUploading}
                onAdd={editor.addPhotos}
                onSetCover={editor.setCover}
                onMove={editor.moveImage}
                onDelete={editor.confirmDeleteImage}
              />
            ) : (
              <Text className="text-caption text-fg-soft">Save the room first, then add up to 10 photos.</Text>
            )}
          </Section>

          <Section title="Details">
            {textField("name", "Name", "e.g. Meeting Room A", { maxLength: 100 })}
            <View className="flex-row gap-3">
              <View className="flex-1">
                {textField("code", "Code (optional)", "MR-3A", { autoCapitalize: "characters", maxLength: 20 })}
              </View>
              <View className="flex-1">
                {textField("capacity", "Capacity (seats)", "12", { keyboardType: "number-pad", maxLength: 3 })}
              </View>
            </View>
            {textField("location", "Location (optional)", "Building B, Floor 3", { maxLength: 200 })}
            <Field label="Description (optional)" error={errors.description?.message}>
              <Controller
                control={editor.control}
                name="description"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextField
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="What makes this room useful"
                    multiline
                    accessibilityLabel="Description"
                  />
                )}
              />
            </Field>
          </Section>

          <Section title="Status">
            <SegmentedControl options={STATUS_OPTIONS} value={editor.status} onChange={editor.setStatus} />
            <Text className="mt-2 text-label text-fg-soft">{ROOM_STATUS_META[editor.status].hint}</Text>
          </Section>

          <Section title="Facilities">
            <FacilityPicker value={editor.facilities} onToggle={editor.toggleFacility} />
          </Section>

          {editor.isEdit ? (
            <Button
              label="Delete room"
              icon="trash-outline"
              variant="destructive"
              isLoading={editor.isDeleting}
              onPress={editor.confirmDelete}
            />
          ) : null}
        </ScrollView>

        <View className="border-t border-line bg-surface px-4 pt-3" style={{ paddingBottom: Math.max(insets.bottom, 12) }}>
          <Button
            label={editor.isEdit ? "Save changes" : "Create room"}
            isLoading={editor.isSubmitting}
            disabled={editor.isEdit && !editor.isDirty}
            onPress={editor.save}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
