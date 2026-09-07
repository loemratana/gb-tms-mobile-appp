import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { SymbolView } from "expo-symbols";
import { useCallback } from "react";
import { Alert, Platform, Pressable, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { colors } from "@/styles";

const springConfig = { damping: 14, stiffness: 280, mass: 0.4 };
const RING_WIDTH = 3;

type FloatingActionButtonProps = {
  onPress: () => void;
  onLongPress?: () => void;
  size?: number;
  color?: string;
};

function FabIcon() {
  if (Platform.OS === "ios") {
    return (
      <SymbolView
        name="plus"
        size={26}
        tintColor="#FFFFFF"
        weight="semibold"
        fallback={<MaterialCommunityIcons name="plus" size={26} color="#FFFFFF" />}
      />
    );
  }

  return <MaterialCommunityIcons name="plus" size={26} color="#FFFFFF" />;
}

export function FloatingActionButton({
  onPress,
  onLongPress,
  size = 52,
  color = colors.brand,
}: FloatingActionButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.92, springConfig);
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, springConfig);
  }, [scale]);

  const handleLongPress = useCallback(() => {
    if (onLongPress) {
      onLongPress();
      return;
    }

    Alert.alert("Quick Actions", "Choose an action", [
      { text: "Create Task", onPress },
      {
        text: "Create from Template",
        onPress: () => Alert.alert("Templates", "Coming soon."),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  }, [onLongPress, onPress]);

  return (
    <Animated.View
      style={[
        animatedStyle,
        Platform.select({
          ios: {
            shadowColor: color,
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.35,
            shadowRadius: 16,
          },
          android: { elevation: 8 },
        }),
      ]}
      className="z-20"
    >
      <Pressable
        onPress={onPress}
        onLongPress={handleLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        delayLongPress={350}
        accessibilityRole="button"
        accessibilityLabel="Create new task or project"
        className="items-center"
      >
        <View
          className="items-center justify-center rounded-full border-white"
          style={{
            height: size,
            width: size,
            backgroundColor: color,
            borderWidth: RING_WIDTH,
          }}
        >
          <FabIcon />
        </View>
      </Pressable>
    </Animated.View>
  );
}
