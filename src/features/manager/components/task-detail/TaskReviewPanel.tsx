import { Check, FileText, X } from "lucide-react-native";
import type { ReactNode } from "react";
import { ActivityIndicator, Platform, Pressable, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import type { Task } from "@/features/employee/types/types";

const CARD_SHADOW = Platform.select({
  ios: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
  },
  android: { elevation: 2 },
});

type TaskReviewPanelProps = {
  task: Task;
  loading?: boolean;
  onApprove: () => void;
  onReject: () => void;
};

export function TaskReviewPanel({
  task,
  loading = false,
  onApprove,
  onReject,
}: TaskReviewPanelProps) {
  const latestSubmission = (task.activities ?? []).find(
    (item) => item.type === "work_update" || item.type === "comment"
  );

  return (
    <View
      className="rounded-3xl border border-[#F3F4F6] bg-white p-4"
      style={CARD_SHADOW}
    >
      <View className="flex-row items-center gap-2">
        <View className="h-2 w-2 rounded-full bg-[#F59E0B]" />
        <Text className="text-[13px] font-semibold uppercase tracking-wide text-[#F59E0B]">
          Review pending
        </Text>
      </View>

      {latestSubmission ? (
        <View className="mt-3 flex-row items-start gap-3 rounded-2xl bg-[#F9FAFB] p-3">
          <View className="h-9 w-9 items-center justify-center rounded-xl bg-white">
            <FileText size={16} color="#6B7280" strokeWidth={2.2} />
          </View>
          <View className="min-w-0 flex-1">
            <Text className="text-[13px] font-semibold text-[#111827]">
              {latestSubmission.title}
            </Text>
            <Text className="mt-0.5 text-[11px] text-[#9CA3AF]">
              {latestSubmission.timestamp}
            </Text>
          </View>
        </View>
      ) : null}

      <View className="mt-4 flex-row gap-3">
        <ReviewChip
          label="Reject"
          icon={<X size={15} color="#DC2626" strokeWidth={2.4} />}
          variant="outline"
          onPress={onReject}
          disabled={loading}
        />
        <ReviewChip
          label="Approve"
          icon={<Check size={15} color="#FFFFFF" strokeWidth={2.4} />}
          variant="primary"
          onPress={onApprove}
          disabled={loading}
          loading={loading}
        />
      </View>
    </View>
  );
}

type ReviewChipProps = {
  label: string;
  icon: ReactNode;
  variant: "outline" | "primary";
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
};

function ReviewChip({
  label,
  icon,
  variant,
  onPress,
  disabled = false,
  loading = false,
}: ReviewChipProps) {
  const scale = useSharedValue(1);
  const chipStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const isPrimary = variant === "primary";

  return (
    <Animated.View style={chipStyle} className="flex-1">
      <Pressable
        onPress={onPress}
        disabled={disabled}
        onPressIn={() => {
          scale.value = withSpring(0.96, { damping: 18, stiffness: 320 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 18, stiffness: 320 });
        }}
        accessibilityRole="button"
        accessibilityLabel={label}
        className={`flex-row items-center justify-center gap-2 rounded-full px-5 py-3.5 ${
          isPrimary ? "bg-[#32CD32]" : "border border-[#FECACA] bg-[#FFF5F5]"
        }`}
        style={{
          opacity: disabled && !loading ? 0.6 : 1,
          borderRadius: 9999,
        }}
      >
        {loading && isPrimary ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          icon
        )}
        <Text
          className={`text-[13px] font-semibold ${
            isPrimary ? "text-white" : "text-[#DC2626]"
          }`}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}
