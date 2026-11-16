import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Dimensions,
  Easing,
  Modal,
  Platform,
  Pressable,
  Animated as RNAnimated,
  Text,
  View,
} from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";

import { Avatar, type AvatarSize } from "@/components/ui/Avatar";
import { type TopPerformer } from "@/features/dashboard/utils/topPerformers";
import { StarRating } from "@/features/team/components/StarRating";
import { colors, palette } from "@/styles";

/**
 * What the podium needs. With `stars`, a place shows the star rating and a 0-100 score
 * (performance awards); without, the score is a completion percentage (manager KPI).
 */
export type PodiumPerformer = Pick<TopPerformer, "id" | "rank" | "name" | "avatarUrl" | "score"> & {
  stars?: number;
};

type TopPerformersModalProps<T extends PodiumPerformer> = {
  visible: boolean;
  performers: T[];
  onClose: () => void;
  onViewDetails?: (performer: T) => void;
  /** Defaults to "Top Performers". */
  title?: string;
  /** Defaults to "This month's best". */
  subtitle?: string;
  /** Under the podium, e.g. the viewer's own place and a "See full ranking" button. */
  footer?: ReactNode;
};

type PodiumRank = 1 | 2 | 3;

const SCREEN_WIDTH = Dimensions.get("window").width;

/** Gold, silver, bronze. 1st stands tallest in the middle; the blocks give the podium its shape. */
const PLACE_STYLE: Record<
  PodiumRank,
  { medal: string; ring: string; avatar: AvatarSize; blockHeight: number; blockClassName: string }
> = {
  1: { medal: "🥇", ring: palette.amber[500], avatar: 64, blockHeight: 88, blockClassName: "bg-white/30" },
  2: { medal: "🥈", ring: palette.gray[300], avatar: 52, blockHeight: 60, blockClassName: "bg-white/20" },
  3: { medal: "🥉", ring: palette.amber[600], avatar: 52, blockHeight: 44, blockClassName: "bg-white/15" },
};

/** Each place rises in turn — 3rd, then 2nd, then 1st last — as fractions of one animation. */
const RISE_WINDOW: Record<PodiumRank, [number, number]> = {
  3: [0, 0.55],
  2: [0.2, 0.75],
  1: [0.45, 1],
};

const HERO_GRADIENT = [palette.blue[500], palette.blue[700]] as const;

const MODAL_SHADOW = Platform.select({
  ios: {
    shadowColor: palette.black,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.25,
    shadowRadius: 32,
  },
  android: { elevation: 12 },
});

function CelebrationOverlay({ burstKey }: { burstKey: number }) {
  if (burstKey === 0) return null;

  return (
    <View pointerEvents="none" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 50 }}>
      <ConfettiCannon
        key={`center-${burstKey}`}
        count={180}
        origin={{ x: SCREEN_WIDTH / 2, y: -20 }}
        autoStart
        autoStartDelay={450}
        fadeOut
        colors={[palette.amber[500], colors.warning, colors.brand, palette.violet[500], palette.white]}
      />
    </View>
  );
}

function PodiumPlace({
  item,
  progress,
  onPress,
}: {
  item: PodiumPerformer;
  progress: RNAnimated.Value;
  onPress?: () => void;
}) {
  const rank = item.rank as PodiumRank;
  const style = PLACE_STYLE[rank];
  const isFirst = rank === 1;
  const scoreLabel = item.stars !== undefined ? String(item.score) : `${item.score}%`;

  const opacity = progress.interpolate({ inputRange: RISE_WINDOW[rank], outputRange: [0, 1], extrapolate: "clamp" });
  const translateY = progress.interpolate({
    inputRange: RISE_WINDOW[rank],
    outputRange: [36, 0],
    extrapolate: "clamp",
  });

  return (
    <RNAnimated.View style={{ flex: 1, opacity, transform: [{ translateY }] }}>
      <Pressable
        onPress={onPress}
        disabled={!onPress}
        accessibilityRole="button"
        accessibilityLabel={`${rank === 1 ? "First" : rank === 2 ? "Second" : "Third"} place, ${item.name}, score ${scoreLabel}`}
        className="items-center active:opacity-80"
      >
        {isFirst ? <Ionicons name="sparkles" size={18} color={palette.amber[500]} style={{ marginBottom: 4 }} /> : null}

        <View>
          <View className="rounded-full p-[3px]" style={{ backgroundColor: style.ring }}>
            <View className="rounded-full bg-white p-[2px]">
              <Avatar name={item.name} imageUrl={item.avatarUrl} size={style.avatar} />
            </View>
          </View>
          <View className="absolute -bottom-2 self-center">
            <Text className="text-title">{style.medal}</Text>
          </View>
        </View>

        <Text className="mt-3 px-1 text-center text-label font-semibold text-white" numberOfLines={1}>
          {item.name}
        </Text>
        {item.stars !== undefined ? (
          <View className="mt-1">
            <StarRating value={item.stars} size={10} />
          </View>
        ) : null}
        <View className="mb-2 mt-1.5 rounded-full bg-white/20 px-2.5 py-0.5">
          <Text className="text-label font-bold text-white">{scoreLabel}</Text>
        </View>

        {/* The podium block this person stands on. */}
        <View
          className={`w-full items-center justify-start rounded-t-2xl pt-2 ${style.blockClassName}`}
          style={{ height: style.blockHeight }}
        >
          <Text className="text-display font-black text-white/90">{rank}</Text>
        </View>
      </Pressable>
    </RNAnimated.View>
  );
}

