import { CalendarDays, Menu } from "lucide-react-native";
import { Pressable, View } from "react-native";

import {
  CalendarViewToggle,
  type CalendarViewMode,
} from "@/features/manager/components/calendar/CalendarViewToggle";

type CalendarHeaderProps = {
  viewMode: CalendarViewMode;
  triggerLabel: string;
  onViewModeChange: (mode: CalendarViewMode) => void;
  onToday: () => void;
};

export function CalendarHeader({
  viewMode,
  triggerLabel,
  onViewModeChange,
  onToday,
}: CalendarHeaderProps) {
  return (
    <View className="flex-row items-center justify-between px-2 py-2">
      <View className="flex-row items-center gap-3">
        <Pressable
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Menu"
          className="h-10 w-10 items-center justify-center rounded-full"
        >
          <Menu size={22} color="#5F6368" strokeWidth={2.2} />
        </Pressable>

        <CalendarViewToggle triggerLabel={triggerLabel} value={viewMode} onChange={onViewModeChange} />
      </View>

      <Pressable
        onPress={onToday}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Go to today"
        className="h-10 w-10 items-center justify-center rounded-full"
      >
        <CalendarDays size={22} color="#5F6368" strokeWidth={2.2} />
      </Pressable>
    </View>
  );
}
