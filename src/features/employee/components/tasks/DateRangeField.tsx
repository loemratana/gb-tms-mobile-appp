import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, Text, View } from "react-native";

import { colors } from "@/styles";

type DateRangeFieldProps = {
  fromLabel: string;
  toLabel: string;
  fromSet: boolean;
  toSet: boolean;
  onPressFrom: () => void;
  onPressTo: () => void;
};

/** Two bordered date-input cards joined by an arrow connector. */
export function DateRangeField({
  fromLabel,
  toLabel,
  fromSet,
  toSet,
  onPressFrom,
  onPressTo,
}: DateRangeFieldProps) {
  return (
    <View className="flex-row items-center gap-2">
      <Pressable
        onPress={onPressFrom}
        className="flex-1 rounded-2xl border px-3.5 py-2.5"
        style={{
          borderColor: fromSet ? colors.primary : colors.border,
          backgroundColor: colors.card,
        }}
      >
        <Text
          className="text-[11px] font-medium uppercase tracking-wide"
          style={{ color: colors.textSubtle }}
        >
          From
        </Text>
        <Text
          className="mt-0.5 text-[15px] font-semibold"
          style={{ color: fromSet ? colors.text : colors.textMuted }}
        >
          {fromLabel}
        </Text>
      </Pressable>

      <Ionicons name="arrow-forward" size={14} color={colors.textSubtle} />

      <Pressable
        onPress={onPressTo}
        className="flex-1 items-end rounded-2xl border px-3.5 py-2.5"
        style={{
          borderColor: toSet ? colors.primary : colors.border,
          backgroundColor: colors.card,
        }}
      >
        <Text
          className="text-[11px] font-medium uppercase tracking-wide"
          style={{ color: colors.textSubtle }}
        >
          To
        </Text>
        <Text
          className="mt-0.5 text-[15px] font-semibold"
          style={{ color: toSet ? colors.text : colors.textMuted }}
        >
          {toLabel}
        </Text>
      </Pressable>
    </View>
  );
}
