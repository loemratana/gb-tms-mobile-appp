import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useState } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";

import { editProfileSchema, type EditProfileFormValues } from "@/features/profile/schemas/editProfile.schema";
import { toProfileUser } from "@/features/profile/utils/profile";
import { useUpdateUser, useUploadUserAvatar } from "@/features/users/hooks/useUserMutations";
import { useCurrentUser } from "@/features/users/hooks/useUsers";
import type { UserResponse, UserUpdateRequest } from "@/features/users/types/user.types";
import { getApiErrorMessage } from "@/lib/api";
import { useProfileStore } from "@/stores/profileStore";

type EditProfileForm = {
  form: UseFormReturn<EditProfileFormValues>;
  currentUser: UserResponse | undefined;
  isSaving: boolean;
  /** Message from the last failed save, shown in the sheet. */
  saveError: string | null;
  canSave: boolean;
  /** Fills the form from the latest profile and clears any old error — call when the sheet opens. */
  resetFromProfile: () => void;
  /** Resolves true when the profile was saved. */
  save: () => Promise<boolean>;
};

function toFormValues(user: UserResponse | undefined): EditProfileFormValues {
  return {
    name: user?.fullName ?? "",
    email: user?.email ?? "",
    phoneNumber: user?.phoneNumber ?? "",
    avatarUrl: user?.avatarUrl ?? "",
  };
}

/** Edit-profile form: validation, photo upload, then a partial PUT /users/{id} with only the changed fields. */
export function useEditProfileForm(): EditProfileForm {
  const { data: currentUser } = useCurrentUser();
  const setProfileUser = useProfileStore((state) => state.setUser);
  const userId = currentUser?.id ?? "";
  const updateUserMutation = useUpdateUser(userId);
  const uploadAvatarMutation = useUploadUserAvatar(userId);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const form = useForm<EditProfileFormValues>({
    resolver: zodResolver(editProfileSchema),
    mode: "onChange",
    defaultValues: toFormValues(currentUser),
  });

  const resetFromProfile = useCallback(() => {
    form.reset(toFormValues(currentUser));
    setSaveError(null);
  }, [form, currentUser]);

  const submit = async (values: EditProfileFormValues): Promise<boolean> => {
    if (!currentUser) return false;

    const name = values.name.trim();
    const email = values.email.trim();
    const phoneNumber = values.phoneNumber.trim();

    // The server only applies non-blank fields, so an existing number can't be removed from here.
    if (!phoneNumber && currentUser.phoneNumber) {
      setSaveError("Removing a phone number isn't supported yet. Enter a new number, or ask an admin to remove it.");
      return false;
    }

    setIsSaving(true);
    setSaveError(null);
    try {
      let latest = currentUser;

      // A freshly picked photo is a local file uri, different from the saved avatarUrl.
      if (values.avatarUrl && values.avatarUrl !== (currentUser.avatarUrl ?? "")) {
        latest = await uploadAvatarMutation.mutateAsync({
          uri: values.avatarUrl,
          name: `avatar-${currentUser.id}.jpg`,
          type: "image/jpeg",
        });
      }

      const changes: UserUpdateRequest = {};
      if (name !== currentUser.fullName) changes.fullName = name;
      if (email !== currentUser.email) changes.email = email;
      if (phoneNumber && phoneNumber !== (currentUser.phoneNumber ?? "")) changes.phoneNumber = phoneNumber;
      if (Object.keys(changes).length > 0) {
        latest = await updateUserMutation.mutateAsync(changes);
      }

      setProfileUser(toProfileUser(latest));
      return true;
    } catch (error) {
      setSaveError(getApiErrorMessage(error));
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const save = () =>
    new Promise<boolean>((resolve) => {
      void form.handleSubmit(
        async (values) => resolve(await submit(values)),
        () => resolve(false),
      )();
    });

  const { isDirty, isValid } = form.formState;

  return {
    form,
    currentUser,
    isSaving,
    saveError,
    canSave: isDirty && isValid && !isSaving && Boolean(currentUser),
    resetFromProfile,
    save,
  };
}
