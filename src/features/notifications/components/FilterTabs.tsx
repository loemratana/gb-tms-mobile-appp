import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { View } from "react-native";

import { Chip } from "@/components/ui/Chip";
import type { NotificationFilter } from "@/features/notifications/types/notification.types";
import { palette } from "@/styles";

const TABS: { key: NotificationFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "tasks", label: "Tasks" },
  { key: "comments", label: "Comments" },
  { key: "updates", label: "Updates" },
];

type FilterTabsProps = {
  active: NotificationFilter;
  onChange: (filter: NotificationFilter) => void;
  counts?: Partial<Record<NotificationFilter, number>>;
};

/** Horizontally scrolling filter chips, built on the shared {@link Chip}. */
export function FilterTabs({ active, onChange, counts }: FilterTabsProps) {
  return (
    <View className="border-b border-line-soft bg-surface py-2.5">
      <BottomSheetScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
      >
        {TABS.map((tab) => (
          <Chip
            key={tab.key}
            label={tab.label}
            color={palette.gray[900]}
            count={counts?.[tab.key] || undefined}
            isActive={active === tab.key}
            onPress={() => onChange(tab.key)}
          />
        ))}
      </BottomSheetScrollView>
    </View>
  );
}
