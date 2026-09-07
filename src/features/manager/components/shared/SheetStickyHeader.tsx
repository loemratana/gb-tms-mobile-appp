import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

type SheetStickyHeaderProps = {
  title: string;
  subtitle?: string;
  onClose: () => void;
  onSave: () => void;
  saveDisabled?: boolean;
  saveLabel?: string;
  closeLabel?: string;
  saveTextMode?: boolean;
};

export function SheetStickyHeader({
  title,
  subtitle,
  onClose,
  onSave,
  saveDisabled = false,
  saveLabel = "Save",
  closeLabel,
  saveTextMode = false,
}: SheetStickyHeaderProps) {
  return (
    <View
      className="bg-white px-4 pb-2.5 pt-1"
      style={{ borderBottomWidth: 1, borderBottomColor: "#F3F4F6" }}
    >
      <View className="h-11 flex-row items-center justify-between">
        {closeLabel ? (
          <Pressable onPress={onClose} hitSlop={8} className="h-10 justify-center px-1">
            <Text className="text-[15px] font-semibold text-[#6B7280]">{closeLabel}</Text>
          </Pressable>
        ) : (
          <HeaderIconButton onPress={onClose} accessibilityLabel="Go back">
            <ChevronLeft size={22} color="#374151" strokeWidth={2.3} />
          </HeaderIconButton>
        )}

        <View className="absolute left-14 right-14 items-center">
          <Text className="text-[16px] font-bold text-[#111827]" numberOfLines={1}>
            {title}
          </Text>
        </View>

        {saveTextMode ? (
          <Pressable
            onPress={onSave}
            disabled={saveDisabled}
            accessibilityRole="button"
            accessibilityLabel={saveLabel}
            hitSlop={8}
            className="h-10 justify-center px-1"
            style={{ opacity: saveDisabled ? 0.45 : 1 }}
          >
            <Text className="text-[16px] font-semibold text-[#16A34A]">{saveLabel}</Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={onSave}
            disabled={saveDisabled}
            accessibilityRole="button"
            accessibilityLabel={saveLabel}
            hitSlop={8}
            className="h-10 min-w-[56px] items-center justify-center rounded-full bg-[#F0FDF4] px-4"
            style={{ opacity: saveDisabled ? 0.45 : 1 }}
          >
            <Text className="text-[14px] font-bold text-[#16A34A]">{saveLabel}</Text>
          </Pressable>
        )}
      </View>
      {subtitle ? (
        <Text className="px-1 pt-1 text-[12px] text-[#6B7280]">{subtitle}</Text>
      ) : null}
    </View>
  );
}

function HeaderIconButton({
  onPress,
  accessibilityLabel,
  children,
}: {
  onPress: () => void;
  accessibilityLabel: string;
  children: ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      className="h-10 w-10 items-center justify-center rounded-full bg-[#F3F4F6]"
    >
      {children}
    </Pressable>
  );
}

type SheetHandleChromeProps = {
  children: ReactNode;
};

export function SheetHandleChrome({ children }: SheetHandleChromeProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.bar} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: "#FFFFFF",
    width: "100%",
  },
  bar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D1D5DB",
    marginTop: 10,
    marginBottom: 4,
    alignSelf: "center",
  },
});
