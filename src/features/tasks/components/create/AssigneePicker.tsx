import { TouchableOpacity as BottomSheetTouchableOpacity } from "@gorhom/bottom-sheet";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { Avatar } from "@/components/ui/Avatar";
import { PersonPickerSheet } from "@/features/tasks/components/shared/PersonPickerSheet";
import type { AssigneeOption } from "@/features/tasks/types/assignee.types";
import { colors } from "@/styles";

type AssigneePickerProps = {
  employees: readonly AssigneeOption[];
  value: string[];
  onChange: (ids: string[]) => void;
  error?: string;
  isLoading?: boolean;
  loadError?: string;
  /** Picker sheet title; depends on who the user may assign (team, department, everyone). */
  title?: string;
};

export function AssigneePicker({
  employees,
  value,
  onChange,
  error,
  isLoading,
  loadError,
  title = "Select team members",
}: AssigneePickerProps) {
  const [visible, setVisible] = useState(false);

  const confirmSelection = (ids: string[]) => {
    onChange(ids);
    setVisible(false);
  };

  const removeAssignee = (id: string) => {
    onChange(value.filter((item) => item !== id));
  };

  return (
    <View>
      <View className="flex-row flex-wrap items-center gap-2">
        {value.map((id) => {
          const employee = employees.find((item) => item.id === id);
          if (!employee) return null;

          return (
            <View
              key={id}
              className="flex-row items-center rounded-full bg-subtle px-2 py-1"
            >
              <Avatar name={employee.name} imageUrl={employee.avatar} size={24} />
              <Text className="ml-1 text-micro font-medium text-fg-sub">
                {employee.name}
              </Text>
              <Pressable onPress={() => removeAssignee(id)} className="ml-1" hitSlop={6}>
                <Ionicons name="close" size={14} color={colors.textMuted} />
              </Pressable>
            </View>
          );
        })}

        {/* Classes on the inner View: on Android this touchable is gesture-handler's, which
            NativeWind doesn't style. */}
        <BottomSheetTouchableOpacity
          onPress={() => setVisible(true)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Add assignee"
        >
          <View className="h-8 w-8 items-center justify-center rounded-full border border-dashed border-line-strong">
            <Ionicons name="add" size={16} color={colors.textMuted} />
          </View>
        </BottomSheetTouchableOpacity>
      </View>

      {error ? <Text className="mt-1 text-label text-error">{error}</Text> : null}

      <PersonPickerSheet
        visible={visible}
        title={title}
        onClose={() => setVisible(false)}
        people={employees}
        isLoading={isLoading}
        loadError={loadError}
        selectionMode="multiple"
        selectedIds={value}
        onConfirm={confirmSelection}
      />
    </View>
  );
}
