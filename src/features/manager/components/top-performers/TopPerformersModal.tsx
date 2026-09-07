import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  Modal,
  Platform,
  Pressable,
  Animated as RNAnimated,
  Text,
  View,
} from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";

import { type TopPerformer } from "@/features/manager/data/topPerformers";

type TopPerformersModalProps = {
  visible: boolean;
  performers: TopPerformer[];
  onClose: () => void;
  onViewDetails?: (performer: TopPerformer) => void;
};

type PodiumRank = 1 | 2 | 3;

const SCREEN_WIDTH = Dimensions.get("window").width;

const RANK_STYLE = {
  1: { medal: "🥇", color: "#F59E0B", avatar: 64 },
  2: { medal: "🥈", color: "#64748B", avatar: 52 },
  3: { medal: "🥉", color: "#D97706", avatar: 52 },
} as const;

const MODAL_SHADOW = Platform.select({
  ios: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  android: { elevation: 4 },
});

function CelebrationOverlay({ burstKey }: { burstKey: number }) {
  if (burstKey === 0) return null;

  return (
    <View
      pointerEvents="none"
      style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 50 }}
    >
      <ConfettiCannon
        key={`center-${burstKey}`}
        count={200}
        origin={{ x: SCREEN_WIDTH / 2, y: 0 }}
        autoStart
        autoStartDelay={120}
        fadeOut
        colors={["#FCD34D", "#F59E0B", "#3B82F6", "#22C55E", "#FFFFFF"]}
      />
    </View>
  );
}

function RankCard({
  item,
  isCenter,
  onPress,
}: {
  item: TopPerformer;
  isCenter: boolean;
  onPress: () => void;
}) {
  const style = RANK_STYLE[item.rank as PodiumRank];

  return (
    <Pressable
      onPress={onPress}
      style={{ flex: 1, marginTop: isCenter ? 0 : 20 }}
      className="items-center rounded-2xl border border-[#E5E7EB] bg-white px-2 py-4"
    >
      <Text className="text-[20px]">{style.medal}</Text>

      <Image
        source={{ uri: item.avatarUrl }}
        className="mt-2 rounded-full bg-[#F3F4F6]"
        style={{
          width: style.avatar,
          height: style.avatar,
          borderWidth: 2,
          borderColor: style.color,
        }}
      />

      <Text
        className="mt-2 text-center text-[12px] font-semibold text-[#111827]"
        numberOfLines={1}
      >
        {item.name}
      </Text>

      <Text
        className="mt-1 text-[16px] font-bold"
        style={{ color: style.color }}
      >
        {item.score}%
      </Text>
    </Pressable>
  );
}

export function TopPerformersModal({
  visible,
  performers,
  onClose,
  onViewDetails,
}: TopPerformersModalProps) {
  const [celebrationBurst, setCelebrationBurst] = useState(0);
  const modalScale = useRef(new RNAnimated.Value(0.95)).current;

  const podiumOrder = useMemo(
    () =>
      [2, 1, 3]
        .map((rank) => performers.find((item) => item.rank === rank))
        .filter((item): item is TopPerformer => Boolean(item)),
    [performers],
  );

  useEffect(() => {
    if (!visible) return;

    setCelebrationBurst((prev) => prev + 1);
    modalScale.setValue(0.95);
    RNAnimated.spring(modalScale, {
      toValue: 1,
      damping: 16,
      stiffness: 200,
      useNativeDriver: true,
    }).start();
  }, [visible, modalScale]);

  const handlePress = (performer: TopPerformer) => {
    onViewDetails?.(performer);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View className="flex-1 items-center justify-center bg-black/45 px-5">
        <CelebrationOverlay burstKey={celebrationBurst} />

        <RNAnimated.View
          style={{
            transform: [{ scale: modalScale }],
            width: "100%",
            maxWidth: 320,
            zIndex: 10,
            ...MODAL_SHADOW,
          }}
          className="rounded-3xl bg-white p-5"
        >
          <View className="mb-5 flex-row items-center justify-between">
            <View>
              <Text className="text-[18px] font-bold text-[#111827]">
                🏆 Top Performers
              </Text>
              <Text className="mt-0.5 text-[12px] text-[#6B7280]">
                This month&apos;s best
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              hitSlop={8}
              className="h-8 w-8 items-center justify-center rounded-full bg-[#F3F4F6]"
            >
              <Ionicons name="close" size={18} color="#374151" />
            </Pressable>
          </View>

          {podiumOrder.length === 0 ? (
            <Text className="py-6 text-center text-[13px] text-[#9CA3AF]">
              No completed tasks to rank yet.
            </Text>
          ) : (
            <View className="flex-row items-end gap-3">
              {podiumOrder.map((item) => (
                <RankCard
                  key={item.id}
                  item={item}
                  isCenter={item.rank === 1}
                  onPress={() => handlePress(item)}
                />
              ))}
            </View>
          )}
        </RNAnimated.View>
      </View>
    </Modal>
  );
}
