import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { useState } from "react";
import { type Control, type FieldErrors, useForm } from "react-hook-form";

import { getDashboardPathForRole } from "@/features/auth/utils/navigation";
import {
  signInSchema,
  type SignInFormValues,
} from "@/features/auth/schemas/signIn.schema";
import { useAuthStore } from "@/stores/authStore";

type SignInForm = {
  control: Control<SignInFormValues>;
  errors: FieldErrors<SignInFormValues>;
  formError: string | null;
  isSigningIn: boolean;
  handleSubmit: () => void;
  handleForgotPassword: () => void;
};

export function useSignInForm(): SignInForm {
  const router = useRouter();
  const signIn = useAuthStore((s) => s.signIn);
  const isSigningIn = useAuthStore((s) => s.isSigningIn);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const submit = async (values: SignInFormValues) => {
    setFormError(null);

    try {
      const user = await signIn(values);
      router.replace(getDashboardPathForRole(user.role));
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Unable to sign in."
      );
    }
  };

  const handleForgotPassword = () => {
    router.push("/auth/forgot-password");
  };

  return {
    control,
    errors,
    // Hide the top-level sign-in error once a field-level validation error is
    // showing, instead of syncing it away via an effect.
    formError: errors.email || errors.password ? null : formError,
    isSigningIn,
    handleSubmit: () => {
      if (!isSigningIn) void handleSubmit(submit)();
    },
    handleForgotPassword,
  };
}
