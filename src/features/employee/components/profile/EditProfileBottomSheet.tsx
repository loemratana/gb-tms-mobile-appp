import {
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, componentRadius, palette, shadows } from "@/constants/theme";
import { useSheetBackdrop } from "@/features/components/ui/BottomSheet";
import { AvatarPickerField } from "@/features/employee/components/profile/AvatarPickerField";
import { FormField } from "@/features/employee/components/profile/FormField";
import { toProfileUser } from "@/features/employee/data/profile";
import {
  editProfileSchema,
  type EditProfileFormValues,
} from "@/features/employee/schemas/editProfileSchema";
import { useCurrentUser } from "@/features/users/hooks/useUsers";
import {
  useUpdateUser,
  useUploadUserAvatar,
} from "@/features/users/hooks/useUserMutations";
import { useProfileStore } from "@/stores/profileStore";

export type EditProfileBottomSheetRef = {
  present: () => void;
  dismiss: () => void;
};

function SheetHeader() {
  return (
    <View style={styles.headerWrap}>
      <View style={styles.header}>
        <View style={styles.handleBar} />
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <Text style={styles.headerSubtitle}>Update your account details</Text>
      </View>
    </View>
  );
}

export const EditProfileBottomSheet = forwardRef<EditProfileBottomSheetRef>(
  function EditProfileBottomSheet(_, ref) {
    const sheetRef = useRef<BottomSheetModal>(null);
    const insets = useSafeAreaInsets();
    const { data: currentUser } = useCurrentUser();
    const setProfileUser = useProfileStore((s) => s.setUser);
    const [saving, setSaving] = useState(false);

    const userId = currentUser?.id ?? "";
    const updateUserMutation = useUpdateUser(userId);
    const uploadAvatarMutation = useUploadUserAvatar(userId);

    const snapPoints = useMemo(() => ["75%"], []);

    const profile = useMemo(
      () => (currentUser ? toProfileUser(currentUser) : null),
      [currentUser]
    );

    const {
      control,
      handleSubmit,
      reset,
      formState: { errors, isDirty, isValid },
    } = useForm<EditProfileFormValues>({
      resolver: zodResolver(editProfileSchema),
      mode: "onChange",
      defaultValues: {
        name: profile?.name ?? "",
        email: profile?.email ?? "",
        avatarUrl: profile?.avatarUrl ?? "",
      },
    });

    const syncForm = useCallback(() => {
      if (!profile) return;
      reset({
        name: profile.name,
        email: profile.email,
        avatarUrl: profile.avatarUrl,
      });
    }, [reset, profile]);

    const dismiss = useCallback(() => {
      sheetRef.current?.dismiss();
    }, []);

    useImperativeHandle(ref, () => ({
      present: () => {
        syncForm();
        sheetRef.current?.present();
      },
      dismiss,
    }));

    useEffect(() => {
      syncForm();
    }, [syncForm]);

    const renderBackdrop = useSheetBackdrop();

    const onSubmit = async (values: EditProfileFormValues) => {
      if (!currentUser) return;
      setSaving(true);

      try {
        let latest = currentUser;

        // A freshly-picked photo is a local file uri, different from the
        // persisted avatarUrl — upload it first via the dedicated endpoint.
        if (values.avatarUrl && values.avatarUrl !== currentUser.avatarUrl) {
          latest = await uploadAvatarMutation.mutateAsync({
            uri: values.avatarUrl,
            name: `avatar-${currentUser.id}.jpg`,
            type: "image/jpeg",
          });
        }

        const trimmedName = values.name.trim();
        const trimmedEmail = values.email.trim();
        const nameChanged = trimmedName !== currentUser.fullName;
        const emailChanged = trimmedEmail !== currentUser.email;

        if (nameChanged || emailChanged) {
          latest = await updateUserMutation.mutateAsync({
            fullName: nameChanged ? trimmedName : undefined,
            email: emailChanged ? trimmedEmail : undefined,
          });
        }

        setProfileUser(toProfileUser(latest));
        dismiss();
        Alert.alert("Profile updated", "Your changes have been saved.");
      } catch {
        Alert.alert("Error", "Could not save your profile. Please try again.");
      } finally {
        setSaving(false);
      }
    };

    const canSave = isDirty && isValid && !saving && Boolean(currentUser);

    return (
      <BottomSheetModal
        ref={sheetRef}
        snapPoints={snapPoints}
        enablePanDownToClose
        enableDynamicSizing={false}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
        backdropComponent={renderBackdrop}
        handleComponent={SheetHeader}
        backgroundStyle={styles.sheetBackground}
      >
        <BottomSheetScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 8,
            paddingBottom: Math.max(insets.bottom, 16) + 16,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Controller
            control={control}
            name="avatarUrl"
            render={({ field: { value, onChange } }) => (
              <AvatarPickerField
                uri={value}
                onChange={onChange}
                error={errors.avatarUrl?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="name"
            render={({ field: { value, onChange, onBlur } }) => (
              <FormField
                label="Full Name"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.name?.message}
                placeholder="Enter your full name"
                autoCapitalize="words"
                bottomSheet
              />
            )}
          />

          <Controller
            control={control}
            name="email"
            render={({ field: { value, onChange, onBlur } }) => (
              <FormField
                label="Email"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.email?.message}
                placeholder="name@company.com"
                keyboardType="email-address"
                autoCapitalize="none"
                bottomSheet
              />
            )}
          />

          {/* Role and department are assigned by an admin, not self-editable. */}
          <FormField
            label="Role"
            value={profile?.role ?? ""}
            onChangeText={() => {}}
            editable={false}
            bottomSheet
          />

          <FormField
            label="Department"
            value={profile?.department || "Not assigned"}
            onChangeText={() => {}}
            editable={false}
            bottomSheet
          />

          <Pressable
            onPress={handleSubmit(onSubmit)}
            disabled={!canSave}
            accessibilityRole="button"
            className="mt-2 items-center justify-center rounded-2xl py-4"
            style={{
              backgroundColor: canSave ? "#32CD32" : "#A7F3A7",
            }}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-[16px] font-semibold text-white">
                Save Changes
              </Text>
            )}
          </Pressable>
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  }
);

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: colors.card,
    borderTopLeftRadius: componentRadius.sheet,
    borderTopRightRadius: componentRadius.sheet,
    ...Platform.select(shadows.xl),
  },
  headerWrap: {
    backgroundColor: colors.card,
    borderTopLeftRadius: componentRadius.sheet,
    borderTopRightRadius: componentRadius.sheet,
    zIndex: 10,
    ...Platform.select(shadows.md),
  },
  header: {
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 14,
    paddingHorizontal: 20,
    backgroundColor: colors.card,
    borderTopLeftRadius: componentRadius.sheet,
    borderTopRightRadius: componentRadius.sheet,
  },
  handleBar: {
    width: 44,
    height: 5,
    borderRadius: componentRadius.sheetHandle,
    backgroundColor: palette.gray[300],
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  headerSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: colors.textMuted,
  },
});
