import DateTimePicker, { type DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Platform } from "react-native";

import { ModalSheet } from "@/components/ui/ModalSheet";
import { colors, isDarkMode } from "@/styles";

type ReminderTimePickerProps = {
  /** Time being edited ("HH:mm"); undefined when adding a new one. */
  initialTime: string | undefined;
  onConfirm: (value: string) => void;
  onCancel: () => void;
};

export function toTimeValue(date: Date): string {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export function fromTimeValue(value: string): Date {
  const [hours, minutes] = value.split(":").map(Number);
  const date = new Date();
  date.setHours(hours || 0, minutes || 0, 0, 0);
  return date;
}

/** Native time picker: the system dialog on Android, a bottom spinner with Cancel / Done on iOS. Render only while open. */
export function ReminderTimePicker({ initialTime, onConfirm, onCancel }: ReminderTimePickerProps) {
  const [value, setValue] = useState(() => (initialTime ? fromTimeValue(initialTime) : new Date()));

  if (Platform.OS === "android") {
    return (
      <DateTimePicker
        value={value}
        mode="time"
        onChange={(event: DateTimePickerEvent, date?: Date) => {
          if (event.type === "set" && date) onConfirm(toTimeValue(date));
          else onCancel();
        }}
      />
    );
  }

  return (
    <ModalSheet visible title="Reminder time" onClose={onCancel} onConfirm={() => onConfirm(toTimeValue(value))}>
      <DateTimePicker
        value={value}
        mode="time"
        display="spinner"
        themeVariant={isDarkMode ? "dark" : "light"}
        textColor={colors.text}
        accentColor={colors.brand}
        onChange={(_event, date) => {
          if (date) setValue(date);
        }}
        style={{ height: 216, width: "100%" }}
      />
    </ModalSheet>
  );
}
