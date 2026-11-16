import Ionicons from "@expo/vector-icons/Ionicons";
import { View } from "react-native";

import { colors } from "@/styles";

type StarRatingProps = {
  /** 0 to 5 in half steps. */
  value: number;
  size?: number;
};

/** Five stars, filled to `value` (half stars supported). */
export function StarRating({ value, size = 14 }: StarRatingProps) {
  return (
    <View
      className="flex-row items-center gap-0.5"
      accessible
      accessibilityRole="image"
      accessibilityLabel={`${value} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((position) => {
        const name = value >= position ? "star" : value >= position - 0.5 ? "star-half" : "star-outline";
        return (
          <Ionicons
            key={position}
            name={name}
            size={size}
            color={name === "star-outline" ? colors.textSubtle : colors.warning}
          />
        );
      })}
    </View>
  );
}
