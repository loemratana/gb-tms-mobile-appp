import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, Text, View } from "react-native";

import { ModalSheet } from "@/components/ui/ModalSheet";
import { colors } from "@/styles";

export type PickerOption<T extends string> = {
  value: T;
  label: string;
  description?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  /** Keeps the icon this colour even when unselected, e.g. a priority's flag colour. */
  iconColor?: string;
};

type OptionPickerSheetProps<T extends string> = {
  visible: boolean;
  title: string;
  options: readonly PickerOption<T>[];
  value: T | undefined;
  onSelect: (value: T) => void;
  onClose: () => void;
};

/** The list behind a select dropdown: a few fixed choices, each with an optional icon and hint. */
export function OptionPickerSheet<T extends string>({
  visible,
  title,
  options,
  value,
  onSelect,
  onClose,
}: OptionPickerSheetProps<T>) {
  return (
    <ModalSheet visible={visible} title={title} onClose={onClose}>
      <View accessibilityRole="radiogroup">
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={option.value}
              onPress={() => onSelect(option.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={option.label}
              accessibilityHint={option.description}
              className="flex-row items-center gap-3 border-b border-line-soft py-3 active:bg-field"
            >
              {option.icon ? (
                <View
                  className={`h-10 w-10 items-center justify-center rounded-full ${
                    selected ? "bg-brand-subtle" : "bg-subtle"
                  }`}
                >
                  <Ionicons
                    name={option.icon}
                    size={20}
                    color={option.iconColor ?? (selected ? colors.brand : colors.textMuted)}
                  />
                </View>
              ) : null}
              <View className="min-w-0 flex-1">
                <Text className={`text-body font-medium ${selected ? "text-brand-strong" : "text-fg"}`}>
                  {option.label}
                </Text>
                {option.description ? (
                  <Text className="mt-0.5 text-label leading-[17px] text-fg-soft">{option.description}</Text>
                ) : null}
              </View>
              {selected ? <Ionicons name="checkmark" size={20} color={colors.brand} /> : null}
            </Pressable>
          );
        })}
      </View>
    </ModalSheet>
  );
}
