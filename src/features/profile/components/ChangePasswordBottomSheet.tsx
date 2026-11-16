import { BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { forwardRef, useImperativeHandle, useMemo, useRef } from "react";
import { Controller } from "react-hook-form";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  SheetHeader,
  sheetBackgroundStyle,
  sheetHandleIndicatorStyle,
  useSheetBackdrop,
} from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { useChangePasswordForm } from "@/features/profile/hooks/useChangePasswordForm";
import type { ChangePasswordFormValues } from "@/features/profile/schemas/changePassword.schema";
import { toast } from "@/stores/toastStore";

export type ChangePasswordBottomSheetRef = {
  present: () => void;
  dismiss: () => void;
};

const FIELDS: {
  name: keyof ChangePasswordFormValues;
  label: string;
  placeholder: string;
  isNew: boolean;
}[] = [
  { name: "currentPassword", label: "Current password", placeholder: "Enter your current password", isNew: false },
  { name: "newPassword", label: "New password", placeholder: "At least 8 characters", isNew: true },
  { name: "confirmPassword", label: "Confirm new password", placeholder: "Re-enter the new password", isNew: true },
];

export const ChangePasswordBottomSheet = forwardRef<ChangePasswordBottomSheetRef>(function ChangePasswordBottomSheet(_, ref) {
  const sheetRef = useRef<BottomSheetModal>(null);
  const insets = useSafeAreaInsets();
  const snapPoints = useMemo(() => ["75%"], []);
  const { form, isSaving, saveError, canSave, clear, save } = useChangePasswordForm();
  const renderBackdrop = useSheetBackdrop(!isSaving);
  const {
    control,
    formState: { errors },
  } = form;

  useImperativeHandle(ref, () => ({
    present: () => {
      clear();
      sheetRef.current?.present();
    },
    dismiss: () => sheetRef.current?.dismiss(),
  }));

  const handleSave = async () => {
    const isSaved = await save();
    if (isSaved) {
      sheetRef.current?.dismiss();
      toast.success("Password changed", "Your password was updated. Any other devices have been signed out.");
    }
  };

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={snapPoints}
      enablePanDownToClose={!isSaving}
      enableDynamicSizing={false}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      backdropComponent={renderBackdrop}
      backgroundStyle={sheetBackgroundStyle}
      handleIndicatorStyle={sheetHandleIndicatorStyle}
      onDismiss={clear}
    >
      <BottomSheetScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: Math.max(insets.bottom, 16) + 16 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <SheetHeader
          title="Change password"
          subtitle="You'll stay signed in on this device"
          onClose={isSaving ? undefined : () => sheetRef.current?.dismiss()}
        />

        {FIELDS.map((field) => (
          <Controller
            key={field.name}
            control={control}
            name={field.name}
            render={({ field: { value, onChange, onBlur } }) => (
              <View className="mb-4">
                <TextField
                  label={field.label}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors[field.name]?.message}
                  placeholder={field.placeholder}
                  autoCapitalize="none"
                  isPassword
                  textContentType={field.isNew ? "newPassword" : "password"}
                  autoComplete={field.isNew ? "new-password" : "current-password"}
                  isInBottomSheet
                />
              </View>
            )}
          />
        ))}

        <Text className="mb-4 text-label text-fg-soft">Changing your password signs you out on all other devices.</Text>

        {saveError ? (
          <View className="mb-4 rounded-xl bg-error-subtle px-3 py-2.5" accessibilityLiveRegion="polite">
            <Text className="text-caption text-error-fg">{saveError}</Text>
          </View>
        ) : null}

        <Button label="Update password" isLoading={isSaving} disabled={!canSave} onPress={() => void handleSave()} />
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});
