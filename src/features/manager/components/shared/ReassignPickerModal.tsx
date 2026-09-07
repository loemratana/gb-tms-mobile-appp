import { X } from "lucide-react-native";
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

import type { AssigneePickerOption } from "@/features/manager/components/shared/AssigneePicker";

type ReassignPickerModalProps = {
  visible: boolean;
  onClose: () => void;
  employees: readonly AssigneePickerOption[];
  onSelect: (id: string) => void;
  isLoading?: boolean;
};

/**
 * Single-select member picker for reassigning a task — a scrollable sheet, not a
 * native Alert.alert. A department can have dozens of members, and Alert.alert
 * only renders a handful of buttons reliably (Android caps at 3), so a long
 * roster made the old picker unusable: taps on names past the visible slots
 * never registered, and the reassignment silently never happened.
 */
export function ReassignPickerModal({
  visible,
  onClose,
  employees,
  onSelect,
  isLoading = false,
}: ReassignPickerModalProps) {
  const content = (
    <View className="flex-1 justify-end bg-black/45">
      <Pressable
        className="flex-1"
        onPress={onClose}
        accessibilityLabel="Close reassign picker"
      />
      <View className="rounded-t-3xl bg-white px-4 pb-8 pt-6">
        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-lg font-bold text-[#111827]">Reassign to</Text>
          <TouchableOpacity onPress={onClose} accessibilityLabel="Close">
            <X size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <Text className="py-6 text-center text-[13px] text-[#6B7280]">
            Loading team members…
          </Text>
        ) : employees.length === 0 ? (
          <Text className="py-6 text-center text-[13px] text-[#6B7280]">
            No department members found.
          </Text>
        ) : (
          <FlatList
            data={employees}
            keyExtractor={(item) => item.id}
            style={{ maxHeight: 360 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => onSelect(item.id)}
                accessibilityRole="button"
                accessibilityLabel={`Reassign to ${item.name}`}
                className="flex-row items-center border-b border-[#F3F4F6] py-3"
              >
                <Image source={{ uri: item.avatar }} className="h-10 w-10 rounded-full" />
                <Text className="ml-3 flex-1 text-[15px] font-medium text-[#111827]">
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      {Platform.OS === "ios" ? (
        <FullWindowOverlay>{content}</FullWindowOverlay>
      ) : (
        content
      )}
    </Modal>
  );
}
