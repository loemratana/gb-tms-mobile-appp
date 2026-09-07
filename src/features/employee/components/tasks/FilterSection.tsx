import type { ReactNode } from "react";
import { Text, View } from "react-native";

import { colors } from "@/styles";

type FilterSectionProps = {
  title: string;
  children: ReactNode;
};

/** Typography-led section label — no card, no border, just spacing. */
export function FilterSection({ title, children }: FilterSectionProps) {
  return (
    <View className="mb-7">
      <Text
        className="mb-3 text-[13px] font-semibold uppercase tracking-wide"
        style={{ color: colors.textSubtle }}
      >
        {title}
      </Text>
      {children}
    </View>
  );
}
