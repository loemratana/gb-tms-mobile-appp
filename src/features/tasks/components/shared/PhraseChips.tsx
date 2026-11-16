import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, ScrollView, Text, View } from "react-native";

import { colors, palette } from "@/styles";

type PhraseChipsProps = {
  phrases: readonly string[];
  onPick: (phrase: string) => void;
  /** Marks the chip whose text is currently chosen (e.g. the approve comment). */
  selectedPhrase?: string;
  isDisabled?: boolean;
};

/** A swipeable row of ready-made phrases; tapping one hands it to the form. */
export function PhraseChips({ phrases, onPick, selectedPhrase, isDisabled = false }: PhraseChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ gap: 8, paddingRight: 4 }}
    >
      {phrases.map((phrase) => {
        const isSelected = phrase === selectedPhrase;
        return (
          <Pressable
            key={phrase}
            onPress={() => onPick(phrase)}
            disabled={isDisabled}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected, disabled: isDisabled }}
            accessibilityLabel={phrase}
            className={`max-w-[260px] flex-row items-center gap-1.5 rounded-full px-3.5 py-2 ${
              isSelected ? "bg-brand" : "bg-brand-subtle active:opacity-70"
            } ${isDisabled ? "opacity-50" : ""}`}
          >
            <Ionicons
              name={isSelected ? "checkmark" : "add"}
              size={14}
              color={isSelected ? palette.white : colors.brandStrong}
            />
            <View className="shrink">
              {/* No fixed line height: Khmer stacks vowels and subscripts above and below the line. */}
              <Text
                className={`py-0.5 text-caption font-medium ${isSelected ? "text-white" : "text-brand-strong"}`}
                numberOfLines={1}
              >
                {phrase}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
