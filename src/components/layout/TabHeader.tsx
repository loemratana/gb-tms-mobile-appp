import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useHeaderUser } from "@/features/auth/utils/userProfile";
import {
  HeaderAnalyzeButton,
  HeaderNotificationButton,
  HeaderProfile,
} from "./Header";
import { useNotificationSheet } from "@/features/notifications/components/NotificationSheetProvider";

type TabHeaderProps =
  | {
      variant: "profile";
      showNotification?: boolean;
      onAnalyzePress?: () => void;
    }
  | {
      variant: "title";
      title: string;
      showNotification?: boolean;
      onAnalyzePress?: () => void;
    };

export function TabHeader(props: TabHeaderProps) {
  const { open } = useNotificationSheet();
  const showNotification = props.showNotification ?? true;
  const { userName, avatarUrl, role } = useHeaderUser();

  return (
    <SafeAreaView edges={["top"]}>
      <View className="min-h-[68px] flex-row items-center justify-between px-4 py-3">
        {props.variant === "profile" ? (
          <HeaderProfile
            userName={userName}
            avatarUrl={avatarUrl}
            role={role}
          />
        ) : (
          <Text className="font-sans text-[20px] font-bold text-fg">
            {props.title}
          </Text>
        )}

        <View className="flex-row items-center">
          {props.onAnalyzePress ? (
            <HeaderAnalyzeButton onPress={props.onAnalyzePress} />
          ) : null}

          {showNotification ? (
            <HeaderNotificationButton onPress={open} />
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}
