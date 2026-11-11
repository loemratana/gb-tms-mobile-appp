import type { ReactNode } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { IconButton } from "@/components/ui/IconButton";

type StackHeaderProps = {
  title: string;
  onBack: () => void;
  /** Right-aligned actions, usually up to two ghost `IconButton`s. */
  actions?: ReactNode;
};

/**
 * Header for screens pushed onto a stack: back button, centred title, optional actions.
 * Tab screens use `ScreenHeader` instead.
 */
export function StackHeader({ title, onBack, actions }: StackHeaderProps) {
  // Both sides get the same width so the title stays centred on screen.
  const sideClassName = actions ? "w-24" : "w-12";

  return (
    <SafeAreaView edges={["top"]} className="border-b border-line bg-surface">
      <View className="h-14 flex-row items-center px-3">
        <View className={`${sideClassName} flex-row`}>
          <IconButton icon="chevron-back" variant="ghost" accessibilityLabel="Go back" onPress={onBack} />
        </View>
        <Text className="flex-1 text-center text-headline font-semibold text-fg" accessibilityRole="header" numberOfLines={1}>
          {title}
        </Text>
        <View className={`${sideClassName} flex-row justify-end gap-1`}>{actions}</View>
      </View>
    </SafeAreaView>
  );
}
