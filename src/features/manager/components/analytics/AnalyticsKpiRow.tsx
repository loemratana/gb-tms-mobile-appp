import { useEffect } from "react";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

import { StatCard } from "@/features/components/ui/StatCard";
import type { ManagerKpi } from "@/features/manager/data/analytics";

type AnalyticsKpiRowProps = {
  item: ManagerKpi;
  index?: number;
};

export function AnalyticsKpiRow({ item, index = 0 }: AnalyticsKpiRowProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      index * 80,
      withTiming(1, {
        duration: 450,
        easing: Easing.out(Easing.cubic),
      })
    );
  }, [index, progress]);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * 10 }],
  }));

  return (
    <Animated.View style={cardStyle} className="flex-1">
      <StatCard
        title={item.title}
        value={item.value}
        label={item.label}
        icon={item.icon}
        variant={item.variant}
        compact
      />
    </Animated.View>
  );
}
