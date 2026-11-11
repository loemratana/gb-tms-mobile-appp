import type { RoomStatus } from "@/features/meetings/types/meeting.types";
import type { Tone } from "@/styles";

export const ROOM_STATUS_META: Record<RoomStatus, { label: string; tone: Tone; hint: string }> = {
  ACTIVE: { label: "Active", tone: "success", hint: "People can book it." },
  MAINTENANCE: { label: "Maintenance", tone: "warning", hint: "Temporarily not bookable; existing bookings stay." },
  INACTIVE: { label: "Inactive", tone: "neutral", hint: "Retired; hidden from booking." },
};

export const ROOM_STATUSES: RoomStatus[] = ["ACTIVE", "MAINTENANCE", "INACTIVE"];
