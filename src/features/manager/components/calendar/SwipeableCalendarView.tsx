import type { ReactNode } from "react";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const SWIPE_DISTANCE_THRESHOLD = 50;
const SWIPE_VELOCITY_THRESHOLD = 600;
const DRAG_RESISTANCE = 0.3;
const MAX_DRAG = 28;

type SwipeableCalendarViewProps = {
  children: ReactNode;
  /** Swipe left = advance forward in time (next day/week). */
  onSwipeLeft: () => void;
  /** Swipe right = go back in time (previous day/week). */
  onSwipeRight: () => void;
};

/** Horizontal swipe-to-navigate wrapper for Day/Week/Work Week calendar views, with a Google-Calendar-style rubber-band drag. */
export function SwipeableCalendarView({
  children,
  onSwipeLeft,
  onSwipeRight,
}: SwipeableCalendarViewProps) {
  const translateX = useSharedValue(0);

  const pan = Gesture.Pan()
    .activeOffsetX([-12, 12])
    .failOffsetY([-10, 10])
    .onUpdate((event) => {
      const resisted = event.translationX * DRAG_RESISTANCE;
      translateX.value = Math.max(-MAX_DRAG, Math.min(MAX_DRAG, resisted));
    })
    .onEnd((event) => {
      translateX.value = withSpring(0, { damping: 18, stiffness: 220 });

      if (
        event.translationX < -SWIPE_DISTANCE_THRESHOLD ||
        event.velocityX < -SWIPE_VELOCITY_THRESHOLD
      ) {
        runOnJS(onSwipeLeft)();
      } else if (
        event.translationX > SWIPE_DISTANCE_THRESHOLD ||
        event.velocityX > SWIPE_VELOCITY_THRESHOLD
      ) {
        runOnJS(onSwipeRight)();
      }
    });

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={style}>{children}</Animated.View>
    </GestureDetector>
  );
}
