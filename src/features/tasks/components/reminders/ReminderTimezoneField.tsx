import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";

import { ModalSheet } from "@/components/ui/ModalSheet";
import { getTimezoneLabel, REMINDER_TIMEZONE_OPTIONS } from "@/features/tasks/utils/timezones";
import { colors, palette } from "@/styles";

type ReminderTimezoneFieldProps = {
  value: string;
  onChange: (value: string) => void;
  isDisabled?: boolean;
};

/** Timezone row that opens a picker of the supported reminder timezones. */
export function ReminderTimezoneField({ value, onChange, isDisabled = false }: ReminderTimezoneFieldProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => setIsOpen(true)}
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityLabel={`Timezone, ${getTimezoneLabel(value)}`}
        className="flex-row items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3 active:bg-field"
        style={{ opacity: isDisabled ? 0.45 : 1 }}
      >
        <View className="h-9 w-9 items-center justify-center rounded-lg bg-subtle">
          <Ionicons name="globe-outline" size={18} color={palette.gray[600]} />
        </View>
        <View className="min-w-0 flex-1">
          <Text className="text-label text-fg-faint">Timezone</Text>
          <Text className="text-body-sm font-semibold text-fg" numberOfLines={1}>
            {getTimezoneLabel(value)}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={palette.gray[400]} />
      </Pressable>

      <ModalSheet visible={isOpen} title="Timezone" onClose={() => setIsOpen(false)} isFlush maxHeight="70%">
        <FlatList
          data={REMINDER_TIMEZONE_OPTIONS}
          keyExtractor={(item) => item.value}
          renderItem={({ item }) => {
            const isSelected = item.value === value;
            return (
              <Pressable
                onPress={() => {
                  onChange(item.value);
                  setIsOpen(false);
                }}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
                className="flex-row items-center justify-between px-5 py-3.5 active:bg-field"
              >
                <Text className={`text-body-sm ${isSelected ? "font-semibold text-brand-strong" : "text-fg"}`}>
                  {item.label}
                </Text>
                {isSelected ? <Ionicons name="checkmark" size={18} color={colors.brand} /> : null}
              </Pressable>
            );
          }}
        />
      </ModalSheet>
    </>
  );
}
