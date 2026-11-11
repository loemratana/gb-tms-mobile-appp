import Constants from "expo-constants";

const DEFAULT_API_PORT = "8080";
const DEFAULT_API_PATH = "/api/v1";

/**
 * Resolution order:
 * 1. EXPO_PUBLIC_API_URL — explicit URL, always wins (staging/production builds).
 * 2. In development, the LAN address the device used to reach Metro, so a physical
 *    device or Android emulator can reach the backend (`localhost` only works on
 *    web/iOS Simulator). Port and path come from EXPO_PUBLIC_API_PORT/EXPO_PUBLIC_API_PATH.
 *
 * EXPO_PUBLIC_* values are inlined at build time, so they must be read with
 * literal `process.env.EXPO_PUBLIC_X` access — not destructured or indexed.
 */
function resolveApiUrl(): string {
  const explicitUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (explicitUrl) {
    return explicitUrl.replace(/\/+$/, "");
  }

  const port = process.env.EXPO_PUBLIC_API_PORT?.trim() || DEFAULT_API_PORT;
  const path = process.env.EXPO_PUBLIC_API_PATH?.trim() || DEFAULT_API_PATH;

  if (__DEV__) {
    const hostUri =
      Constants.expoConfig?.hostUri ?? Constants.expoGoConfig?.debuggerHost;
    const devHost = hostUri?.split(":")[0] || "localhost";
    return `http://${devHost}:${port}${path}`;
  }

  // Failing loudly beats a release build silently pointing at localhost.
  throw new Error(
    "EXPO_PUBLIC_API_URL is not set. Define it in .env or in the EAS build profile's env.",
  );
}

export const env = {
  apiUrl: resolveApiUrl(),
} as const;
