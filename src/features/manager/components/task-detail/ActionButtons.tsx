import { Eye, Flag, RefreshCw, UserRoundCog } from "lucide-react-native";
import type { ReactNode } from "react";
import { Alert, Platform, Pressable, ScrollView, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BAR_SHADOW = Platform.select({
  ios: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
  },
  android: { elevation: 8 },
});

type ActionButtonsProps = {
  onRequestUpdate?: () => void;
  onReassign?: () => void;
  onChangePriority?: () => void;
  onMarkReview?: () => void;
};

const ACTIONS = [
  {
    id: "update",
    label: "Request Update",
    icon: RefreshCw,
    primary: true,
    key: "onRequestUpdate" as const,
  },
  {
    id: "reassign",
    label: "Reassign",
    icon: UserRoundCog,
    primary: false,
    key: "onReassign" as const,
  },
  {
    id: "priority",
    label: "Priority",
    icon: Flag,
    primary: false,
    key: "onChangePriority" as const,
  },
  {
    id: "review",
    label: "Mark Review",
    icon: Eye,
    primary: false,
    key: "onMarkReview" as const,
  },
];

export function ActionButtons({
  onRequestUpdate,
  onReassign,
  onChangePriority,
  onMarkReview,
}: ActionButtonsProps) {
  const insets = useSafeAreaInsets();

  const handlers = {
    onRequestUpdate,
    onReassign,
    onChangePriority,
    onMarkReview,
  };

  return (
    <View
      className="border-t border-[#F3F4F6] bg-white px-4 pt-3"
      style={[{ paddingBottom: Math.max(insets.bottom, 12) }, BAR_SHADOW]}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 10, paddingRight: 4 }}
      >
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          const onPress = handlers[action.key];

          return (
            <ActionChip
              key={action.id}
              label={action.label}
              icon={<Icon size={15} color={action.primary ? "#FFFFFF" : "#111827"} strokeWidth={2.2} />}
              primary={action.primary}
              onPress={() => {
                if (onPress) {
                  onPress();
                  return;
                }
                Alert.alert(action.label, "This action will be available soon.");
              }}
            />
          );
        })}
      </ScrollView>
    </View>
  );
}

type ActionChipProps = {
  label: string;
  icon: ReactNode;
  primary?: boolean;
  onPress?: () => void;
};

function ActionChip({ label, icon, primary = false, onPress }: ActionChipProps) {
  const scale = useSharedValue(1);

  const chipStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={chipStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={() => {
          scale.value = withSpring(0.96, { damping: 18, stiffness: 320 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 18, stiffness: 320 });
        }}
        accessibilityRole="button"
        accessibilityLabel={label}
        className={`flex-row items-center gap-2 rounded-full px-4 py-3 ${
          primary ? "bg-[#32CD32]" : "bg-[#F9FAFB]"
        }`}
      >
        {icon}
        <Text
          className={`text-[13px] font-semibold ${
            primary ? "text-white" : "text-[#111827]"
          }`}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}
