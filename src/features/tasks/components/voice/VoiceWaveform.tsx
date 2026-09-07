import { useEffect } from "react";
import { View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

const BAR_COUNT = 27;
const MIN_BAR_HEIGHT = 4;
const MAX_BAR_HEIGHT = 44;
/** Static per-bar weight so idle/loud bars don't all move in lockstep — gives the waveform an organic shape. */
const BAR_WEIGHTS = Array.from({ length: BAR_COUNT }, (_, index) => 0.35 + 0.65 * Math.abs(Math.sin(index * 1.3)));

/** expo-audio metering is roughly -55..0 dB for speech; below that reads as silence. */
function normalizeMetering(db: number | undefined): number {
  if (db === undefined) return 0;
  return Math.min(1, Math.max(0, (db + 55) / 55));
}

function WaveformBar({ level, weight }: { level: number; weight: number }) {
  const height = useSharedValue(MIN_BAR_HEIGHT);

  useEffect(() => {
    height.value = withTiming(MIN_BAR_HEIGHT + level * weight * (MAX_BAR_HEIGHT - MIN_BAR_HEIGHT), {
      duration: 120,
    });
  }, [level, weight, height]);

  const style = useAnimatedStyle(() => ({ height: height.value }));

  return <Animated.View style={style} className="w-[3px] rounded-full bg-[#32CD32]" />;
}

type VoiceWaveformProps = {
  metering: number | undefined;
  isActive: boolean;
};

export function VoiceWaveform({ metering, isActive }: VoiceWaveformProps) {
  const level = isActive ? normalizeMetering(metering) : 0;

  return (
    <View className="h-14 flex-row items-center justify-center gap-[3px]">
      {BAR_WEIGHTS.map((weight, index) => (
        <WaveformBar key={index} level={level} weight={weight} />
      ))}
    </View>
  );
}
