import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Calendar } from "lucide-react-native";
import { useState } from "react";
import { Modal, Platform, Pressable, Text, View } from "react-native";

type DateSelectorProps = {
  label: string;
  value?: string;
  onChange: (date: string) => void;
  minimumDate?: Date;
  error?: string;
};

function formatDisplay(dateStr?: string) {
  if (!dateStr) return "Pick a date";
  const date = new Date(`${dateStr}T12:00:00`);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function parseDate(dateStr?: string) {
  return dateStr ? new Date(`${dateStr}T12:00:00`) : new Date();
}

export function DateSelector({
  label,
  value,
  onChange,
  minimumDate,
  error,
}: DateSelectorProps) {
  const [visible, setVisible] = useState(false);
  const [pickerDate, setPickerDate] = useState(parseDate(value));

  const confirm = (date: Date) => {
    onChange(date.toISOString().split("T")[0]);
    setVisible(false);
  };

  const handleChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === "android") {
      if (event.type === "set" && date) confirm(date);
      else setVisible(false);
      return;
    }
    if (date) setPickerDate(date);
  };

  return (
    <View className="flex-1">
      <Pressable
        onPress={() => {
          setPickerDate(parseDate(value));
          setVisible(true);
        }}
        accessibilityRole="button"
        accessibilityLabel={`${label}, ${formatDisplay(value)}`}
        className="h-12 flex-row items-center rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-3"
      >
        <Calendar size={16} color="#6B7280" />
        <View className="ml-2 min-w-0 flex-1">
          <Text className="text-[10px] font-medium text-[#9CA3AF]">{label}</Text>
          <Text className="text-[13px] text-[#111827]" numberOfLines={1}>
            {formatDisplay(value)}
          </Text>
        </View>
      </Pressable>
      {error ? <Text className="mt-1 text-[12px] text-[#EF4444]">{error}</Text> : null}

      {visible && Platform.OS === "android" ? (
        <DateTimePicker
          value={pickerDate}
          mode="date"
          minimumDate={minimumDate}
          onChange={handleChange}
        />
      ) : null}

      {visible && Platform.OS === "ios" ? (
        <Modal transparent animationType="slide" visible>
          <View className="flex-1 justify-end bg-black/40">
            <View className="rounded-t-3xl bg-white px-4 pb-8 pt-4">
              <View className="mb-2 flex-row items-center justify-between">
                <Pressable onPress={() => setVisible(false)}>
                  <Text className="text-[16px] text-[#6B7280]">Cancel</Text>
                </Pressable>
                <Text className="text-[16px] font-semibold text-[#111827]">{label}</Text>
                <Pressable onPress={() => confirm(pickerDate)}>
                  <Text className="text-[16px] font-semibold text-[#32CD32]">Done</Text>
                </Pressable>
              </View>
              <DateTimePicker
                value={pickerDate}
                mode="date"
                display="spinner"
                minimumDate={minimumDate}
                onChange={handleChange}
              />
            </View>
          </View>
        </Modal>
      ) : null}
    </View>
  );
}
