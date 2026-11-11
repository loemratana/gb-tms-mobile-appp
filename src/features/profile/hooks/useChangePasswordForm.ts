import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useState } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";

import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from "@/features/profile/schemas/changePassword.schema";
import { getApiErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";

const EMPTY_VALUES: ChangePasswordFormValues = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

type ChangePasswordForm = {
  form: UseFormReturn<ChangePasswordFormValues>;
  isSaving: boolean;
  saveError: string | null;
  canSave: boolean;
  clear: () => void;
  /** Resolves true when the password was changed. */
  save: () => Promise<boolean>;
};

/** Change-password form; the auth store handles the request and the session it leaves behind. */
export function useChangePasswordForm(): ChangePasswordForm {
  const changePassword = useAuthStore((state) => state.changePassword);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    mode: "onChange",
    defaultValues: EMPTY_VALUES,
  });

  const clear = useCallback(() => {
    form.reset(EMPTY_VALUES);
    setSaveError(null);
  }, [form]);

  const submit = async (values: ChangePasswordFormValues): Promise<boolean> => {
    setIsSaving(true);
    setSaveError(null);
    try {
      await changePassword({ currentPassword: values.currentPassword, newPassword: values.newPassword });
      form.reset(EMPTY_VALUES);
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

  return {
    form,
    isSaving,
    saveError,
    canSave: form.formState.isValid && !isSaving,
    clear,
    save,
  };
}
