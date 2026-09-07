import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, Text, View } from "react-native";

import type { SettingsItem } from "@/features/employee/data/profile";

type SettingsMenuProps = {
  items: SettingsItem[];
  onPressItem?: (item: SettingsItem) => void;
};

export function SettingsMenu({ items, onPressItem }: SettingsMenuProps) {
  return (
    <View>
      <Text className="mb-3 text-[13px] font-semibold uppercase tracking-[1px] text-[#9CA3AF]">
        Settings
      </Text>

      <View
        className="overflow-hidden rounded-3xl bg-white"
        style={{
          shadowColor: "#0F172A",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.06,
          shadowRadius: 16,
          elevation: 3,
        }}
      >
        {items.map((item, index) => {
          const isDanger = Boolean(item.danger);

          return (
            <Pressable
              key={item.id}
              onPress={() => onPressItem?.(item)}
              accessibilityRole="button"
              className={`flex-row items-center px-4 py-3.5 ${
                index < items.length - 1 ? "border-b border-[#F3F4F6]" : ""
              }`}
            >
              <View
                className={`mr-3 h-10 w-10 items-center justify-center rounded-2xl ${
                  isDanger ? "bg-[#EF4444]" : "bg-[#2563EB]"
                }`}
              >
                <Ionicons
                  name={item.icon}
                  size={18}
                  color="#FFFFFF"
                />
              </View>

              <Text
                className={`flex-1 text-[15px] font-medium ${
                  isDanger ? "text-[#EF4444]" : "text-[#111827]"
                }`}
              >
                {item.label}
              </Text>

              {!isDanger ? (
                <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
