import type { ReactNode } from "react";
import { Platform, View, type ViewProps } from "react-native";

import { cardShadow, colors } from "@/constants/theme";

type CardProps = ViewProps & {
  children: ReactNode;
  padded?: boolean;
};

export function Card({ children, padded = true, style, ...props }: CardProps) {
  return (
    <View
      {...props}
      style={[
        {
          backgroundColor: colors.card,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: colors.border,
          padding: padded ? 16 : 0,
        },
        Platform.select(cardShadow),
        style,
      ]}
    >
      {children}
    </View>
  );
}
