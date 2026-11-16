import { z } from "zod";

import { isValidMeetingUrl, parseMapPin } from "@/features/meetings/utils/meetingLocation";

const TIME_PATTERN = /^\d{2}:\d{2}$/;

/** Start of the meeting in local time, from "YYYY-MM-DD" + "HH:mm". */
function startOf(date: string, startTime: string): Date {
  const [year, month, day] = date.split("-").map(Number);
  const [hours, minutes] = startTime.split(":").map(Number);
  return new Date(year, month - 1, day, hours, minutes);
}

/** The slot an existing booking already has; keeping it unchanged is allowed even once it has started. */
export type MeetingSlot = { date: string; startTime: string };

const meetingFormObject = z.object({
  title: z.string().trim().min(1, "Name of meeting is required").max(200, "Keep the name under 200 characters"),
  description: z.string().trim().max(5000, "Description is too long"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date"),
  startTime: z.string().regex(TIME_PATTERN, "Pick a start time"),
  endTime: z.string().regex(TIME_PATTERN, "Pick an end time"),
  locationType: z.enum(["ROOM", "EXTERNAL", "ONLINE"]),
  roomId: z.string(),
  /** EXTERNAL: the place's name. ONLINE: optional call name, e.g. "Zoom". */
  placeName: z.string().trim().max(200, "Keep the name under 200 characters"),
  placeAddress: z.string().trim().max(500, "Address is too long"),
  /** EXTERNAL: a pasted Google Maps link or "lat, lng". */
  mapInput: z.string(),
  /** Kept from an existing booking until the organizer pastes a different pin. */
  placeId: z.string().optional(),
  meetingUrl: z.string().trim().max(1000, "Link is too long"),
  locationNote: z.string().trim().max(500, "Note is too long"),
  targets: z.object({
    departmentIds: z.array(z.string()),
    positionIds: z.array(z.string()),
    userIds: z.array(z.string()),
  }),
});

/**
 * Form rules. The server refuses a meeting that starts in the past, both new and rescheduled, so
 * that is checked here too — except when editing and the original slot is left as it was.
 */
export function createMeetingFormSchema(originalSlot?: MeetingSlot) {
  return meetingFormObject.superRefine((values, context) => {
    const isOriginalSlot =
      originalSlot?.date === values.date && originalSlot?.startTime === values.startTime;
    if (
      !isOriginalSlot &&
      TIME_PATTERN.test(values.startTime) &&
      startOf(values.date, values.startTime).getTime() <= Date.now()
    ) {
      context.addIssue({ code: "custom", message: "This time has already passed", path: ["startTime"] });
    }
    if (values.endTime <= values.startTime) {
      context.addIssue({ code: "custom", message: "End time must be after start time", path: ["endTime"] });
    }
    if (values.locationType === "ROOM" && !values.roomId) {
      context.addIssue({ code: "custom", message: "Pick a room", path: ["roomId"] });
    }
    if (values.locationType === "EXTERNAL") {
      if (!values.placeName) {
        context.addIssue({ code: "custom", message: "Name the place", path: ["placeName"] });
      }
      const pin = parseMapPin(values.mapInput);
      if (!pin.isValid) {
        context.addIssue({ code: "custom", message: pin.reason, path: ["mapInput"] });
      }
    }
    if (values.locationType === "ONLINE" && !isValidMeetingUrl(values.meetingUrl)) {
      context.addIssue({
        code: "custom",
        message: values.meetingUrl ? "Enter a full link, e.g. https://meet.google.com/abc-defg-hij" : "Add the meeting link",
        path: ["meetingUrl"],
      });
    }
  });
}

export type MeetingFormValues = z.infer<typeof meetingFormObject>;
