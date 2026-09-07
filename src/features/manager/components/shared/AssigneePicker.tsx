import { TouchableOpacity as BottomSheetTouchableOpacity } from "@gorhom/bottom-sheet";
import { Check, Plus, X } from "lucide-react-native";
import { useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  Platform,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { FullWindowOverlay } from "react-native-screens";

export type AssigneePickerOption = {
  id: string;
  name: string;
  avatar: string;
};

type AssigneePickerProps = {
  employees: readonly AssigneePickerOption[];
  value: string[];
  onChange: (ids: string[]) => void;
  error?: string;
  isLoading?: boolean;
  loadError?: string;
};

export function AssigneePicker({
  employees,
  value,
  onChange,
  error,
  isLoading,
  loadError,
}: AssigneePickerProps) {
  const [visible, setVisible] = useState(false);
  const [tempSelected, setTempSelected] = useState<string[]>([]);

  const openPicker = () => {
    setTempSelected(value);
    setVisible(true);
  };

  const toggleEmployee = (id: string) => {
    setTempSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const confirmSelection = () => {
    onChange(tempSelected);
    setVisible(false);
  };

  const removeAssignee = (id: string) => {
    onChange(value.filter((item) => item !== id));
  };

  const pickerContent = (
    <View className="flex-1 justify-end bg-black/45">
      <Pressable
        className="flex-1"
        onPress={() => setVisible(false)}
        accessibilityLabel="Close assignee picker"
      />
      <View className="rounded-t-3xl bg-white px-4 pb-8 pt-6">
        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-lg font-bold text-[#111827]">Select Team Members</Text>
          <TouchableOpacity onPress={() => setVisible(false)}>
            <X size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <Text className="py-6 text-center text-[13px] text-[#6B7280]">
            Loading team members…
          </Text>
        ) : loadError ? (
          <Text className="py-6 text-center text-[13px] text-[#EF4444]">
            {loadError}
          </Text>
        ) : employees.length === 0 ? (
          <Text className="py-6 text-center text-[13px] text-[#6B7280]">
            No department members found.
          </Text>
        ) : null}

        <FlatList
          data={employees}
          keyExtractor={(item) => item.id}
          style={{ maxHeight: 300 }}
          renderItem={({ item }) => {
            const isSelected = tempSelected.includes(item.id);
            return (
              <TouchableOpacity
                onPress={() => toggleEmployee(item.id)}
                className="flex-row items-center border-b border-[#F3F4F6] py-3"
              >
                <Image source={{ uri: item.avatar }} className="h-10 w-10 rounded-full" />
                <Text className="ml-3 flex-1 text-[15px] font-medium text-[#111827]">
                  {item.name}
                </Text>
                <View
                  className={`h-6 w-6 items-center justify-center rounded-full border ${
                    isSelected ? "border-[#32CD32] bg-[#32CD32]" : "border-[#D1D5DB]"
                  }`}
                >
                  {isSelected ? <Check size={14} color="white" /> : null}
                </View>
              </TouchableOpacity>
            );
          }}
        />

        <TouchableOpacity
          onPress={confirmSelection}
          className="mt-4 h-12 items-center justify-center rounded-xl bg-[#32CD32]"
        >
          <Text className="text-base font-semibold text-white">Confirm</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View>
      <View className="flex-row flex-wrap items-center gap-2">
        {value.map((id) => {
          const employee = employees.find((item) => item.id === id);
          if (!employee) return null;

          return (
            <View
              key={id}
              className="flex-row items-center rounded-full bg-[#F3F4F6] px-2 py-1"
            >
              <Image source={{ uri: employee.avatar }} className="h-6 w-6 rounded-full" />
              <Text className="ml-1 text-xs font-medium text-[#374151]">
                {employee.name}
              </Text>
              <Pressable onPress={() => removeAssignee(id)} className="ml-1" hitSlop={6}>
                <X size={14} color="#6B7280" />
              </Pressable>
            </View>
          );
        })}

        <BottomSheetTouchableOpacity
          onPress={openPicker}
          className="h-8 w-8 items-center justify-center rounded-full border border-dashed border-[#D1D5DB]"
          accessibilityRole="button"
          accessibilityLabel="Add assignee"
        >
          <Plus size={16} color="#6B7280" />
        </BottomSheetTouchableOpacity>
      </View>

      {error ? <Text className="mt-1 text-[12px] text-[#EF4444]">{error}</Text> : null}

      {visible ? (
        <Modal
          visible
          transparent
          animationType="fade"
          onRequestClose={() => setVisible(false)}
        >
          {Platform.OS === "ios" ? (
            <FullWindowOverlay>{pickerContent}</FullWindowOverlay>
          ) : (
            pickerContent
          )}
        </Modal>
      ) : null}
    </View>
  );
}
