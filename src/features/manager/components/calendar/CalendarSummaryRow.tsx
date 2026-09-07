import { Platform, Text, View } from "react-native";

import type { CalendarSummary } from "@/features/manager/components/calendar/calendarUtils";

const CARD_SHADOW = Platform.select({
  ios: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  android: { elevation: 1 },
});

type CalendarSummaryRowProps = {
  summary: CalendarSummary;
};

export function CalendarSummaryRow({ summary }: CalendarSummaryRowProps) {
  return (
    <View className="flex-row gap-2.5">
      <SummaryPill label="Events" value={summary.events} accent="#2563EB" />
      <SummaryPill label="Reviews" value={summary.reviews} accent="#F97316" />
      <SummaryPill label="Overdue" value={summary.overdue} accent="#EF4444" />
    </View>
  );
}

type SummaryPillProps = {
  label: string;
  value: number;
  accent: string;
};

function SummaryPill({ label, value, accent }: SummaryPillProps) {
  return (
    <View
      className="flex-1 rounded-2xl bg-[#F9FAFB] px-3 py-2.5"
      style={CARD_SHADOW}
    >
      <Text className="text-[20px] font-bold text-[#111827]">{value}</Text>
      <Text className="mt-0.5 text-[11px] font-medium text-[#6B7280]">{label}</Text>
      <View
        className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full"
        style={{ backgroundColor: accent, opacity: 0.5 }}
      />
    </View>
  );
}
