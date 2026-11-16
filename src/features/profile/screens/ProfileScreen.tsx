import { useRouter } from "expo-router";
import { useRef } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";

import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { useTabBarInset } from "@/components/navigation/ModernTabBar";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { StateView } from "@/components/ui/StateView";
import { getSettingsPathForRole } from "@/features/auth/utils/navigation";
import {
  EditProfileBottomSheet,
  type EditProfileBottomSheetRef,
} from "@/features/profile/components/EditProfileBottomSheet";
import { ProfileSkeleton } from "@/features/profile/components/ProfileSkeleton";
import { SettingsGroup, SettingsRow } from "@/features/profile/components/SettingsList";
import { useProfile } from "@/features/profile/hooks/useProfile";
import { useSignOutConfirmation } from "@/features/profile/hooks/useSignOutConfirmation";
import { PerformanceOverview } from "@/features/team/components/PerformanceOverview";
import { useAuthStore } from "@/stores/authStore";

/** Profile tab for both roles: who you are, your performance, a way into Settings, and sign-out. */
export default function ProfileScreen() {
  const router = useRouter();
  const role = useAuthStore((state) => state.user?.role);
  const tabBarInset = useTabBarInset();
  const editSheetRef = useRef<EditProfileBottomSheetRef>(null);
  const profile = useProfile();
  const confirmSignOut = useSignOutConfirmation();
  const { user } = profile;

  const openSettings = () => {
    if (role) router.push(getSettingsPathForRole(role));
  };

  const header = (
    <ScreenHeader
      title="Profile"
      actions={<IconButton icon="settings-outline" variant="subtle" accessibilityLabel="Settings" onPress={openSettings} />}
    />
  );

  if (profile.isLoading) {
    return (
      <View className="flex-1 bg-screen">
        {header}
        <ProfileSkeleton />
      </View>
    );
  }

  if (profile.isError) {
    return (
      <View className="flex-1 bg-screen">
        {header}
        <View className="flex-1 justify-center px-4">
          <StateView
            variant="error"
            title="Couldn't load your profile"
            message="Check your connection and try again."
            actionLabel="Try again"
            onPressAction={profile.refetch}
          />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-screen">
      {header}

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 20, paddingBottom: tabBarInset + 24, gap: 24 }}
        refreshControl={<RefreshControl refreshing={profile.isRefreshing} onRefresh={profile.refetch} />}
      >
        {/* Identity */}
        <View className="items-center px-4">
          <Avatar name={user.name || "?"} imageUrl={user.avatarUrl} size={88} />
          <Text
            className="mt-3 text-display font-bold text-fg text-center"
            numberOfLines={2}
          >
            {user.name}
          </Text>
          {user.role ? (
            <View className="mt-2">
              <Badge label={user.role} tone="info" />
            </View>
          ) : null}
          <View className="mt-4">
            <Button
              label="Edit profile"
              icon="create-outline"
              variant="primary"
              size="sm"
              onPress={() => editSheetRef.current?.present()}
            />
          </View>
        </View>
       

        {/* Details — only the fields this account has */}
        {profile.details.length > 0 ? (
          <SettingsGroup title="Details">
            {profile.details.map((detail) => (
              <SettingsRow key={detail.key} icon={detail.icon} label={detail.label} description={detail.value} isValueSelectable />
            ))}
          </SettingsGroup>
        ) : null}

        {/* Performance */}
        <View className="px-4">
          <PerformanceOverview title="My performance" userId={profile.currentUser?.id} />
        </View>

        {/* Sign out — kept apart from ordinary settings */}
        <View className="px-4">
          <Button label="Sign out" icon="log-out-outline" variant="destructive" onPress={() => confirmSignOut()} />
        </View>
      </ScrollView>

      <EditProfileBottomSheet ref={editSheetRef} />
    </View>
  );
}
