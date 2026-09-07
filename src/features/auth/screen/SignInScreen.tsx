import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { AuthInput } from "@/features/auth/components/AuthInput";
import { getDashboardPathForRole } from "@/features/auth/helpers/navigation";
import {
  signInSchema,
  type SignInFormValues,
} from "@/features/auth/schemas/signInSchema";
import { useAuthStore } from "@/stores/authStore";

const LOGO = require("../../../assets/images/logo/logo.png");

export default function SignInScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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

  // Hide the top-level sign-in error once a field-level validation error is
  // showing, instead of syncing it away via an effect.
  const displayedFormError = errors.email || errors.password ? null : formError;

  const onSubmit = async (values: SignInFormValues) => {
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
    Alert.alert(
      "Forgot Password",
      "Password reset will be available soon. Contact your administrator."
    );
  };

  return (
    <LinearGradient
      colors={["#F0FDF4", "#F3F4F6", "#EFF6FF"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingTop: insets.top + 24,
            paddingBottom: insets.bottom + 24,
            paddingHorizontal: 24,
            justifyContent: "center",
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View className="mb-8 items-center">
            <Image
              source={LOGO}
              accessibilityLabel="Task Management logo"
              contentFit="contain"
              style={{
                width: 240,
                height: 140,
                marginBottom: 12,
              }}
            />
            <Text className="text-[13px] font-semibold tracking-[2px] text-[#6B7280]">
              TASK MANAGEMENT
            </Text>
          </View>

          {/* Login card */}
          <View
            className="rounded-2xl border border-white/80 bg-white/90 p-6"
            style={{
              shadowColor: "#0F172A",
              shadowOffset: { width: 0, height: 16 },
              shadowOpacity: 0.08,
              shadowRadius: 32,
              elevation: 6,
            }}
          >
            <Text className="text-[26px] font-bold tracking-tight text-[#111827]">
              Welcome Back 👋
            </Text>
            <Text className="mt-1.5 text-[15px] text-[#6B7280]">
              Sign in to continue
            </Text>

            <View className="mt-7 gap-4">
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AuthInput
                    label="Email"
                    placeholder="you@company.com"
                    keyboardType="email-address"
                    textContentType="emailAddress"
                    autoComplete="email"
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
                  <AuthInput
                    label="Password"
                    placeholder="Enter your password"
                    isPassword
                    textContentType="password"
                    autoComplete="password"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.password?.message}
                  />
                )}
              />
            </View>

            {displayedFormError ? (
              <View className="mt-4 rounded-xl bg-[#FEF2F2] px-4 py-3">
                <Text className="text-center text-[13px] font-medium text-[#EF4444]">
                  {displayedFormError}
                </Text>
              </View>
            ) : null}

            <Pressable
              onPress={handleSubmit(onSubmit)}
              disabled={isSigningIn}
              accessibilityRole="button"
              accessibilityLabel="Sign in"
              className={`mt-6 h-[52px] items-center justify-center rounded-xl bg-[#32CD32] ${
                isSigningIn ? "opacity-70" : ""
              }`}
              style={({ pressed }) => [
                {
                  transform: [{ scale: pressed && !isSigningIn ? 0.98 : 1 }],
                  shadowColor: "#32CD32",
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.3,
                  shadowRadius: 12,
                  elevation: 4,
                },
              ]}
            >
              {isSigningIn ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text className="text-[16px] font-semibold text-white">
                  Sign In
                </Text>
              )}
            </Pressable>

            <Pressable
              onPress={handleForgotPassword}
              className="mt-5 items-center py-1"
              accessibilityRole="button"
            >
              <Text className="text-[14px] font-medium text-[#6B7280]">
                Forgot Password?
              </Text>
            </Pressable>
          </View>

          <Text className="mt-8 text-center text-[12px] text-[#9CA3AF]">
            Secure access to your workspace
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
