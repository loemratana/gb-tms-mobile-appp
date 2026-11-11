import { create } from "zustand";

import { queryClient } from "@/config/query.config";
import type { AuthUser, LoginCredentials } from "@/features/auth/types/auth.types";
import { syncProfileFromAuthUser } from "@/features/auth/utils/syncProfile";
import { getApiErrorMessage } from "@/lib/api";
import { defaultProfileUser } from "@/features/profile/utils/profile";
import {
  registerForPushNotifications,
  unregisterPushNotifications,
} from "@/lib/pushNotifications";
import {
  changePassword as changePasswordApi,
  login as loginApi,
  logout as logoutApi,
  logoutAll as logoutAllApi,
  toAuthUser,
  type ChangePasswordInput,
  type UserProfile,
} from "@/services/auth.service";
import { useNotificationStore } from "./notificationStore";
import { useProfileStore } from "./profileStore";
import {
  clearAuthStorage,
  getAuthToken,
  getAuthUser,
  getRefreshToken,
  setAuthToken,
  setAuthUser,
  setRefreshToken,
} from "@/lib/storage";

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  isHydrated: boolean;
  isSigningIn: boolean;
  hydrate: () => Promise<void>;
  signIn: (credentials: LoginCredentials) => Promise<AuthUser>;
  /**
   * `allDevices` also ends this account's sessions on every other device.
   * `sessionExpired` skips all server calls (the session is already dead) and only cleans up locally.
   */
  signOut: (options?: { allDevices?: boolean; sessionExpired?: boolean }) => Promise<void>;
  /** Other devices are signed out; this one keeps going on the new tokens. Throws the API error. */
  changePassword: (input: ChangePasswordInput) => Promise<void>;
  /**
   * Applies a fresh GET /users/me to the session, so a role/name/avatar change made by an admin
   * takes effect without signing out (the route guards follow `user.role`).
   */
  syncFromProfile: (profile: UserProfile) => void;
};

function sameAuthUser(a: AuthUser, b: AuthUser): boolean {
  return a.id === b.id && a.role === b.role && a.name === b.name
    && a.email === b.email && a.avatarUrl === b.avatarUrl;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  isHydrated: false,
  isSigningIn: false,

  syncFromProfile: (profile) => {
    const current = get().user;
    // Ignore responses that arrive after sign-out or belong to a previous account.
    if (!current || current.id !== profile.id) return;

    const next = toAuthUser(profile);
    if (sameAuthUser(current, next)) return;

    set({ user: next });
    syncProfileFromAuthUser(next);
    void setAuthUser(next);
  },

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
      throw new Error(getApiErrorMessage(error, "Unable to sign in."));
    } finally {
      set({ isSigningIn: false });
    }
  },

  changePassword: async (input) => {
    const { accessToken, refreshToken } = await changePasswordApi(input);
    // The old refresh token was revoked server-side, so the new pair must replace it.
    await Promise.all([setAuthToken(accessToken), setRefreshToken(refreshToken)]);
    set({ token: accessToken });
  },

  signOut: async (options) => {
    const sessionExpired = options?.sessionExpired === true;
    try {
      if (!sessionExpired) {
        // Push unregister needs a valid session, so it runs before logout revokes it.
        await unregisterPushNotifications();
        await (options?.allDevices ? logoutAllApi() : logoutApi(await getRefreshToken()));
      }
    } catch {
      // Local sign-out still succeeds even if the server call fails.
    } finally {
      if (sessionExpired) {
        await unregisterPushNotifications({ localOnly: true });
      }
      await clearAuthStorage();
      set({ token: null, user: null });
      useNotificationStore.getState().reset();
      useProfileStore.getState().setUser(defaultProfileUser);
      queryClient.clear();
    }
  },
}));
