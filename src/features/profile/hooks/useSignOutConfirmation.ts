import { useRouter } from "expo-router";
import { useCallback } from "react";
import { Alert } from "react-native";

import { useAuthStore } from "@/stores/authStore";

/** Asks before signing out, then runs the auth store's normal sign-out cleanup and returns to sign-in. */
export function useSignOutConfirmation(): (options?: { allDevices?: boolean }) => void {
  const router = useRouter();
  const signOut = useAuthStore((state) => state.signOut);

  return useCallback(
    ({ allDevices = false } = {}) => {
      Alert.alert(
        allDevices ? "Sign out of all devices?" : "Sign out?",
        allDevices
          ? "You'll be signed out here and on every other device using this account."
          : "You'll need to sign in again to use the app.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Sign out",
            style: "destructive",
            onPress: async () => {
              await signOut({ allDevices });
              router.replace("/auth/sign-in");
            },
          },
        ],
      );
    },
    [router, signOut],
  );
}
