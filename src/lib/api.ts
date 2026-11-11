import axios, { AxiosError, isAxiosError, type InternalAxiosRequestConfig } from "axios";
import { router } from "expo-router";

import { env } from "@/config/env";
import { useAuthStore } from "@/stores/authStore";
import {
  getAuthToken,
  getRefreshToken,
  setAuthToken,
  setRefreshToken,
} from "./storage";

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

const DEFAULT_ERROR_MESSAGE = "Something went wrong. Please try again.";

/**
 * Turns any thrown value into a message that is safe to show the user, so UI
 * code never has to understand Axios error shapes.
 */
export function getApiErrorMessage(error: unknown, fallback = DEFAULT_ERROR_MESSAGE): string {
  if (isAxiosError<ApiErrorResponse>(error)) {
    const serverMessage = error.response?.data?.message;
    if (serverMessage) return serverMessage;
    if (error.code === "ECONNABORTED") return "The request timed out. Please try again.";
    if (!error.response) return "Can't reach the server. Check your connection and try again.";
    return fallback;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export const api = axios.create({
  baseURL: env.apiUrl,
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
    `${env.apiUrl}/auth/refresh-token`,
    { refreshToken }
  );

  const tokens = data.data;
  await Promise.all([setAuthToken(tokens.accessToken), setRefreshToken(tokens.refreshToken)]);
  useAuthStore.setState({ token: tokens.accessToken });

  return tokens.accessToken;
}

/**
 * The session is dead (refresh failed). Same cleanup as a normal sign-out — push token,
 * notification/profile stores, query cache — but with no server calls, which would only 401 again.
 */
function forceSignOut(): void {
  void useAuthStore.getState().signOut({ sessionExpired: true });
  router.replace("/auth/sign-in");
}

const NO_CONTENT_STATUS = 204;

api.interceptors.response.use(
  (response) => {
    // Every API response except 204 is a JSON envelope. Anything else (empty body, HTML from a
    // proxy or another server on this host/port) would otherwise surface as `data.data === undefined`
    // deep inside a service, which React Query reports as "Query data cannot be undefined".
    const body: unknown = response.data;
    const isEnvelope = typeof body === "object" && body !== null;
    if (response.status === NO_CONTENT_STATUS || isEnvelope) return response;

    const request = `${response.config.method?.toUpperCase() ?? "GET"} ${response.config.baseURL ?? ""}${response.config.url ?? ""}`;
    if (__DEV__) {
      console.warn(
        `[api] Non-JSON response for ${request} (status ${response.status}, content-type ${String(response.headers["content-type"])}):`,
        typeof body === "string" ? body.slice(0, 300) : body,
      );
    }
    return Promise.reject(new Error("Unexpected response from the server. Please try again."));
  },
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
