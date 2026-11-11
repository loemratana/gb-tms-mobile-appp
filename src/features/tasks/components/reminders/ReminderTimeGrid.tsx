import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, Text, View } from "react-native";

import { fromTimeValue } from "./ReminderTimePicker";
import { palette } from "@/styles";

const QUICK_TIMES = ["09:00", "12:00", "17:00"];

type ReminderTimeGridProps = {
  times: string[];
  maxTimes: number;
  canAddTime: boolean;
  isDisabled?: boolean;
  onEdit: (index: number) => void;
  onAdd: () => void;
  onQuickAdd: (value: string) => void;
  onRemove: (index: number) => void;
};

function splitTime(value: string): { clock: string; period: string } {
  const label = fromTimeValue(value).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const [clock, period = ""] = label.split(" ");
  return { clock, period };
}

/** Two-column grid of reminder times, an "Add time" tile, and one-tap common times. */
export function ReminderTimeGrid({
  times,
  maxTimes,
  canAddTime,
  isDisabled = false,
  onEdit,
  onAdd,
  onQuickAdd,
  onRemove,
}: ReminderTimeGridProps) {
  const quickTimes = canAddTime ? QUICK_TIMES.filter((time) => !times.includes(time)) : [];

  return (
    <View style={{ opacity: isDisabled ? 0.45 : 1 }} pointerEvents={isDisabled ? "none" : "auto"}>
      <View className="mb-2.5 flex-row items-center justify-between">
        <Text className="text-caption font-semibold text-fg-sub">Ring at</Text>
        <Text className="text-label text-fg-faint">
          {times.length}/{maxTimes} times
        </Text>
      </View>

      <View className="flex-row flex-wrap justify-between gap-y-2.5">
        {times.map((time, index) => {
          const { clock, period } = splitTime(time);
          return (
            <Pressable
              key={time}
              onPress={() => onEdit(index)}
              accessibilityRole="button"
              accessibilityLabel={`Reminder at ${clock} ${period}. Tap to change.`}
              className="h-[76px] w-[48.5%] justify-center rounded-2xl border border-line bg-surface px-4 active:bg-field"
            >
              <View className="flex-row items-baseline gap-1">
                <Text className="text-[26px] font-bold tracking-tight text-fg">{clock}</Text>
                <Text className="text-caption font-semibold text-fg-soft">{period}</Text>
              </View>
              <Text className="text-micro text-fg-faint">Every day</Text>
              <Pressable
                onPress={() => onRemove(index)}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel={`Remove ${clock} ${period} reminder`}
                className="absolute right-2.5 top-2.5 h-6 w-6 items-center justify-center rounded-full bg-subtle"
              >
                <Ionicons name="close" size={14} color={palette.gray[500]} />
              </Pressable>
            </Pressable>
          );
        })}

        {canAddTime ? (
          <Pressable
            onPress={onAdd}
            accessibilityRole="button"
            accessibilityLabel="Add reminder time"
            className="h-[76px] w-[48.5%] items-center justify-center gap-1 rounded-2xl border border-dashed border-brand-border bg-brand-subtle active:bg-brand-subtle"
          >
            <Ionicons name="add" size={22} color={palette.blue[600]} />
            <Text className="text-caption font-semibold text-brand-strong">Add time</Text>
          </Pressable>
        ) : null}
      </View>

      {quickTimes.length > 0 ? (
        <View className="mt-3 flex-row flex-wrap items-center gap-2">
          <Text className="text-label text-fg-faint">Quick add</Text>
          {quickTimes.map((time) => {
            const { clock, period } = splitTime(time);
            return (
              <Pressable
                key={time}
                onPress={() => onQuickAdd(time)}
                accessibilityRole="button"
                accessibilityLabel={`Add ${clock} ${period}`}
                className="rounded-full border border-line bg-surface px-3 py-1.5 active:bg-subtle"
              >
                <Text className="text-label font-semibold text-fg-sub">
                  {clock} {period}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}
