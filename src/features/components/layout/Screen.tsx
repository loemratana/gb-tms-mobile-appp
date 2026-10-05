import type { PropsWithChildren, ReactNode } from "react";
import { ScrollView, View } from "react-native";

import { Container } from "@/features/components/layout/Container";
import { useTabBarInset } from "@/features/components/navigation/ModernTabBar";

type ScreenProps = PropsWithChildren<{
  /** Optional fixed header above scroll content (per-tab flexible). */
  header?: ReactNode;
  /** Scroll body content. Default true. */
  scrollable?: boolean;
  /** Horizontal padding on body. Default true. */
  padded?: boolean;
  /** Reserve space for the floating manager tab bar. */
  floatingTabBar?: boolean;
}>;

/**
 * Flexible tab screen layout:
 *
 * ┌──────────────┐
 * │ header?      │  fixed (optional)
 * ├──────────────┤
 * │ content      │  flex-1 (scroll or static)
 * └──────────────┘
 * │ bottom tabs  │  handled by NativeTabs
 * └──────────────┘
 */
export function Screen({
  header,
  children,
  scrollable = true,
  padded = true,
  floatingTabBar = false,
}: ScreenProps) {
  const tabBarInset = useTabBarInset();
  const bottomPadding = floatingTabBar ? tabBarInset : 24;

  return (
    <View className="flex-1 bg-[#F3F4F6]">
      {header}

      {scrollable ? (
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: bottomPadding }}
        >
          <Container padded={padded} className="pt-2">
            {children}
          </Container>
        </ScrollView>
      ) : (
        <Container padded={padded} className="pt-2 pb-6" style={{ paddingBottom: floatingTabBar ? tabBarInset : undefined }}>
          {children}
        </Container>
      )}
    </View>
  );
}
