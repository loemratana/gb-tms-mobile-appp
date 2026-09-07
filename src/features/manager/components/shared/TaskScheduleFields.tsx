import { TouchableOpacity } from "@gorhom/bottom-sheet";
import { ArrowRight, Calendar, Clock } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import {
  SCHEDULE_OPTIONS,
  type ScheduleType,
} from "@/features/manager/components/create-task/taskFormSchema";
import { SheetField } from "@/features/manager/components/shared/sheetForm";
import type { PickerTarget } from "@/features/manager/components/shared/useTaskSchedulePicker";

export type ScheduleValues = {
  scheduleType: ScheduleType;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
};

type ScheduleFieldErrors = {
  scheduleType?: string;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
};

type TaskScheduleFieldsProps = {
  values: ScheduleValues;
  onChange: (values: ScheduleValues) => void;
  onOpenPicker: (target: PickerTarget) => void;
  errors?: ScheduleFieldErrors;
};

function formatDate(dateStr?: string) {
  if (!dateStr) return "Pick a date";
  return new Date(`${dateStr}T12:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(timeStr?: string) {
  if (!timeStr) return "Pick a time";
  const [h, m] = timeStr.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${hour12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

function ScheduleFieldButton({
  label,
  value,
  icon: Icon,
  onPress,
}: {
  label: string;
  value: string;
  icon: typeof Calendar;
  onPress: () => void;
}) {
  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={onPress}
        style={{
          minHeight: 48,
          flexDirection: "row",
          alignItems: "center",
          borderRadius: 12,
          borderWidth: 1,
          borderColor: "#E5E7EB",
          backgroundColor: "#F9FAFB",
          paddingHorizontal: 12,
        }}
      >
        <Icon size={16} color="#6B7280" />
        <View style={{ marginLeft: 8, flex: 1, minWidth: 0 }}>
          <Text style={{ fontSize: 10, fontWeight: "500", color: "#9CA3AF" }}>
            {label}
          </Text>
          <Text style={{ fontSize: 13, color: "#111827" }} numberOfLines={1}>
            {value}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

export function TaskScheduleFields({
  values,
  onChange,
  onOpenPicker,
  errors,
}: TaskScheduleFieldsProps) {
  const showDateFields =
    values.scheduleType === "date" || values.scheduleType === "both";
  const showTimeFields =
    values.scheduleType === "time" || values.scheduleType === "both";

  const handleScheduleTypeChange = (scheduleType: ScheduleType) => {
    const next = { ...values, scheduleType };
    if (scheduleType === "date") {
      next.startTime = "";
      next.endTime = "";
    }
    if (scheduleType === "time") {
      next.startDate = "";
      next.endDate = "";
    }
    onChange(next);
  };

  return (
    <>
      <SheetField label="Schedule type">
        <View className="flex-row flex-wrap items-center gap-5">
          {SCHEDULE_OPTIONS.map((option) => {
            const selected = values.scheduleType === option.id;
            return (
              <Pressable
                key={option.id}
                onPress={() => handleScheduleTypeChange(option.id)}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                className="flex-row items-center"
              >
                <View
                  className={`h-[18px] w-[18px] items-center justify-center rounded-full border-2 ${
                    selected ? "border-[#32CD32]" : "border-[#D1D5DB]"
                  }`}
                >
                  {selected ? (
                    <View className="h-2 w-2 rounded-full bg-[#32CD32]" />
                  ) : null}
                </View>
                <Text
                  className={`ml-2 text-[13px] font-medium ${
                    selected ? "text-[#111827]" : "text-[#6B7280]"
                  }`}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </SheetField>

      {showDateFields ? (
        <SheetField
          label="Date range"
          error={errors?.startDate ?? errors?.endDate}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <ScheduleFieldButton
              label="From"
              value={formatDate(values.startDate)}
              icon={Calendar}
              onPress={() => onOpenPicker("startDate")}
            />
            <ArrowRight size={16} color="#9CA3AF" />
            <ScheduleFieldButton
              label="To"
              value={formatDate(values.endDate)}
              icon={Calendar}
              onPress={() => onOpenPicker("endDate")}
            />
          </View>
        </SheetField>
      ) : null}

      {showTimeFields ? (
        <SheetField
          label="Time range"
          error={errors?.startTime ?? errors?.endTime}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <ScheduleFieldButton
              label="From"
              value={formatTime(values.startTime)}
              icon={Clock}
              onPress={() => onOpenPicker("startTime")}
            />
            <ArrowRight size={16} color="#9CA3AF" />
            <ScheduleFieldButton
              label="To"
              value={formatTime(values.endTime)}
              icon={Clock}
              onPress={() => onOpenPicker("endTime")}
            />
          </View>
        </SheetField>
      ) : null}
    </>
  );
}