export function TopPerformersModal<T extends PodiumPerformer>({
  visible,
  performers,
  onClose,
  onViewDetails,
  title = "Top Performers",
  subtitle = "This month's best",
  footer,
}: TopPerformersModalProps<T>) {
  const [celebrationBurst, setCelebrationBurst] = useState(0);
  const [cardScale] = useState(() => new RNAnimated.Value(0.92));
  const [podiumProgress] = useState(() => new RNAnimated.Value(0));

  const podiumOrder = useMemo(
    () =>
      [2, 1, 3]
        .map((rank) => performers.find((item) => item.rank === rank))
        .filter((item): item is T => Boolean(item)),
    [performers],
  );

  // Bump the burst counter during render (not in the effect below) so opening
  // the modal doesn't cost an extra commit just to retrigger the confetti.
  const [prevVisible, setPrevVisible] = useState(visible);
  if (visible !== prevVisible) {
    setPrevVisible(visible);
    if (visible) setCelebrationBurst((prev) => prev + 1);
  }

  useEffect(() => {
    if (!visible) return;
    cardScale.setValue(0.92);
    podiumProgress.setValue(0);
    RNAnimated.parallel([
      RNAnimated.spring(cardScale, { toValue: 1, damping: 15, stiffness: 180, useNativeDriver: true }),
      RNAnimated.timing(podiumProgress, {
        toValue: 1,
        duration: 900,
        delay: 150,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible, cardScale, podiumProgress]);

  const canOpenPerson = Boolean(onViewDetails) && podiumOrder.length > 0;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View className="flex-1 items-center justify-center bg-black/60 px-5">
        <Pressable
          className="absolute inset-0"
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close top performers"
        />
        <CelebrationOverlay burstKey={celebrationBurst} />

        <RNAnimated.View
          style={{ transform: [{ scale: cardScale }], width: "100%", maxWidth: 360, zIndex: 10, ...MODAL_SHADOW }}
          className="overflow-hidden rounded-3xl bg-surface"
        >
          <LinearGradient colors={HERO_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <View className="items-center px-5 pt-5">
              <Pressable
                onPress={onClose}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Close"
                className="absolute right-4 top-4 h-9 w-9 items-center justify-center rounded-full bg-white/20 active:bg-white/30"
              >
                <Ionicons name="close" size={20} color={palette.white} />
              </Pressable>

              <View className="h-14 w-14 items-center justify-center rounded-full bg-white/20">
                <Ionicons name="trophy" size={28} color={palette.amber[500]} />
              </View>
              <Text className="mt-3 text-center text-title font-bold text-white" accessibilityRole="header">
                {title}
              </Text>
              <Text className="mt-0.5 text-center text-label text-white/80" numberOfLines={2}>
                {subtitle}
              </Text>
            </View>

            {podiumOrder.length === 0 ? (
              <View className="items-center px-6 pb-8 pt-6">
                <Ionicons name="podium-outline" size={30} color={palette.white} style={{ opacity: 0.7 }} />
                <Text className="mt-2 text-center text-caption text-white/80">Nobody ranked yet for this period.</Text>
              </View>
            ) : (
              <View className="mt-5 flex-row items-end gap-2 px-4">
                {podiumOrder.map((item) => (
                  <PodiumPlace
                    key={item.id}
                    item={item}
                    progress={podiumProgress}
                    onPress={onViewDetails ? () => onViewDetails(item) : undefined}
                  />
                ))}
              </View>
            )}
          </LinearGradient>

          {footer ? (
            <View className="p-5">{footer}</View>
          ) : canOpenPerson ? (
            <View className="px-5 py-4">
              <Text className="text-center text-caption text-fg-soft">Tap someone to see their details.</Text>
            </View>
          ) : null}
        </RNAnimated.View>
      </View>
    </Modal>
  );
}
