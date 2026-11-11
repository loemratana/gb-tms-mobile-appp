import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { Controller } from "react-hook-form";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { TextField } from "@/components/ui/TextField";
import { useSignInForm } from "@/features/auth/hooks/useSignInForm";
import { colors, palette } from "@/styles/colors";

const LOGO = require("../../../../assets/images/logo.png");

export default function SignInScreen() {
  const insets = useSafeAreaInsets();
  const {
    control,
    errors,
    formError,
    isSigningIn,
    handleSubmit,
    handleForgotPassword,
  } = useSignInForm();

  return (
    <View className="flex-1 bg-surface">
      <StatusBar style="light" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Hero */}
          <LinearGradient
            colors={[palette.blue[500], palette.blue[700]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              paddingTop: insets.top + 32,
              paddingBottom: 72,
              paddingHorizontal: 24,
              overflow: "hidden",
            }}
          >
            {/* Decorative shapes */}
            <View className="absolute -right-16 -top-10 h-56 w-56 rounded-full bg-white/10" />
            <View className="absolute -left-10 bottom-4 h-32 w-32 rounded-full bg-white/10" />

            <View className="items-center">
              <View
                className="mb-6  px-6 py-4"
              >
                <Image
                  source={LOGO}
                  accessibilityLabel="Task Management logo"
                  contentFit="contain"
                  style={{ width: 150, height: 80 }}
                />
              </View>

              <Text className="text-[28px] font-bold tracking-tight text-white">
                Welcome back
              </Text>
              <Text className="mt-1.5 text-center text-body text-white/85">
                Sign in to manage your tasks and team
              </Text>
            </View>
          </LinearGradient>

          {/* Form sheet */}
          <View
            className="-mt-10 flex-1 rounded-t-[32px] bg-surface px-6 pt-8"
            style={{ paddingBottom: insets.bottom + 24 }}
          >
            <View className="mb-1 flex-row items-center gap-2">
              <Ionicons name="log-in-outline" size={16} color={colors.brand} />
              <Text className="text-label font-semibold uppercase tracking-[1.5px] text-fg-soft">
                Account login
              </Text>
            </View>
            <Text className="mb-6 text-[20px] font-bold text-fg">
              Sign in to your workspace
            </Text>

            <View className="gap-4">
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextField
                    autoCapitalize="none"
                    autoCorrect={false}
                    label="Email address"
                    icon="mail-outline"
                    placeholder="you@company.com"
                    keyboardType="email-address"
                    textContentType="emailAddress"
                    autoComplete="email"
                    returnKeyType="next"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.email?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextField
                    autoCapitalize="none"
                    autoCorrect={false}
                    label="Password"
                    icon="lock-closed-outline"
                    placeholder="Enter your password"
                    isPassword
                    textContentType="password"
                    autoComplete="password"
                    returnKeyType="go"
                    onSubmitEditing={handleSubmit}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.password?.message}
                  />
                )}
              />
            </View>

            <Pressable
              onPress={handleForgotPassword}
              hitSlop={8}
              accessibilityRole="button"
              className="mt-3 self-end py-1"
            >
              <Text className="text-caption font-semibold text-brand-strong">
                Forgot password?
              </Text>
            </Pressable>

            {formError ? (
              <View
                accessibilityRole="alert"
                className="mt-4 flex-row items-center gap-2.5 rounded-xl border border-error-border bg-error-subtle px-4 py-3"
              >
                <Ionicons name="alert-circle" size={18} color={colors.danger} />
                <Text className="flex-1 text-caption font-medium text-error">
                  {formError}
                </Text>
              </View>
            ) : null}

            <Pressable
              onPress={handleSubmit}
              disabled={isSigningIn}
              accessibilityRole="button"
              accessibilityLabel="Sign in"
              accessibilityState={{ disabled: isSigningIn, busy: isSigningIn }}
              className={`mt-6 h-[54px] flex-row items-center justify-center gap-2 rounded-2xl bg-brand ${isSigningIn ? "opacity-70" : ""
                }`}
              style={({ pressed }) => ({
                transform: [{ scale: pressed && !isSigningIn ? 0.98 : 1 }],
                shadowColor: colors.brand,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 14,
                elevation: 4,
              })}
            >
              {isSigningIn ? (
                <ActivityIndicator color={colors.textInverse} size="small" />
              ) : (
                <>
                  <Text className="text-headline font-semibold text-white">
                    Sign In
                  </Text>
                  <Ionicons
                    name="arrow-forward"
                    size={18}
                    color={colors.textInverse}
                  />
                </>
              )}
            </Pressable>

            {/* Footer */}
            <View className="mt-auto items-center pt-10">
              <View className="flex-row items-center gap-1.5 rounded-full bg-field px-3.5 py-2">
                <Ionicons
                  name="shield-checkmark-outline"
                  size={14}
                  color={palette.gray[500]}
                />
                <Text className="text-label font-medium text-fg-soft">
                  Secure access to your workspace
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
