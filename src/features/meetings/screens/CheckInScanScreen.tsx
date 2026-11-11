import Ionicons from "@expo/vector-icons/Ionicons";
import { CameraView } from "expo-camera";
import { useRouter } from "expo-router";
import { ActivityIndicator, Linking, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { StackHeader } from "@/components/layout/StackHeader";
import { Button } from "@/components/ui/Button";
import { StateView } from "@/components/ui/StateView";
import { useCheckInScanner } from "@/features/meetings/hooks/useCheckInScanner";
import { colors, palette } from "@/styles";

const FRAME_SIZE = 240;

/** Scan the meeting's QR code (on the organizer's phone or the room's screen) to check in. */
export default function CheckInScanScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scanner = useCheckInScanner();
  const { state } = scanner;

  const renderPermission = () => (
    <View className="flex-1 justify-center p-6">
      <StateView
        variant="empty"
        icon="camera-outline"
        title="Camera access needed"
        message="The camera is only used to read the meeting's check-in QR code."
        actionLabel={scanner.canAskPermission ? "Allow camera" : "Open settings"}
        onPressAction={scanner.canAskPermission ? scanner.requestPermission : () => void Linking.openSettings()}
      />
    </View>
  );

  const renderResult = () => {
    if (state.kind === "success") {
      const isLate = state.result.status === "LATE";
      return (
        <View className="items-center gap-2">
          <View
            className={`h-16 w-16 items-center justify-center rounded-full ${isLate ? "bg-warning-subtle" : "bg-success-subtle"}`}
          >
            <Ionicons name="checkmark-circle" size={40} color={isLate ? colors.warning : colors.success} />
          </View>
          <Text className="text-title font-semibold text-fg" accessibilityRole="header">
            {state.result.alreadyCheckedIn ? "Already checked in" : isLate ? "Checked in (late)" : "You're checked in"}
          </Text>
          <Text className="text-center text-body-sm text-fg-soft">
            {[state.result.title, state.result.location ?? state.result.roomName].filter(Boolean).join(" · ")}
          </Text>
          <View className="mt-3 w-full">
            <Button label="Done" onPress={() => router.back()} />
          </View>
        </View>
      );
    }
    if (state.kind === "error") {
      return (
        <View className="items-center gap-2">
          <Ionicons name="alert-circle" size={40} color={colors.danger} />
          <Text className="text-center text-body font-semibold text-fg">Couldn&apos;t check in</Text>
          <Text className="text-center text-body-sm text-fg-soft">{state.message}</Text>
          <View className="mt-3 w-full">
            <Button label="Scan again" onPress={scanner.scanAgain} />
          </View>
        </View>
      );
    }
    if (state.kind === "submitting") {
      return (
        <View className="flex-row items-center justify-center gap-2">
          <ActivityIndicator color={colors.brand} />
          <Text className="text-body-sm text-fg-soft">Checking you in…</Text>
        </View>
      );
    }
    return (
      <Text className="text-center text-body-sm text-fg-soft">
        Point the camera at the QR code on the organizer&apos;s phone or the screen at the room.
      </Text>
    );
  };

  return (
    <View className="flex-1 bg-subtle">
      <StackHeader title="Check in" onBack={() => router.back()} />
      {scanner.isPermissionLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.brand} />
        </View>
      ) : !scanner.hasPermission ? (
        renderPermission()
      ) : (
        <View className="flex-1">
          <View className="flex-1 overflow-hidden bg-black">
            <CameraView
              style={StyleSheet.absoluteFill}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
              onBarcodeScanned={scanner.isScanning ? scanner.handleScanned : undefined}
            />
            <View pointerEvents="none" className="flex-1 items-center justify-center">
              <View
                style={{ width: FRAME_SIZE, height: FRAME_SIZE, borderRadius: 24, borderWidth: 3, borderColor: palette.white }}
              />
            </View>
          </View>
          <View
            className="rounded-t-3xl bg-surface px-6 pt-6"
            style={{ marginTop: -24, paddingBottom: Math.max(insets.bottom, 16) + 8, minHeight: 180 }}
            accessibilityLiveRegion="polite"
          >
            {renderResult()}
          </View>
        </View>
      )}
    </View>
  );
}
