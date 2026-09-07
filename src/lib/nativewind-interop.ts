import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { cssInterop } from "nativewind";
import Animated from "react-native-reanimated";

cssInterop(BlurView, { className: "style" });
cssInterop(Animated.View, { className: "style" });
cssInterop(LinearGradient, { className: "style" });
