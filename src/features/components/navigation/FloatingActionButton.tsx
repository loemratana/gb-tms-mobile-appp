import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { SymbolView } from "expo-symbols";
import { useCallback, useRef } from "react";
import { Alert, Platform, useWindowDimensions, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { colors } from "@/styles";

const springConfig = { damping: 14, stiffness: 280, mass: 0.4 };
const RING_WIDTH = 3;
/** Minimum gap kept between the button and the screen edge while dragging. */
const EDGE_MARGIN = 8;

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
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const containerRef = useRef<Animated.View>(null);

  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  // The button's own on-screen origin, measured once on first layout — needed so
  // dragging can be clamped to the actual window bounds, not just an arbitrary range.
  const originX = useSharedValue<number | null>(null);
  const originY = useSharedValue<number | null>(null);

  const handleLayout = useCallback(() => {
    if (originX.value !== null) return;
    containerRef.current?.measureInWindow((x, y) => {
      originX.value = x;
      originY.value = y;
    });
  }, [originX, originY]);

  const triggerPress = useCallback(() => {
    onPress();
  }, [onPress]);

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

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      startX.value = translateX.value;
      startY.value = translateY.value;
      scale.value = withSpring(0.92, springConfig);
    })
    .onUpdate((event) => {
      const nextX = startX.value + event.translationX;
      const nextY = startY.value + event.translationY;

      if (originX.value === null || originY.value === null) {
        translateX.value = nextX;
        translateY.value = nextY;
        return;
      }

      const minX = EDGE_MARGIN - originX.value;
      const maxX = screenWidth - size - EDGE_MARGIN - originX.value;
      const minY = EDGE_MARGIN - originY.value;
      const maxY = screenHeight - size - EDGE_MARGIN - originY.value;

      translateX.value = Math.min(Math.max(nextX, minX), maxX);
      translateY.value = Math.min(Math.max(nextY, minY), maxY);
    })
    .onFinalize(() => {
      scale.value = withSpring(1, springConfig);
    });

  const tapGesture = Gesture.Tap()
    .maxDuration(250)
    .onBegin(() => {
      scale.value = withSpring(0.92, springConfig);
    })
    .onEnd(() => {
      scale.value = withSpring(1, springConfig);
      runOnJS(triggerPress)();
    })
    .onFinalize((_event, success) => {
      if (!success) {
        scale.value = withSpring(1, springConfig);
      }
    });

  const longPressGesture = Gesture.LongPress()
    .minDuration(350)
    .onStart(() => {
      runOnJS(handleLongPress)();
    });

  const composedGesture = Gesture.Race(
    panGesture,
    Gesture.Exclusive(longPressGesture, tapGesture)
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View
        ref={containerRef}
        onLayout={handleLayout}
        style={[
          animatedStyle,
          Platform.select({
            ios: {
              shadowColor: color,
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.35,
              shadowRadius: 16,
            },
          }),
        ]}
        className="z-20 items-center"
        accessibilityRole="button"
        accessibilityLabel="Create new task or project"
      >
        <View
          className="items-center justify-center rounded-full border-white"
          style={{
            height: size,
            width: size,
            borderRadius: size / 2,
            backgroundColor: color,
            borderWidth: RING_WIDTH,
            ...Platform.select({ android: { elevation: 8 } }),
          }}
        >
          <FabIcon />
        </View>
      </Animated.View>
    </GestureDetector>
  );
}
