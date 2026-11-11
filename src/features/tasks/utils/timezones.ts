export type TimezoneOption = {
  value: string;
  label: string;
};

/**
 * Curated list rather than the full IANA database — no timezone picker/library
 * exists anywhere in this app yet, and the backend defaults every task to
 * Asia/Phnom_Penh, so this covers the common cases without a new dependency.
 */
export const REMINDER_TIMEZONE_OPTIONS: TimezoneOption[] = [
  { value: "Asia/Phnom_Penh", label: "Phnom Penh (ICT, UTC+7)" },
  { value: "Asia/Bangkok", label: "Bangkok (ICT, UTC+7)" },
  { value: "Asia/Ho_Chi_Minh", label: "Ho Chi Minh City (ICT, UTC+7)" },
  { value: "Asia/Singapore", label: "Singapore (SGT, UTC+8)" },
  { value: "Asia/Shanghai", label: "Shanghai (CST, UTC+8)" },
  { value: "Asia/Hong_Kong", label: "Hong Kong (HKT, UTC+8)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST, UTC+9)" },
  { value: "Asia/Seoul", label: "Seoul (KST, UTC+9)" },
  { value: "Asia/Kolkata", label: "Mumbai / New Delhi (IST, UTC+5:30)" },
  { value: "Asia/Dubai", label: "Dubai (GST, UTC+4)" },
  { value: "Europe/London", label: "London (GMT/BST)" },
  { value: "America/New_York", label: "New York (ET)" },
  { value: "UTC", label: "UTC" },
];

export const DEFAULT_REMINDER_TIMEZONE = "Asia/Phnom_Penh";

export function getTimezoneLabel(value: string): string {
  return (
    REMINDER_TIMEZONE_OPTIONS.find((option) => option.value === value)?.label ?? value
  );
}
