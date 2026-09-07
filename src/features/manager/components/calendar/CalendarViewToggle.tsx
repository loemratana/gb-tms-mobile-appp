import { Check, ChevronDown } from "lucide-react-native";
import { useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";

export type CalendarViewMode = "schedule" | "day" | "week" | "month";

const MODES: { key: CalendarViewMode; label: string }[] = [
  { key: "schedule", label: "Schedule" },
  { key: "day", label: "Day" },
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
];

type CalendarViewToggleProps = {
  /** The label shown on the trigger — the current month/period, not the mode name (matches Google Calendar). */
  triggerLabel: string;
  value: CalendarViewMode;
  onChange: (mode: CalendarViewMode) => void;
};

export function CalendarViewToggle({
  triggerLabel,
  value,
  onChange,
}: CalendarViewToggleProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => setIsOpen(true)}
        accessibilityRole="button"
        accessibilityLabel="Switch calendar view"
        className="flex-row items-center gap-1"
      >
        <Text className="text-[20px] font-medium text-[#3C4043]">{triggerLabel}</Text>
        <ChevronDown size={20} color="#5F6368" strokeWidth={2.4} />
      </Pressable>

      <Modal visible={isOpen} transparent animationType="fade" onRequestClose={() => setIsOpen(false)}>
        <Pressable className="flex-1 bg-black/20" onPress={() => setIsOpen(false)}>
          <View className="ml-4 mt-16 w-48 rounded-lg bg-white py-1" style={SHADOW}>
            {MODES.map((mode) => {
              const active = mode.key === value;
              return (
                <Pressable
                  key={mode.key}
                  onPress={() => {
                    setIsOpen(false);
                    onChange(mode.key);
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  className="flex-row items-center justify-between px-4 py-3"
                >
                  <Text
                    className={`text-[15px] ${active ? "font-semibold text-[#111827]" : "text-[#3C4043]"}`}
                  >
                    {mode.label}
                  </Text>
                  {active ? <Check size={16} color="#32CD32" strokeWidth={2.6} /> : null}
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const SHADOW = {
  shadowColor: "#0F172A",
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.15,
  shadowRadius: 16,
  elevation: 8,
};
