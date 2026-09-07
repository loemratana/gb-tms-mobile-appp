import { useRouter } from "expo-router";
import { Alert, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuthStore } from "@/stores/authStore";

export default function AdminDashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/auth/sign-in");
        },
      },
    ]);
  };

  return (
    <View
      className="flex-1 bg-[#F3F4F6] px-6"
      style={{ paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }}
    >
      <Text className="text-[13px] font-semibold uppercase tracking-[2px] text-[#6B7280]">
        Admin Portal
      </Text>
      <Text className="mt-2 text-[28px] font-bold text-[#111827]">
        Dashboard
      </Text>
      <Text className="mt-1 text-[15px] text-[#6B7280]">
        Welcome back, {user?.name ?? "Admin"}
      </Text>

      <View
        className="mt-8 rounded-2xl border border-[#E5E7EB] bg-white p-5"
        style={{
          shadowColor: "#0F172A",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.06,
          shadowRadius: 16,
          elevation: 3,
        }}
      >
        <Text className="text-[15px] font-semibold text-[#111827]">
          Organization Overview
        </Text>
        <Text className="mt-2 text-[14px] leading-5 text-[#6B7280]">
          Manage users, roles, and system settings from your admin workspace.
        </Text>
      </View>

      <Pressable
        onPress={handleSignOut}
        className="mt-auto h-[52px] items-center justify-center rounded-xl bg-[#EF4444]"
        accessibilityRole="button"
      >
        <Text className="text-[16px] font-semibold text-white">Sign Out</Text>
      </Pressable>
    </View>
  );
}
