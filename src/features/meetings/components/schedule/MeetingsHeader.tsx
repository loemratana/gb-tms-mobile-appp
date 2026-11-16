import type { ReactNode } from "react";

import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { IconButton } from "@/components/ui/IconButton";
import { SegmentedControl, type SegmentOption } from "@/components/ui/SegmentedControl";

export type MeetingsView = "schedule" | "rooms";

const VIEW_OPTIONS: SegmentOption<MeetingsView>[] = [
  { value: "schedule", label: "Schedule" },
  { value: "rooms", label: "Rooms" },
];

type MeetingsHeaderProps = {
  view: MeetingsView;
  onChangeView: (view: MeetingsView) => void;
  /** One line under the title, e.g. "Today". */
  subtitle?: string;
  title: string;
  onPressCalendar?: () => void;
  /** Extra rows under the switch, e.g. the week strip. */
  children?: ReactNode;
};

/** Meetings tab header: day title, a date-picker button, and the Schedule / Rooms switch. */
export function MeetingsHeader({ view, onChangeView, subtitle, title, onPressCalendar, children }: MeetingsHeaderProps) {
  return (
    <ScreenHeader
      title={title}
      subtitle={subtitle}
      actions={
        onPressCalendar ? (
          <IconButton icon="calendar-outline" variant="subtle" accessibilityLabel="Pick a date" onPress={onPressCalendar} />
        ) : undefined
      }
    >
      <SegmentedControl options={VIEW_OPTIONS} value={view} onChange={onChangeView} />
      {children}
    </ScreenHeader>
  );
}
