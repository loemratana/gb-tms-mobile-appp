import { BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { forwardRef, useImperativeHandle, useMemo, useRef } from "react";
import { Controller } from "react-hook-form";
import { Alert, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  SheetHeader,
  sheetBackgroundStyle,
  sheetHandleIndicatorStyle,
  useSheetBackdrop,
} from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { AvatarPickerField } from "./AvatarPickerField";
import { useEditProfileForm } from "@/features/profile/hooks/useEditProfileForm";

export type EditProfileBottomSheetRef = {
  present: () => void;
  dismiss: () => void;
};

/** Edit name, email, phone and photo. Role, position and department are set by an admin. */
export const EditProfileBottomSheet = forwardRef<EditProfileBottomSheetRef>(function EditProfileBottomSheet(_, ref) {
  const sheetRef = useRef<BottomSheetModal>(null);
  const insets = useSafeAreaInsets();
  const snapPoints = useMemo(() => ["85%"], []);
  const { form, isSaving, saveError, canSave, resetFromProfile, save } = useEditProfileForm();
  const renderBackdrop = useSheetBackdrop(!isSaving);
  const {
    control,
    watch,
    formState: { errors },
  } = form;

  useImperativeHandle(ref, () => ({
    present: () => {
      resetFromProfile();
      sheetRef.current?.present();
    },
    dismiss: () => sheetRef.current?.dismiss(),
  }));

  const handleSave = async () => {
    const isSaved = await save();
    if (isSaved) {
      sheetRef.current?.dismiss();
      Alert.alert("Profile updated", "Your changes have been saved.");
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
    >
      <BottomSheetScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: Math.max(insets.bottom, 16) + 16 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <SheetHeader
          title="Edit profile"
          subtitle="Update your name, contact details and photo"
          onClose={isSaving ? undefined : () => sheetRef.current?.dismiss()}
        />

        <Controller
          control={control}
          name="avatarUrl"
          render={({ field: { value, onChange } }) => (
            <AvatarPickerField uri={value} name={watch("name")} onChange={onChange} error={errors.avatarUrl?.message} />
          )}
        />

        <Controller
          control={control}
          name="name"
          render={({ field: { value, onChange, onBlur } }) => (
            <View className="mb-4">
              <TextField
                label="Full name"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.name?.message}
                placeholder="Enter your full name"
                autoCapitalize="words"
                isInBottomSheet
              />
            </View>
          )}
        />

        <Controller
          control={control}
          name="email"
          render={({ field: { value, onChange, onBlur } }) => (
            <View className="mb-4">
              <TextField
                label="Email"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.email?.message}
                placeholder="name@company.com"
                keyboardType="email-address"
                autoCapitalize="none"
                isInBottomSheet
              />
            </View>
          )}
        />

        <Controller
          control={control}
          name="phoneNumber"
          render={({ field: { value, onChange, onBlur } }) => (
            <View className="mb-4">
              <TextField
                label="Phone number"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.phoneNumber?.message}
                placeholder="+855 12 345 678"
                keyboardType="phone-pad"
                autoCapitalize="none"
                isInBottomSheet
              />
            </View>
          )}
        />

        {saveError ? (
          <View className="mb-4 rounded-xl bg-error-subtle px-3 py-2.5" accessibilityLiveRegion="polite">
            <Text className="text-caption text-error-fg">{saveError}</Text>
          </View>
        ) : null}

        <Button label="Save changes" isLoading={isSaving} disabled={!canSave} onPress={() => void handleSave()} />
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});
