import { useCallback, useEffect, useMemo, useRef } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { Screen } from "@/features/components/layout/Screen";
import {
  EditProfileBottomSheet,
  type EditProfileBottomSheetRef,
} from "@/features/employee/components/profile/EditProfileBottomSheet";
import { ProfileHeader } from "@/features/employee/components/profile/ProfileHeader";
import { ProfileHeroCard } from "@/features/employee/components/profile/ProfileHeroCard";
import { ProfileSkeleton } from "@/features/employee/components/profile/ProfileSkeleton";
import { RecentActivity } from "@/features/employee/components/profile/RecentActivity";
import { SettingsMenu } from "@/features/employee/components/profile/SettingsMenu";
import { WorkspaceSection } from "@/features/employee/components/profile/WorkspaceSection";
import {
  productivityStats,
  recentActivity,
  settingsItems,
  toProfileUser,
  workspaceInfo,
  type SettingsItem,
} from "@/features/employee/data/profile";
import { useMyKpi } from "@/features/tasks/hooks/useTasks";
import { useCurrentUser } from "@/features/users/hooks/useUsers";
import { useAuthStore } from "@/stores/authStore";
import { useProfileStore } from "@/stores/profileStore";

export default function ProfileScreen({
  floatingTabBar = false,
}: {
  floatingTabBar?: boolean;
}) {
  const router = useRouter();
  const signOut = useAuthStore((s) => s.signOut);
  const editSheetRef = useRef<EditProfileBottomSheetRef>(null);

  const {
    data: currentUser,
    isLoading: isLoadingProfile,
    isError: isProfileError,
    refetch: refetchProfile,
  } = useCurrentUser();

  const setProfileUser = useProfileStore((s) => s.setUser);
  const cachedUser = useProfileStore((s) => s.user);

  useEffect(() => {
    if (currentUser) {
      setProfileUser(toProfileUser(currentUser));
    }
  }, [currentUser, setProfileUser]);

  // While the first fetch is in flight, fall back to whatever was cached
  // from login (name/role/avatar) so the header doesn't flash empty.
  const user = currentUser ? toProfileUser(currentUser) : cachedUser;

  const { data: kpi } = useMyKpi();
  const stats = useMemo(
    () =>
      productivityStats.map((stat) => {
        if (stat.id === "completed" && kpi) {
          return { ...stat, value: String(kpi.completedTasks) };
        }
        if (stat.id === "kpi" && kpi) {
          return { ...stat, value: `${kpi.kpi}%` };
        }
        return stat;
      }),
    [kpi]
  );

  const openEditProfile = useCallback(() => {
    editSheetRef.current?.present();
  }, []);

  const handleSignOut = useCallback(() => {
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
  }, [router, signOut]);

  const handleSettingsPress = () => {
    Alert.alert("Settings", "Open account settings.");
  };

  const handleMenuItem = (item: SettingsItem) => {
    if (item.id === "edit") {
      openEditProfile();
      return;
    }

    Alert.alert(item.label, `${item.label} screen coming soon.`);
  };

  const header = <ProfileHeader onPressSettings={handleSettingsPress} />;

  if (isLoadingProfile && !user.name) {
    return (
      <Screen padded={false} floatingTabBar={floatingTabBar} header={header}>
        <ProfileSkeleton />
      </Screen>
    );
  }

  if (isProfileError && !user.name) {
    return (
      <Screen padded={false} floatingTabBar={floatingTabBar} header={header}>
        <View className="flex-1 items-center justify-center px-6 py-24">
          <Text className="text-base font-bold text-[#111827]">
            Couldn&apos;t load your profile
          </Text>
          <Text className="mt-1 text-center text-sm text-[#6B7280]">
            Check your connection and try again.
          </Text>
          <Pressable
            onPress={() => refetchProfile()}
            accessibilityRole="button"
            className="mt-4 rounded-full bg-[#2563EB] px-5 py-2.5"
          >
            <Text className="text-[13px] font-semibold text-white">Retry</Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  return (
    <>
      <Screen padded={false} floatingTabBar={floatingTabBar} header={header}>
        <View className="bg-white px-5 pb-5">
          <ProfileHeroCard
            user={user}
            stats={stats}
            onPressEdit={openEditProfile}
          />
        </View>

        <View className="gap-6 bg-[#F3F4F6] px-5 pb-8 pt-6">
          <WorkspaceSection workspace={workspaceInfo} />
          <RecentActivity items={recentActivity} />
          <SettingsMenu items={settingsItems} onPressItem={handleMenuItem} />

          <Pressable
            onPress={handleSignOut}
            accessibilityRole="button"
            accessibilityLabel="Sign out"
            className="h-[52px] items-center justify-center rounded-xl bg-[#EF4444]"
            style={({ pressed }) => [
              {
                transform: [{ scale: pressed ? 0.98 : 1 }],
                shadowColor: "#EF4444",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 3,
              },
            ]}
          >
            <Text className="text-[16px] font-semibold text-white">
              Sign Out
            </Text>
          </Pressable>
        </View>
      </Screen>

      <EditProfileBottomSheet ref={editSheetRef} />
    </>
  );
}
