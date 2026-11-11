import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { useCallback, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Alert } from "react-native";

import { toDateKey } from "@/features/calendar/utils/calendarDates";
import { getMeetingDetailPathForRole } from "@/features/auth/utils/navigation";
import { useDepartmentTree } from "@/features/departments/hooks/useDepartments";
import {
  useAvailableRooms,
  useBookingPreview,
  useCreateBooking,
  useRooms,
  useUpdateBooking,
} from "@/features/meetings/hooks/useMeetings";
import { meetingFormSchema, type MeetingFormValues } from "@/features/meetings/schemas/meetingForm.schema";
import type {
  BookingLocationInput,
  BookingPreviewRequest,
  BookingRequest,
  BookingResponse,
  BookingTargets,
  MeetingLocationType,
} from "@/features/meetings/types/meeting.types";
import {
  describeMeetingPlace,
  formatCoordinates,
  getMeetingPlace,
  normalizeMeetingUrl,
  parseMapPin,
} from "@/features/meetings/utils/meetingLocation";
import { buildMemberDirectory, EMPTY_TARGETS, targetsOfBooking } from "@/features/meetings/utils/memberDirectory";
import { addMinutesToTime, minutesOf, snapToSlot, SLOT_MINUTES, timeOf } from "@/features/meetings/utils/meetingTime";
import { useTaskSchedulePicker, type PickerTarget } from "@/features/tasks/hooks/useTaskSchedulePicker";
import { useCurrentUser } from "@/features/users/hooks/useUsers";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { getApiErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";

const DEFAULT_DURATION_MINUTES = 60;
const DEFAULT_START = "09:00";
const PREVIEW_DEBOUNCE_MS = 400;
/** What the server labels an ONLINE meeting with no name. */
const ONLINE_DEFAULT_LABEL = "Online meeting";

export type MeetingFormParams = { roomId?: string; date?: string };

/** Next 15-minute step from now on today, otherwise 09:00. */
function defaultStartTime(dateKey: string): string {
  const now = new Date();
  if (dateKey !== toDateKey(now)) return DEFAULT_START;
  const next = Math.ceil((now.getHours() * 60 + now.getMinutes() + 1) / SLOT_MINUTES) * SLOT_MINUTES;
  return timeOf(Math.min(Math.max(next, minutesOf(DEFAULT_START)), 23 * 60));
}

const EMPTY_LOCATION_FIELDS = {
  placeName: "",
  placeAddress: "",
  mapInput: "",
  placeId: undefined,
  meetingUrl: "",
  locationNote: "",
} satisfies Partial<MeetingFormValues>;

function locationFieldsOf(booking: BookingResponse): Pick<MeetingFormValues, keyof typeof EMPTY_LOCATION_FIELDS> {
  const location = booking.location;
  const type = getMeetingPlace(booking).type;
  const latitude = location?.latitude;
  const longitude = location?.longitude;
  // ROOM labels are the room's name, and an unnamed ONLINE call is labelled "Online meeting":
  // neither is something the organizer typed.
  const isTypedName = type === "EXTERNAL" || (type === "ONLINE" && location?.label !== ONLINE_DEFAULT_LABEL);
  return {
    placeName: isTypedName ? (location?.label ?? "") : "",
    placeAddress: location?.address ?? "",
    mapInput: latitude !== undefined && longitude !== undefined ? formatCoordinates({ latitude, longitude }) : "",
    placeId: location?.placeId,
    meetingUrl: location?.meetingUrl ?? "",
    locationNote: location?.note ?? "",
  };
}

function initialValues(params: MeetingFormParams, booking: BookingResponse | undefined): MeetingFormValues {
  if (booking) {
    return {
      title: booking.title,
      description: booking.description ?? "",
      date: booking.date,
      startTime: booking.startTime.slice(0, 5),
      endTime: booking.endTime.slice(0, 5),
      locationType: getMeetingPlace(booking).type,
      roomId: booking.room?.id ?? "",
      ...locationFieldsOf(booking),
      targets: targetsOfBooking(booking),
    };
  }
  const date = params.date ?? toDateKey(new Date());
  const startTime = defaultStartTime(date);
  return {
    title: "",
    description: "",
    date,
    startTime,
    endTime: addMinutesToTime(startTime, DEFAULT_DURATION_MINUTES),
    locationType: "ROOM",
    roomId: params.roomId ?? "",
    ...EMPTY_LOCATION_FIELDS,
    targets: EMPTY_TARGETS,
  };
}

/** Only the fields that belong to the chosen type are sent. */
function toLocationInput(values: MeetingFormValues): BookingLocationInput | undefined {
  const note = values.locationNote.trim() || undefined;
  switch (values.locationType) {
    case "ROOM":
      return note ? { note } : undefined;
    case "EXTERNAL": {
      const parsed = parseMapPin(values.mapInput);
      const pin = parsed.isValid ? parsed.pin : undefined;
      return {
        name: values.placeName.trim(),
        address: values.placeAddress.trim() || undefined,
        latitude: pin?.latitude,
        longitude: pin?.longitude,
        placeId: pin?.placeId ?? values.placeId,
        note,
      };
    }
    case "ONLINE":
      return {
        name: values.placeName.trim() || undefined,
        meetingUrl: normalizeMeetingUrl(values.meetingUrl),
        note,
      };
  }
}

function toRequest(values: MeetingFormValues): BookingRequest {
  return {
    locationType: values.locationType,
    roomId: values.locationType === "ROOM" ? values.roomId : undefined,
    location: toLocationInput(values),
    title: values.title.trim(),
    description: values.description.trim() || undefined,
    date: values.date,
    startTime: values.startTime,
    endTime: values.endTime,
    targets: values.targets,
  };
}

/**
 * New / edit meeting form: defaults, pickers, live server preview, and submit.
 * Pass `booking` to edit it; the caller loads it first so the form starts with its values.
 */
export function useMeetingForm(params: MeetingFormParams, booking?: BookingResponse) {
  const router = useRouter();
  const role = useAuthStore((state) => state.user?.role);
  const bookingId = booking?.id;
  const { data: currentUser } = useCurrentUser();
  const departmentTree = useDepartmentTree();
  const directory = useMemo(() => buildMemberDirectory(departmentTree.data), [departmentTree.data]);
  const rooms = useRooms();
  const createMutation = useCreateBooking();
  const updateMutation = useUpdateBooking();

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<MeetingFormValues>({
    resolver: zodResolver(meetingFormSchema),
    defaultValues: initialValues(params, booking),
  });

  const values = useWatch({ control }) as MeetingFormValues;
  const setField = useCallback(
    (name: "date" | "startTime" | "endTime" | "roomId", value: string) =>
      setValue(name, value, { shouldDirty: true, shouldValidate: true }),
    [setValue],
  );
  const setTargets = useCallback(
    (targets: BookingTargets) => setValue("targets", targets, { shouldDirty: true, shouldValidate: true }),
    [setValue],
  );
  const setLocationType = useCallback(
    (type: MeetingLocationType) => setValue("locationType", type, { shouldDirty: true }),
    [setValue],
  );
  /** A newly pasted pin replaces the stored place id (the old one would point somewhere else). */
  const setMapInput = useCallback(
    (input: string) => {
      const parsed = parseMapPin(input);
      setValue("mapInput", input, { shouldDirty: true });
      setValue("placeId", parsed.isValid ? parsed.pin.placeId : undefined);
    },
    [setValue],
  );
  const parsedPin = values.locationType === "EXTERNAL" && values.mapInput.trim() ? parseMapPin(values.mapInput) : null;
  const mapPin = parsedPin?.isValid ? { ...parsedPin.pin, placeId: parsedPin.pin.placeId ?? values.placeId } : null;

  // ---- Date & time pickers (shared with task scheduling) ----
  const handlePick = useCallback(
    (target: PickerTarget, picked: string) => {
      if (target === "startDate") {
        setField("date", picked);
        return;
      }
      const time = snapToSlot(picked);
      if (target === "startTime") {
        // Keep the meeting's length when the start moves.
        const { startTime, endTime } = getValues();
        const duration = Math.max(minutesOf(endTime) - minutesOf(startTime), SLOT_MINUTES);
        setField("startTime", time);
        setField("endTime", addMinutesToTime(time, duration));
      } else {
        setField("endTime", time);
      }
    },
    [getValues, setField],
  );
  const { openPicker, overlayProps } = useTaskSchedulePicker(
    { scheduleType: "both", startDate: values.date, startTime: values.startTime, endTime: values.endTime },
    handlePick,
  );

  // ---- Room availability for the chosen slot (room meetings only) ----
  const isRoomMeeting = values.locationType === "ROOM";
  const hasValidTime = Boolean(values.date && values.startTime && values.endTime && values.endTime > values.startTime);
  const availableRooms = useAvailableRooms(
    isRoomMeeting && hasValidTime ? { date: values.date, startTime: values.startTime, endTime: values.endTime } : null,
  );
  const ownRoomId = booking?.room?.id;
  const availableRoomIds = useMemo(() => {
    if (!availableRooms.data) return null;
    const ids = new Set(availableRooms.data.map((room) => room.id));
    // While editing, the booking's own slot shows its room as busy; it isn't, for this booking.
    if (ownRoomId) ids.add(ownRoomId);
    return ids;
  }, [availableRooms.data, ownRoomId]);
  const selectedRoom = rooms.data?.find((room) => room.id === values.roomId);

  // ---- Live server preview: attendee count, capacity (rooms), clashes, invite scope ----
  const previewRequest = useMemo<BookingPreviewRequest | null>(() => {
    if (!hasValidTime || (isRoomMeeting && !values.roomId)) return null;
    return {
      locationType: values.locationType,
      roomId: isRoomMeeting ? values.roomId : undefined,
      date: values.date,
      startTime: values.startTime,
      endTime: values.endTime,
      excludeBookingId: bookingId,
      targets: values.targets ?? EMPTY_TARGETS,
    };
  }, [
    values.locationType,
    values.roomId,
    values.date,
    values.startTime,
    values.endTime,
    values.targets,
    isRoomMeeting,
    hasValidTime,
    bookingId,
  ]);
  const debouncedPreviewRequest = useDebouncedValue(previewRequest, PREVIEW_DEBOUNCE_MS);
  const preview = useBookingPreview(debouncedPreviewRequest);
  const blockingReason = getBlockingReason(previewRequest ? preview.data : undefined);

  const submit = useCallback(() => {
    void handleSubmit(async (formValues) => {
      try {
        const request = toRequest(formValues);
        const saved = bookingId
          ? await updateMutation.mutateAsync({ id: bookingId, input: request })
          : await createMutation.mutateAsync(request);

        if (bookingId || !role) {
          router.back();
        } else {
          router.replace(getMeetingDetailPathForRole(role, saved.id));
        }
        const title = bookingId ? "Meeting updated" : "Meeting created";
        const warnings = saved.warnings?.length ? `\n\n${saved.warnings.join("\n")}` : "";
        const where = describeMeetingPlace(getMeetingPlace(saved));
        Alert.alert(title, `"${saved.title}" ${where}, ${saved.startTime}–${saved.endTime}.${warnings}`);
      } catch (error) {
        Alert.alert(bookingId ? "Couldn't update meeting" : "Couldn't create the meeting", getApiErrorMessage(error));
      }
    })();
  }, [handleSubmit, bookingId, updateMutation, createMutation, role, router]);

  return {
    isEdit: Boolean(booking),
    control,
    errors,
    values,
    isSubmitting,
    setTargets,
    setRoom: (roomId: string) => setField("roomId", roomId),
    setLocationType,
    setMapInput,
    mapPin,
    openPicker,
    pickerOverlay: overlayProps,
    organizer: booking?.organizer ?? currentUser,
    directory,
    isDirectoryLoading: departmentTree.isLoading,
    isDirectoryError: departmentTree.isError,
    rooms: rooms.data ?? [],
    isRoomsLoading: rooms.isLoading,
    availableRoomIds,
    selectedRoom,
    preview: previewRequest ? preview.data : undefined,
    isPreviewing: preview.isFetching,
    blockingReason,
    submit,
  };
}

/** Why the server would reject this booking, so the button can say so before trying. */
function getBlockingReason(preview: ReturnType<typeof useBookingPreview>["data"]): string | null {
  if (!preview) return null;
  if (preview.roomAvailable === false) return "The room is already booked at this time";
  if (preview.fitsRoom === false) {
    return `${preview.attendeeCount} attendees, but the room holds ${preview.roomCapacity}`;
  }
  if (preview.scopeViolations.length > 0) return "Some members are outside who you can invite";
  return null;
}
