import { TouchableOpacity } from "@gorhom/bottom-sheet";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Text, View } from "react-native";

import { FormField } from "@/components/ui/FormField";
import type { PickerTarget } from "@/features/tasks/hooks/useTaskSchedulePicker";
import { colors } from "@/styles";

/** The task's dates, "YYYY-MM-DD". The API stores dates only — tasks have no times. */
export type TaskDateValues = {
  startDate: string;
  dueDate: string;
};

type TaskScheduleFieldsProps = {
  values: TaskDateValues;
  onOpenPicker: (target: PickerTarget) => void;
  errors?: { startDate?: string; dueDate?: string };
};

function formatDate(dateKey: string) {
  if (!dateKey) return "Pick a date";
  return new Date(`${dateKey}T12:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function DateFieldButton({
  label,
  value,
  hasError,
  onPress,
}: {
  label: string;
  value: string;
  hasError: boolean;
  onPress: () => void;
}) {
  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value}`}
        style={{
          minHeight: 48,
          flexDirection: "row",
          alignItems: "center",
          borderRadius: 12,
          borderWidth: 1,
          borderColor: hasError ? colors.danger : colors.border,
          backgroundColor: colors.inputBg,
          paddingHorizontal: 12,
        }}
      >
        <Ionicons name="calendar-outline" size={16} color={colors.textMuted} />
        <View style={{ marginLeft: 8, flex: 1, minWidth: 0 }}>
          <Text className="text-micro font-medium text-fg-faint">{label}</Text>
          <Text className="text-caption text-fg" numberOfLines={1}>
            {value}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

/** Start date → due date for a new task (the API's `startDate` / `dueDate`). */
export function TaskScheduleFields({ values, onOpenPicker, errors }: TaskScheduleFieldsProps) {
  // Both can be wrong at once (e.g. neither picked), so show both rather than only the first.
  const dateErrors = [errors?.startDate, errors?.dueDate].filter(Boolean).join(" · ");
  return (
    <FormField label="Dates" error={dateErrors || undefined}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <DateFieldButton
          label="Start"
          value={formatDate(values.startDate)}
          hasError={Boolean(errors?.startDate)}
          onPress={() => onOpenPicker("startDate")}
        />
        <Ionicons name="arrow-forward" size={16} color={colors.textSubtle} />
        <DateFieldButton
          label="Due"
          value={formatDate(values.dueDate)}
          hasError={Boolean(errors?.dueDate)}
          onPress={() => onOpenPicker("endDate")}
        />
      </View>
    </FormField>
  );
}
