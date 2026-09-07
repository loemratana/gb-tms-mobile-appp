import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "@/styles";

type TimeOptionProps = {
  label: string;
  hint: string;
  active: boolean;
  isLast: boolean;
  onPress: () => void;
};

/** A single list row with a hairline separator and an open/filled radio dot — no per-row card. */
export function TimeOption({ label, hint, active, isLast, onPress }: TimeOptionProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ checked: active }}
      className="flex-row items-center justify-between py-3.5"
      style={!isLast ? styles.separator : undefined}
    >
      <View>
        <Text
          className="text-[15px] font-medium"
          style={{ color: active ? colors.primary : colors.text }}
        >
          {label}
        </Text>
        <Text className="mt-0.5 text-[12px]" style={{ color: colors.textMuted }}>
          {hint}
        </Text>
      </View>

      <View
        className="h-5 w-5 items-center justify-center rounded-full"
        style={{ borderWidth: 1.5, borderColor: active ? colors.primary : colors.border }}
      >
        {active ? (
          <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: colors.primary }} />
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  separator: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
});
