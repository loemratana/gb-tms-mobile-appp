import Ionicons from "@expo/vector-icons/Ionicons";
import { Controller, type Control, type FieldErrors } from "react-hook-form";
import { Pressable, Text, View } from "react-native";

import { TextField } from "@/components/ui/TextField";
import { SegmentedControl, type SegmentOption } from "@/components/ui/SegmentedControl";
import type { MeetingFormValues } from "@/features/meetings/schemas/meetingForm.schema";
import type { MeetingLocationType, RoomSummary } from "@/features/meetings/types/meeting.types";
import {
  buildMapSearchUrl,
  buildMapUrl,
  formatCoordinates,
  LOCATION_TYPE_LABELS,
  openLocationUrl,
  type MapPin,
} from "@/features/meetings/utils/meetingLocation";
import { colors } from "@/styles";
import { FormField } from "./FormField";
import { FormSelectField } from "./FormSelectField";

const TYPE_OPTIONS: SegmentOption<MeetingLocationType>[] = (["ROOM", "EXTERNAL", "ONLINE"] as const).map((value) => ({
  value,
  label: LOCATION_TYPE_LABELS[value],
}));

type TextFieldName = "placeName" | "placeAddress" | "meetingUrl" | "locationNote";

type MeetingLocationFieldsProps = {
  control: Control<MeetingFormValues>;
  errors: FieldErrors<MeetingFormValues>;
  values: MeetingFormValues;
  selectedRoom: RoomSummary | undefined;
  isRoomsLoading: boolean;
  /** The pin read from the pasted link/coordinates, or null when there is none yet. */
  mapPin: MapPin | null;
  onChangeType: (type: MeetingLocationType) => void;
  onChangeMapInput: (input: string) => void;
  onOpenRoomPicker: () => void;
};

/** Where the meeting is: one of our rooms, a place pinned on Google Maps, or a video call link. */
export function MeetingLocationFields({
  control,
  errors,
  values,
  selectedRoom,
  isRoomsLoading,
  mapPin,
  onChangeType,
  onChangeMapInput,
  onOpenRoomPicker,
}: MeetingLocationFieldsProps) {
  const renderTextInput = (
    name: TextFieldName,
    options: { placeholder: string; label: string; maxLength: number; isUrl?: boolean; isMultiline?: boolean },
  ) => (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value } }) => (
        <TextField
          value={value}
          onChangeText={onChange}
          onBlur={onBlur}
          placeholder={options.placeholder}
          maxLength={options.maxLength}
          accessibilityLabel={options.label}
          autoCapitalize={options.isUrl ? "none" : "sentences"}
          autoCorrect={!options.isUrl}
          keyboardType={options.isUrl ? "url" : "default"}
          multiline={options.isMultiline}
          isInvalid={Boolean(errors[name])}
        />
      )}
    />
  );

  const noteField = (
    <FormField label="Note for attendees (optional)" error={errors.locationNote?.message}>
      {renderTextInput("locationNote", {
        label: "Note for attendees",
        placeholder: values.locationType === "ONLINE" ? "Passcode, dial-in number…" : "Floor, entrance, parking…",
        maxLength: 500,
        isMultiline: true,
      })}
    </FormField>
  );

  return (
    <View>
      <FormField label="Where">
        <SegmentedControl options={TYPE_OPTIONS} value={values.locationType} onChange={onChangeType} />
      </FormField>

      {values.locationType === "ROOM" ? (
        <FormField label="Room" error={errors.roomId?.message}>
          <FormSelectField
            icon="business-outline"
            value={selectedRoom ? `${selectedRoom.name} · ${selectedRoom.capacity} people` : ""}
            placeholder={isRoomsLoading ? "Loading rooms…" : "Choose a room"}
            accessibilityLabel="Room"
            hasChevron
            hasError={Boolean(errors.roomId)}
            onPress={onOpenRoomPicker}
          />
        </FormField>
      ) : null}

      {values.locationType === "EXTERNAL" ? (
        <>
          <FormField label="Place name" error={errors.placeName?.message}>
            {renderTextInput("placeName", { label: "Place name", placeholder: "e.g. ABC Company HQ", maxLength: 200 })}
          </FormField>

          <FormField
            label="Google Maps link or coordinates"
            error={errors.mapInput?.message}
            action={
              <Pressable
                onPress={() => void openLocationUrl(buildMapSearchUrl(values.placeName))}
                hitSlop={10}
                accessibilityRole="link"
                accessibilityLabel="Find the place in Google Maps"
                className="flex-row items-center gap-1"
              >
                <Ionicons name="search-outline" size={14} color={colors.brand} />
                <Text className="text-body-sm font-semibold text-brand">Find in Maps</Text>
              </Pressable>
            }
          >
            <Controller
              control={control}
              name="mapInput"
              render={({ field: { onBlur, value } }) => (
                <TextField
                  value={value}
                  onChangeText={onChangeMapInput}
                  onBlur={onBlur}
                  placeholder="Paste a link or 11.5564, 104.9282"
                  autoCapitalize="none"
                  autoCorrect={false}
                  accessibilityLabel="Google Maps link or coordinates"
                  isInvalid={Boolean(errors.mapInput)}
                />
              )}
            />
            {mapPin ? (
              <Pressable
                onPress={() => void openLocationUrl(buildMapUrl(mapPin))}
                accessibilityRole="link"
                accessibilityLabel="Check the pin in Google Maps"
                className="mt-2 flex-row items-center gap-2 rounded-2xl bg-brand-subtle px-4 py-2.5 active:opacity-80"
              >
                <Ionicons name="location" size={16} color={colors.brandStrong} />
                <Text className="min-w-0 flex-1 text-caption font-medium text-brand-strong" numberOfLines={1}>
                  {formatCoordinates(mapPin)}
                </Text>
                <Text className="text-caption font-semibold text-brand-strong">Check on map</Text>
              </Pressable>
            ) : (
              <Text className="mt-1.5 px-1 text-label text-fg-faint">
                In Google Maps, press and hold the place, then copy the coordinates shown at the top.
              </Text>
            )}
          </FormField>

          <FormField label="Address (optional)" error={errors.placeAddress?.message}>
            {renderTextInput("placeAddress", { label: "Address", placeholder: "Street, district", maxLength: 500 })}
          </FormField>
          {noteField}
        </>
      ) : null}

      {values.locationType === "ONLINE" ? (
        <>
          <FormField label="Meeting link" error={errors.meetingUrl?.message}>
            {renderTextInput("meetingUrl", {
              label: "Meeting link",
              placeholder: "https://meet.google.com/…",
              maxLength: 1000,
              isUrl: true,
            })}
          </FormField>
          <FormField label="Platform (optional)" error={errors.placeName?.message}>
            {renderTextInput("placeName", { label: "Platform", placeholder: "Zoom, Google Meet, Teams…", maxLength: 200 })}
          </FormField>
          {noteField}
        </>
      ) : null}
    </View>
  );
}
