import {
  MessageCircle,
  Paperclip,
  RefreshCw,
  UserPlus,
} from "lucide-react-native";
import { useEffect } from "react";
import { Platform, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

import type { Task, TaskActivity } from "@/features/employee/types/types";

const CARD_SHADOW = Platform.select({
  ios: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
  },
  android: { elevation: 2 },
});

const META: Record<
  TaskActivity["type"],
  { icon: typeof RefreshCw; color: string; bg: string }
> = {
  created: { icon: RefreshCw, color: "#6B7280", bg: "#F3F4F6" },
  status: { icon: RefreshCw, color: "#2563EB", bg: "#EFF6FF" },
  comment: { icon: MessageCircle, color: "#F59E0B", bg: "#FFF7ED" },
  assigned: { icon: UserPlus, color: "#32CD32", bg: "#ECFDF5" },
  work_update: { icon: Paperclip, color: "#8B5CF6", bg: "#F5F3FF" },
};

type ActivityTimelineProps = {
  task: Task;
};

export function ActivityTimeline({ task }: ActivityTimelineProps) {
  const items = task.activities ?? [];

  return (
    <View>
      <Text className="mb-3 text-[15px] font-semibold text-[#111827]">
        Activity Timeline
      </Text>

      <View
        className="rounded-3xl border border-[#F3F4F6] bg-white px-4 py-2"
        style={CARD_SHADOW}
      >
        {items.length === 0 ? (
          <Text className="py-6 text-center text-[13px] text-[#9CA3AF]">
            No activity yet
          </Text>
        ) : (
          items.map((item, index) => (
            <TimelineItem
              key={item.id}
              item={item}
              index={index}
              isLast={index === items.length - 1}
            />
          ))
        )}
      </View>
    </View>
  );
}

type TimelineItemProps = {
  item: TaskActivity;
  index: number;
  isLast: boolean;
};

function TimelineItem({ item, index, isLast }: TimelineItemProps) {
  const meta = META[item.type];
  const Icon = meta.icon;
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(-8);

  useEffect(() => {
    opacity.value = withDelay(
      index * 80,
      withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) })
    );
    translateX.value = withDelay(
      index * 80,
      withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) })
    );
  }, [index, opacity, translateX]);

  const itemStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <Animated.View style={itemStyle} className="flex-row">
      <View className="mr-3 items-center">
        <View
          className="h-9 w-9 items-center justify-center rounded-2xl"
          style={{ backgroundColor: meta.bg }}
        >
          <Icon size={16} color={meta.color} strokeWidth={2.2} />
        </View>
        {!isLast ? <View className="mt-1 h-full min-h-[28px] w-px bg-[#E5E7EB]" /> : null}
      </View>

      <View className={`min-w-0 flex-1 pb-4 ${isLast ? "" : "border-b border-[#F3F4F6]"}`}>
        <Text className="text-[14px] font-semibold text-[#111827]">{item.title}</Text>
        <Text className="mt-1 text-[12px] text-[#9CA3AF]">{item.timestamp}</Text>
      </View>
    </Animated.View>
  );
}
