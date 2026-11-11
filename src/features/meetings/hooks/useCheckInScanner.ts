import { useCameraPermissions, type BarcodeScanningResult } from "expo-camera";
import * as Haptics from "expo-haptics";
import { useCallback, useRef, useState } from "react";

import { useCheckIn } from "@/features/meetings/hooks/useAttendance";
import type { CheckInResult } from "@/features/meetings/types/meeting.types";
import { getApiErrorMessage } from "@/lib/api";

const CHECK_IN_PREFIX = "tms-checkin:";

export type ScannerState =
  | { kind: "scanning" }
  | { kind: "submitting" }
  | { kind: "success"; result: CheckInResult }
  | { kind: "error"; message: string };

/** Camera permission, one scan at a time, and the check-in call. */
export function useCheckInScanner() {
  const [permission, requestPermission] = useCameraPermissions();
  const [state, setState] = useState<ScannerState>({ kind: "scanning" });
  // The camera fires many events per second for the same code; only the first one counts.
  const isLocked = useRef(false);
  const checkIn = useCheckIn();

  const handleScanned = useCallback(
    ({ data }: BarcodeScanningResult) => {
      if (isLocked.current) return;
      isLocked.current = true;

      if (!data.startsWith(CHECK_IN_PREFIX)) {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        setState({ kind: "error", message: "That isn't a meeting check-in code. Scan the code shown for the meeting." });
        return;
      }

      setState({ kind: "submitting" });
      checkIn.mutate(data, {
        onSuccess: (result) => {
          void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setState({ kind: "success", result });
        },
        onError: (error) => {
          void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          setState({ kind: "error", message: getApiErrorMessage(error) });
        },
      });
    },
    [checkIn],
  );

  const scanAgain = useCallback(() => {
    isLocked.current = false;
    setState({ kind: "scanning" });
  }, []);

  return {
    hasPermission: Boolean(permission?.granted),
    canAskPermission: permission?.canAskAgain ?? true,
    isPermissionLoading: permission === null,
    requestPermission: () => void requestPermission(),
    state,
    isScanning: state.kind === "scanning",
    handleScanned,
    scanAgain,
  };
}
