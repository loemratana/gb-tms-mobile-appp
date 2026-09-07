import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import Constants from "expo-constants";
import { router } from "expo-router";

import { useAuthStore } from "@/stores/authStore";
import {
  clearAuthStorage,
  getAuthToken,
  getRefreshToken,
  setAuthToken,
  setRefreshToken,
} from "@/utils/storage";

/** Envelope every task-management-api response is wrapped in. */
export type ApiEnvelope<T> = {
  status?: string;
  message: string;
  success: boolean;
  data: T;
  metadata?: unknown;
  timestamp: string;
};

/** Shape of the response body on a non-2xx task-management-api error. */
export type ApiErrorResponse = {
  success: false;
  status: number;
  error: string;
  message: string;
  path: string;
  timestamp: string;
  fieldErrors?: { field: string; message: string }[];
};

/**
 * In development, derive the API host from the same LAN address the phone
 * used to reach the Metro bundler — `localhost` in extra.apiUrl only works
 * on web/iOS Simulator, not on a physical device or Android emulator.
 */
function resolveApiUrl(): string {
  if (__DEV__) {
    const hostUri =
      Constants.expoConfig?.hostUri ?? Constants.expoGoConfig?.debuggerHost;
    const devHost = hostUri?.split(":")[0];
    if (devHost) {
      return `http://${devHost}:8080/api/v1`;
    }
  }
  return (
    Constants.expoConfig?.extra?.apiUrl ?? "http://localhost:8080/api/v1"
  );
}

const API_URL = resolveApiUrl();

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  const token = await getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

type RetryableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

const AUTH_ENDPOINTS_NO_REFRESH = ["/auth/login", "/auth/refresh-token"];

/** In-flight refresh, shared by every request that 401s while it's running. */
let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  // Plain axios, not `api` — this must not go through the request/response
  // interceptors above (no stale Authorization header to attach, and no risk
  // of a failure here re-entering the 401 handler below).
  const { data } = await axios.post<{ data: { accessToken: string; refreshToken: string } }>(
    `${API_URL}/auth/refresh-token`,
    { refreshToken }
  );

  const tokens = data.data;
  await Promise.all([setAuthToken(tokens.accessToken), setRefreshToken(tokens.refreshToken)]);
  useAuthStore.setState({ token: tokens.accessToken });

  return tokens.accessToken;
}

function forceSignOut(): void {
  void clearAuthStorage();
  useAuthStore.setState({ token: null, user: null });
  router.replace("/auth/sign-in");
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;
    const isAuthEndpoint = AUTH_ENDPOINTS_NO_REFRESH.some((path) =>
      originalRequest?.url?.includes(path)
    );

    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry || isAuthEndpoint) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      refreshPromise ??= refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
      const newToken = await refreshPromise;

      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      forceSignOut();
      return Promise.reject(refreshError);
    }
  }
);
