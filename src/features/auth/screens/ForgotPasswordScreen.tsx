import Ionicons from "@expo/vector-icons/Ionicons";
import { StatusBar } from "expo-status-bar";
import { Controller } from "react-hook-form";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { useForgotPasswordForm } from "@/features/auth/hooks/useForgotPasswordForm";
import { colors } from "@/styles/colors";

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();
  const {
    step,
    email,
    formError,
    isSubmitting,
    emailForm,
    resetForm,
    handleSendCode,
    handleResend,
    handleReset,
    handleChangeEmail,
    handleBack,
  } = useForgotPasswordForm();

  const isEmailStep = step === "email";

  return (
    <View className="flex-1 bg-surface">
      <StatusBar style="auto" />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingTop: insets.top + 12,
            paddingBottom: insets.bottom + 24,
            paddingHorizontal: 24,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Pressable
            onPress={handleBack}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Back to sign in"
            className="h-10 w-10 items-center justify-center rounded-full bg-subtle"
          >
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </Pressable>

          <View className="mt-8 h-14 w-14 items-center justify-center rounded-2xl bg-brand-subtle">
            <Ionicons
              name={isEmailStep ? "key-outline" : "mail-open-outline"}
              size={26}
              color={colors.brand}
            />
          </View>

          <Text className="mt-5 font-sans text-[24px] font-bold text-fg">
            {isEmailStep ? "Forgot your password?" : "Check your email"}
          </Text>
          <Text className="mt-2 text-body text-fg-soft">
            {isEmailStep
              ? "Enter your work email and we'll send you a 6-digit code to reset it."
              : `If ${email} has an account, we sent a 6-digit code to it. It expires in 15 minutes.`}
          </Text>

          <View className="mt-8 gap-4">
            {isEmailStep ? (
              <Controller
                control={emailForm.control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextField
                    autoCorrect={false}
                    label="Email address"
                    icon="mail-outline"
                    placeholder="you@company.com"
                    keyboardType="email-address"
                    textContentType="emailAddress"
                    autoComplete="email"
                    autoCapitalize="none"
                    returnKeyType="send"
                    onSubmitEditing={handleSendCode}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={emailForm.formState.errors.email?.message}
                  />
                )}
              />
            ) : (
              <>
                <Controller
                  control={resetForm.control}
                  name="code"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextField
                      autoCapitalize="none"
                      autoCorrect={false}
                      label="Reset code"
                      icon="keypad-outline"
                      placeholder="6-digit code"
                      keyboardType="number-pad"
                      textContentType="oneTimeCode"
                      autoComplete="one-time-code"
                      maxLength={6}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={resetForm.formState.errors.code?.message}
                    />
                  )}
                />
                <Controller
                  control={resetForm.control}
                  name="newPassword"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextField
                      autoCapitalize="none"
                      autoCorrect={false}
                      label="New password"
                      icon="lock-closed-outline"
                      placeholder="At least 8 characters"
                      isPassword
                      textContentType="newPassword"
                      autoComplete="new-password"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={resetForm.formState.errors.newPassword?.message}
                    />
                  )}
                />
                <Controller
                  control={resetForm.control}
                  name="confirmPassword"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextField
                      autoCapitalize="none"
                      autoCorrect={false}
                      label="Confirm new password"
                      icon="lock-closed-outline"
                      placeholder="Repeat the new password"
                      isPassword
                      textContentType="newPassword"
                      returnKeyType="go"
                      onSubmitEditing={handleReset}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={resetForm.formState.errors.confirmPassword?.message}
                    />
                  )}
                />
              </>
            )}
          </View>

          {formError ? (
            <View
              accessibilityRole="alert"
              className="mt-4 flex-row items-center gap-2.5 rounded-xl border border-error-border bg-error-subtle px-4 py-3"
            >
              <Ionicons name="alert-circle" size={18} color={colors.danger} />
              <Text className="flex-1 text-caption font-medium text-error">{formError}</Text>
            </View>
          ) : null}

          <View className="mt-6">
            <Button
              label={isEmailStep ? "Send code" : "Reset password"}
              onPress={isEmailStep ? handleSendCode : handleReset}
              isLoading={isSubmitting}
              isFullWidth
            />
          </View>

          {isEmailStep ? null : (
            <View className="mt-4 flex-row items-center justify-center gap-6">
              <Pressable onPress={handleResend} hitSlop={8} accessibilityRole="button" disabled={isSubmitting}>
                <Text className="text-caption font-semibold text-brand-strong">Resend code</Text>
              </Pressable>
              <Pressable onPress={handleChangeEmail} hitSlop={8} accessibilityRole="button">
                <Text className="text-caption font-semibold text-fg-soft">Use another email</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
