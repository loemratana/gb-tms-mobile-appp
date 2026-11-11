import type { ReactNode } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { IconButton } from "@/components/ui/IconButton";
import { SegmentedControl, type SegmentOption } from "@/components/ui/SegmentedControl";
import { HeaderNotificationButton } from "@/components/layout/Header";
import { useNotificationSheet } from "@/features/notifications/components/NotificationSheetProvider";

export type MeetingsView = "schedule" | "rooms";

const VIEW_OPTIONS: SegmentOption<MeetingsView>[] = [
  { value: "schedule", label: "Schedule" },
  { value: "rooms", label: "Rooms" },
];

type MeetingsHeaderProps = {
  view: MeetingsView;
  onChangeView: (view: MeetingsView) => void;
  /** Small label above the title, e.g. "TODAY". */
  eyebrow?: string;
  title: string;
  onPressCalendar?: () => void;
  /** Extra rows under the switch (month chips, week strip). */
  children?: ReactNode;
};

/** Meetings tab header: big day title, calendar + notifications, and the Schedule / Rooms switch. */
export function MeetingsHeader({ view, onChangeView, eyebrow, title, onPressCalendar, children }: MeetingsHeaderProps) {
  const { open: openNotifications } = useNotificationSheet();

  return (
    <SafeAreaView edges={["top"]} className="border-b border-line bg-surface">
      <View className="px-4 pb-3 pt-2">
        <View className="min-h-[44px] flex-row items-end justify-between gap-3">
          <View className="min-w-0 flex-1">
            {eyebrow ? (
              <Text className="text-label font-semibold uppercase tracking-wide text-brand">{eyebrow}</Text>
            ) : null}
            <Text className="text-display font-bold tracking-tight text-fg" accessibilityRole="header" numberOfLines={1}>
              {title}
            </Text>
          </View>
          <View className="flex-row items-center gap-1">
            {onPressCalendar ? (
              <IconButton icon="calendar-outline" variant="subtle" accessibilityLabel="Pick a date" onPress={onPressCalendar} />
            ) : null}
            <HeaderNotificationButton onPress={openNotifications} />
          </View>
        </View>
        <View className="mt-3">
          <SegmentedControl options={VIEW_OPTIONS} value={view} onChange={onChangeView} />
        </View>
        {children}
      </View>
    </SafeAreaView>
  );
}
