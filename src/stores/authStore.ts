import { create } from "zustand";

import { queryClient } from "@/config/query.config";
import type { AuthUser, LoginCredentials } from "@/features/auth/types/auth";
import { syncProfileFromAuthUser } from "@/features/auth/helpers/syncProfile";
import { defaultProfileUser } from "@/features/employee/data/profile";
import {
  registerForPushNotifications,
  unregisterPushNotifications,
} from "@/lib/pushNotifications";
import { login as loginApi, logout as logoutApi } from "@/services/auth.service";
import { useNotificationStore } from "@/stores/notificationStore";
import { useProfileStore } from "@/stores/profileStore";
import {
  clearAuthStorage,
  getAuthToken,
  getAuthUser,
  setAuthToken,
  setAuthUser,
  setRefreshToken,
} from "@/utils/storage";

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  isHydrated: boolean;
  isSigningIn: boolean;
  hydrate: () => Promise<void>;
  signIn: (credentials: LoginCredentials) => Promise<AuthUser>;
  signOut: () => Promise<void>;
};

function getErrorMessage(error: unknown): string {
  if (
    error &&
    typeof error === "object" &&
    "response" in error &&
    error.response &&
    typeof error.response === "object" &&
    "data" in error.response
  ) {
    const data = error.response.data as { message?: string };
    if (data.message) return data.message;
  }

  if (error instanceof Error) return error.message;

  return "Something went wrong. Please try again.";
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isHydrated: false,
  isSigningIn: false,

  hydrate: async () => {
    try {
      const [token, user] = await Promise.all([getAuthToken(), getAuthUser<AuthUser>()]);

      if (token && user) {
        set({ token, user });
        syncProfileFromAuthUser(user);
        void useNotificationStore.getState().fetchAll();
        void registerForPushNotifications();
      }
    } finally {
      set({ isHydrated: true });
    }
  },

  signIn: async (credentials) => {
    set({ isSigningIn: true });

    try {
      const { accessToken, refreshToken, user } = await loginApi(credentials);

      await Promise.all([
        setAuthToken(accessToken),
        setRefreshToken(refreshToken),
        setAuthUser(user),
      ]);
      // Drop any cached data fetched under the previous session (e.g. a prior
      // account's /users/me) before anything re-mounts and reads stale data.
      queryClient.clear();
      set({ token: accessToken, user });
      syncProfileFromAuthUser(user, credentials.email);
      void useNotificationStore.getState().fetchAll();
      void registerForPushNotifications();

      return user;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    } finally {
      set({ isSigningIn: false });
    }
  },

  signOut: async () => {
    try {
      await logoutApi();
    } catch {
      // Local sign-out still succeeds even if the server call fails.
    } finally {
      await unregisterPushNotifications();
      await clearAuthStorage();
      set({ token: null, user: null });
      useNotificationStore.getState().reset();
      useProfileStore.getState().setUser(defaultProfileUser);
      queryClient.clear();
    }
  },
}));
