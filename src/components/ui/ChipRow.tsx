import { ScrollView } from "react-native";

import { Chip } from "./Chip";

export type ChipOption<T extends string> = {
  key: T;
  label: string;
  color?: string;
  count?: number;
};

type ChipRowProps<T extends string> = {
  options: ChipOption<T>[];
  active: T;
  onChange: (key: T) => void;
  hasDots?: boolean;
  /** How the selected chip is rendered. Defaults to "soft". */
  selectedVariant?: "soft" | "solid";
};

/** Horizontally scrolling single-select row of filter chips. */
export function ChipRow<T extends string>({
  options,
  active,
  onChange,
  hasDots = false,
  selectedVariant = "soft",
}: ChipRowProps<T>) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
    >
      {options.map((option) => (
        <Chip
          key={option.key}
          label={option.label}
          color={option.color}
          hasDot={hasDots}
          count={option.count}
          isActive={active === option.key}
          selectedVariant={selectedVariant}
          onPress={() => onChange(option.key)}
        />
      ))}
    </ScrollView>
  );
}