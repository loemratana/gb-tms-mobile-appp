import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, Text, View } from "react-native";

import type { RoomFacility } from "@/features/meetings/types/meeting.types";
import { ROOM_FACILITY_META } from "@/features/meetings/utils/roomFacilities";
import { colors } from "@/styles";

const ALL_FACILITIES = Object.keys(ROOM_FACILITY_META) as RoomFacility[];

type FacilityPickerProps = {
  value: RoomFacility[];
  onToggle: (facility: RoomFacility) => void;
};

/** Toggle chips for the equipment a room has. */
export function FacilityPicker({ value, onToggle }: FacilityPickerProps) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {ALL_FACILITIES.map((facility) => {
        const isSelected = value.includes(facility);
        const meta = ROOM_FACILITY_META[facility];
        return (
          <Pressable
            key={facility}
            onPress={() => onToggle(facility)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: isSelected }}
            accessibilityLabel={meta.label}
            className={`flex-row items-center gap-1.5 rounded-full border px-3 py-2 ${
              isSelected ? "border-brand bg-brand-subtle" : "border-line bg-surface active:bg-field"
            }`}
          >
            <Ionicons name={meta.icon} size={15} color={isSelected ? colors.brandStrong : colors.textMuted} />
            <Text className={`text-caption ${isSelected ? "font-semibold text-brand-strong" : "font-medium text-fg-sub"}`}>
              {meta.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
