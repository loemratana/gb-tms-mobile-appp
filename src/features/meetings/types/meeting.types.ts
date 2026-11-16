/**
 * Mirrors the backend's meeting room booking API (/api/v1/rooms, /api/v1/bookings).
 * `date`, `startTime` and `endTime` are business-zone wall clock ("2026-11-12", "15:00");
 * `startAt` / `endAt` are the exact UTC instants.
 */

export type RoomStatus = "ACTIVE" | "MAINTENANCE" | "INACTIVE";

export type RoomFacility =
  | "PROJECTOR"
  | "TV"
  | "WHITEBOARD"
  | "VIDEO_CONFERENCE"
  | "SPEAKERPHONE"
  | "AIR_CONDITIONER";

export type RoomImage = {
  id: string;
  url: string;
  contentType: string;
  sizeBytes: number;
  sortOrder: number;
  cover: boolean;
};

export type RoomResponse = {
  id: string;
  name: string;
  code: string | null;
  location: string | null;
  description: string | null;
  /** Maximum people, organizer included. */
  capacity: number;
  status: RoomStatus;
  facilities: RoomFacility[];
  coverImageUrl: string | null;
  images: RoomImage[];
  createdAt: string;
  updatedAt: string;
  /** After an update: future bookings affected by a lower capacity or a non-ACTIVE status. */
  warnings?: string[];
};

/** Create or fully replace a room (admin, rooms:manage). */
export type RoomRequest = {
  name: string;
  code?: string;
  location?: string;
  description?: string;
  /** 1–500, organizer included. */
  capacity: number;
  status: RoomStatus;
  facilities: RoomFacility[];
};

/** A local photo picked for upload. */
export type RoomImageUpload = { uri: string; name: string; mimeType: string };

export type RoomSummary = {
  id: string;
  name: string;
  code: string | null;
  location: string | null;
  capacity: number;
  coverImageUrl: string | null;
};

export type RoomSearchParams = {
  search?: string;
  minCapacity?: number;
  facility?: RoomFacility;
  status?: RoomStatus;
  page?: number;
  size?: number;
};

export type AvailableRoomsParams = {
  date: string;
  startTime: string;
  endTime: string;
  minCapacity?: number;
};

/** GET /rooms/schedule. "HH:mm" in the business zone; a meeting crossing midnight is cut at 00:00 / 23:59. */
export type RoomBusySlot = {
  bookingId: string;
  title: string;
  organizerName: string;
  startTime: string;
  endTime: string;
};

export type RoomFreeSlot = { startTime: string; endTime: string };

export type RoomDaySchedule = {
  date: string;
  busy: RoomBusySlot[];
  /** Gaps within workdayStart-workdayEnd. */
  free: RoomFreeSlot[];
};

export type RoomCalendarResponse = {
  from: string;
  to: string;
  workdayStart: string;
  workdayEnd: string;
  rooms: { room: RoomSummary; status: RoomStatus; days: RoomDaySchedule[] }[];
};

export type RoomScheduleParams = {
  from: string;
  /** Inclusive; defaults to `from`. At most 31 days. */
  to?: string;
  /** One room (any status); otherwise every active room. */
  roomId?: string;
  minCapacity?: number;
};

export type BookingStatus = "CONFIRMED" | "CANCELLED";
export type BookingTimeStatus = "UPCOMING" | "IN_PROGRESS" | "COMPLETED";

/** ROOM = one of our rooms, EXTERNAL = a pinned place outside, ONLINE = a video call. */
export type MeetingLocationType = "ROOM" | "EXTERNAL" | "ONLINE";

/** Where a meeting is, for every type. `label` is always set; the rest depends on `type`. */
export type BookingLocation = {
  type: MeetingLocationType;
  /** Room name, place name, or the call's name ("Online meeting" by default). */
  label: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  placeId?: string;
  /** Google Maps link built by the server from the pin. */
  mapUrl?: string;
  meetingUrl?: string;
  note?: string;
};

/** What the organizer sends; fields that don't apply to the type are ignored by the server. */
export type BookingLocationInput = {
  name?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  placeId?: string;
  meetingUrl?: string;
  note?: string;
};

export type BookingRef = { id: string; name: string };

