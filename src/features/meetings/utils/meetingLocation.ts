import type Ionicons from "@expo/vector-icons/Ionicons";
import type { ComponentProps } from "react";
import { Linking } from "react-native";

import type { BookingResponse, MeetingLocationType } from "@/features/meetings/types/meeting.types";
import { toast } from "@/stores/toastStore";

type IconName = ComponentProps<typeof Ionicons>["name"];

export type MapPin = { latitude: number; longitude: number; placeId?: string };

export type MapPinParseResult = { isValid: true; pin: MapPin } | { isValid: false; reason: string };

export const LOCATION_TYPE_LABELS: Record<MeetingLocationType, string> = {
  ROOM: "Room",
  EXTERNAL: "Outside",
  ONLINE: "Online",
};

const LOCATION_TYPE_ICONS: Record<MeetingLocationType, IconName> = {
  ROOM: "business-outline",
  EXTERNAL: "location-outline",
  ONLINE: "videocam-outline",
};

const COORDINATE_DECIMALS = 6;
const NUMBER = String.raw`(-?\d{1,3}(?:\.\d+)?)`;
/** "11.556374, 104.928207", optionally in brackets: what Google Maps copies on a long-press. */
const RAW_COORDINATES = new RegExp(String.raw`^\(?\s*${NUMBER}\s*,\s*${NUMBER}\s*\)?$`);
/** The dropped pin itself inside a place link: ...!3d11.5563!4d104.9282... */
const PLACE_PIN = new RegExp(String.raw`!3d${NUMBER}!4d${NUMBER}`);
/** ?q=11.55,104.92 / ?query=... / ?ll=... / ?destination=... (comma may be URL-encoded). */
const QUERY_COORDINATES = new RegExp(
  String.raw`[?&](?:q|query|ll|destination|daddr|center)=${NUMBER}(?:,|%2C)\+?\s*${NUMBER}`,
  "i",
);
/** /@11.55,104.92,17z — the map view's centre; used only when nothing more exact is in the link. */
const VIEWPORT_CENTER = new RegExp(String.raw`@${NUMBER},${NUMBER}`);
const PLACE_ID = /[?&]query_place_id=([^&#\s]+)/i;
const SHORT_LINK = /(maps\.app\.goo\.gl|goo\.gl\/maps)\//i;
const HTTP_URL = /^https?:\/\/[^\s/?#.]+\.[^\s/?#]+\S*$/i;

function round(value: number): number {
  return Number(value.toFixed(COORDINATE_DECIMALS));
}

function toPin(latitudeText: string, longitudeText: string, placeId?: string): MapPinParseResult {
  const latitude = Number(latitudeText);
  const longitude = Number(longitudeText);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
    return { isValid: false, reason: "Those coordinates are outside the map. Check the numbers." };
  }
  return { isValid: true, pin: { latitude: round(latitude), longitude: round(longitude), placeId } };
}

/**
 * Reads a map pin from what the organizer pasted: plain coordinates, or a full Google Maps link.
 * Short share links (maps.app.goo.gl) only redirect, so they can't be read without opening them.
 */
export function parseMapPin(input: string): MapPinParseResult {
  const text = input.trim();
  if (!text) return { isValid: false, reason: "Paste a Google Maps link or the coordinates" };

  const raw = RAW_COORDINATES.exec(text);
  if (raw) return toPin(raw[1], raw[2]);

  const placeIdMatch = PLACE_ID.exec(text);
  const placeId = placeIdMatch ? decodeURIComponent(placeIdMatch[1]) : undefined;
  const match = PLACE_PIN.exec(text) ?? QUERY_COORDINATES.exec(text) ?? VIEWPORT_CENTER.exec(text);
  if (match) return toPin(match[1], match[2], placeId);

  if (SHORT_LINK.test(text)) {
    return {
      isValid: false,
      reason: "Short share links can't be read. In Google Maps, press and hold the place, then copy its coordinates.",
    };
  }
  return { isValid: false, reason: "No location found. Paste a full Google Maps link or coordinates like 11.5564, 104.9282" };
}

export function formatCoordinates(pin: Pick<MapPin, "latitude" | "longitude">): string {
  return `${pin.latitude.toFixed(COORDINATE_DECIMALS)}, ${pin.longitude.toFixed(COORDINATE_DECIMALS)}`;
}

/** Same link the server builds, so the organizer can check the pin before saving. */
export function buildMapUrl(pin: MapPin): string {
  const query = `${pin.latitude},${pin.longitude}`;
  const place = pin.placeId ? `&query_place_id=${encodeURIComponent(pin.placeId)}` : "";
  return `https://www.google.com/maps/search/?api=1&query=${query}${place}`;
}

/** Opens Google Maps searching for a place name (or just the map), to find it and copy its pin. */
export function buildMapSearchUrl(query: string): string {
  const trimmed = query.trim();
  return trimmed
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trimmed)}`
    : "https://www.google.com/maps";
}

/** "meet.google.com/abc" → "https://meet.google.com/abc"; anything with a scheme is left alone. */
export function normalizeMeetingUrl(url: string): string {
  const trimmed = url.trim();
  return /^[a-z][a-z0-9+.-]*:/i.test(trimmed) || !trimmed ? trimmed : `https://${trimmed}`;
}

export function isValidMeetingUrl(url: string): boolean {
  return HTTP_URL.test(normalizeMeetingUrl(url));
}

export type MeetingPlace = {
  type: MeetingLocationType;
  /** Short name for lists: room, place or call name. */
  label: string;
  icon: IconName;
};

/** Where a meeting is, with fallbacks for API builds from before location types existed. */
export function getMeetingPlace(meeting: Pick<BookingResponse, "locationType" | "room" | "location">): MeetingPlace {
  const type = meeting.location?.type ?? meeting.locationType ?? "ROOM";
  const label = meeting.location?.label ?? meeting.room?.name ?? LOCATION_TYPE_LABELS[type];
  return { type, label, icon: LOCATION_TYPE_ICONS[type] };
}

/** Opens a map or meeting link in its app (Google Maps, Zoom, ...) or the browser. */
export async function openLocationUrl(url: string): Promise<void> {
  // No canOpenURL pre-check, same as contact links: it returns false for undeclared schemes.
  try {
    await Linking.openURL(url);
  } catch {
    toast.error("Unavailable", "Couldn't open this link on your device.");
  }
}

/** "in Room A", "at ABC Company", "online" — reads after the meeting title. */
export function describeMeetingPlace(place: MeetingPlace): string {
  if (place.type === "ONLINE") return "online";
  return `${place.type === "ROOM" ? "in" : "at"} ${place.label}`;
}
