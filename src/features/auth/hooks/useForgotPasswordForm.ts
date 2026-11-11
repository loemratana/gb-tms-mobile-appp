import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Alert } from "react-native";

import {
  requestResetSchema,
  resetPasswordSchema,
  type RequestResetFormValues,
  type ResetPasswordFormValues,
} from "@/features/auth/schemas/forgotPassword.schema";
import { getApiErrorMessage } from "@/lib/api";
import { requestPasswordReset, resetPassword } from "@/services/auth.service";

export type ForgotPasswordStep = "email" | "reset";

/** Two steps: ask for the email (server emails a code), then enter the code and a new password. */
export function useForgotPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState<ForgotPasswordStep>("email");
  const [email, setEmail] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emailForm = useForm<RequestResetFormValues>({
    resolver: zodResolver(requestResetSchema),
    defaultValues: { email: "" },
  });

  const resetForm = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { code: "", newPassword: "", confirmPassword: "" },
  });

  const sendCode = async (values: RequestResetFormValues) => {
    setFormError(null);
    setIsSubmitting(true);
    try {
      await requestPasswordReset(values.email);
      setEmail(values.email);
      resetForm.reset();
      setStep("reset");
    } catch (error) {
      setFormError(getApiErrorMessage(error, "Couldn't send the code. Try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitReset = async (values: ResetPasswordFormValues) => {
    setFormError(null);
    setIsSubmitting(true);
    try {
      await resetPassword({ email, code: values.code, newPassword: values.newPassword });
      Alert.alert("Password reset", "Sign in with your new password.", [
        { text: "Sign in", onPress: () => router.replace("/auth/sign-in") },
      ]);
    } catch (error) {
      setFormError(getApiErrorMessage(error, "Couldn't reset your password. Try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    step,
    email,
    formError,
    isSubmitting,
    emailForm,
    resetForm,
    handleSendCode: () => {
      if (!isSubmitting) void emailForm.handleSubmit(sendCode)();
    },
    handleResend: () => {
      if (!isSubmitting) void sendCode({ email });
    },
    handleReset: () => {
      if (!isSubmitting) void resetForm.handleSubmit(submitReset)();
    },
    handleChangeEmail: () => {
      setFormError(null);
      setStep("email");
    },
    handleBack: () => router.back(),
  };
}