export type BookingPositionRef = {
  id: string;
  name: string;
  departmentId: string | null;
  departmentName: string | null;
};

export type BookingPerson = {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  departmentName: string | null;
  /** Absent from older API builds; null when the user has no phone number. */
  phoneNumber?: string | null;
};

export type BookingTargets = {
  departmentIds: string[];
  positionIds: string[];
  userIds: string[];
};

export type BookingResponse = {
  id: string;
  title: string;
  description: string | null;
  /** Absent from older API builds, which only had room meetings. */
  locationType?: MeetingLocationType;
  /** Only for ROOM meetings. */
  room?: RoomSummary | null;
  /** Absent from older API builds; use `getMeetingPlace` instead of reading it directly. */
  location?: BookingLocation;
  organizer: BookingPerson;
  date: string;
  startTime: string;
  endTime: string;
  startAt: string;
  endAt: string;
  durationMinutes: number;
  status: BookingStatus;
  timeStatus: BookingTimeStatus;
  /** Unique attendees, organizer included. */
  attendeeCount: number;
  targets: {
    departments: BookingRef[];
    positions: BookingPositionRef[];
    users: BookingPerson[];
  };
  /** Only on the detail endpoint. */
  attendees?: BookingPerson[];
  canEdit: boolean;
  cancelledAt?: string;
  cancelledBy?: BookingPerson;
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
  /** e.g. "2 attendee(s) already have another meeting at this time". */
  warnings?: string[];
};

export type BookingRequest = {
  locationType: MeetingLocationType;
  /** Required for ROOM. */
  roomId?: string;
  /** Required for EXTERNAL (name + pin) and ONLINE (meetingUrl). */
  location?: BookingLocationInput;
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  targets: BookingTargets;
};

export type BookingPreviewRequest = {
  /** Room capacity / availability checks and room suggestions only run for ROOM. */
  locationType?: MeetingLocationType;
  roomId?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  excludeBookingId?: string;
  targets: BookingTargets;
};

export type BookingPreviewResponse = {
  attendeeCount: number;
  roomCapacity?: number;
  fitsRoom?: boolean;
  roomAvailable?: boolean;
  attendeesWithConflicts?: number;
  scopeViolations: string[];
  suggestedRooms?: RoomSummary[];
};

export type BookingListParams = {
  from?: string;
  to?: string;
  locationType?: MeetingLocationType;
  roomId?: string;
  status?: BookingStatus;
  page?: number;
  size?: number;
  sort?: string;
};

// ---- Attendance ----

/** UNKNOWN = not checked in and not marked yet. */
export type AttendanceStatus = "PRESENT" | "LATE" | "ABSENT" | "EXCUSED" | "UNKNOWN";
export type CheckInMethod = "QR" | "ORGANIZER" | "AUTO";

export type AttendanceEntry = {
  user: BookingPerson;
  status: AttendanceStatus;
  organizer: boolean;
  checkedInAt?: string;
  method?: CheckInMethod;
  markedByName?: string;
  note?: string;
};

export type AttendanceResponse = {
  bookingId: string;
  /** The current user may change statuses now (organizer, within the marking window). */
  canMark: boolean;
  /** Attendees can scan the QR code now. */
  checkInOpen: boolean;
  checkInOpensAt: string;
  checkInClosesAt: string;
  finalizedAt?: string;
  counts: { present: number; late: number; absent: number; excused: number; unknown: number; total: number };
  attendees: AttendanceEntry[];
};

export type CheckInCodeResponse = {
  bookingId: string;
  title: string;
  /** Null unless the meeting is in one of our rooms. */
  roomName: string | null;
  /** Where the meeting is, for any location type. Absent from older API builds. */
  location?: string;
  startTime: string;
  endTime: string;
  /** Render as a QR code. */
  payload: string;
  expiresAt: string;
  refreshSeconds: number;
  checkedInCount: number;
  attendeeCount: number;
};

export type CheckInResult = {
  bookingId: string;
  title: string;
  /** Null unless the meeting is in one of our rooms. */
  roomName: string | null;
  /** Where the meeting is, for any location type. Absent from older API builds. */
  location?: string;
  status: "PRESENT" | "LATE";
  checkedInAt: string;
  alreadyCheckedIn: boolean;
};
