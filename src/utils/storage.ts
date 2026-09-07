import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  AUTH_TOKEN: "@tms/auth_token",
  REFRESH_TOKEN: "@tms/refresh_token",
  AUTH_USER: "@tms/auth_user",
  PUSH_TOKEN: "@tms/push_token",
} as const;

const memoryStore = new Map<string, string>();

let nativeStorageAvailable: boolean | null = null;

async function canUseNativeStorage(): Promise<boolean> {
  if (nativeStorageAvailable !== null) {
    return nativeStorageAvailable;
  }

  try {
    const probeKey = "@tms/storage_probe";
    await AsyncStorage.setItem(probeKey, "1");
    await AsyncStorage.removeItem(probeKey);
    nativeStorageAvailable = true;
  } catch {
    nativeStorageAvailable = false;
  }

  return nativeStorageAvailable;
}

export async function getItem(key: string): Promise<string | null> {
  try {
    if (await canUseNativeStorage()) {
      const value = await AsyncStorage.getItem(key);
      if (value !== null) {
        memoryStore.set(key, value);
      }
      return value;
    }
  } catch {
    // Fall back to in-memory storage below.
  }

  return memoryStore.get(key) ?? null;
}

export async function setItem(key: string, value: string): Promise<void> {
  memoryStore.set(key, value);

  try {
    if (await canUseNativeStorage()) {
      await AsyncStorage.setItem(key, value);
    }
  } catch {
    // Session still works for the current app run via memoryStore.
  }
}

export async function removeItem(key: string): Promise<void> {
  memoryStore.delete(key);

  try {
    if (await canUseNativeStorage()) {
      await AsyncStorage.removeItem(key);
    }
  } catch {
    // Ignore native removal errors when fallback is active.
  }
}

export async function getAuthToken(): Promise<string | null> {
  return getItem(KEYS.AUTH_TOKEN);
}

export async function setAuthToken(token: string): Promise<void> {
  await setItem(KEYS.AUTH_TOKEN, token);
}

export async function getRefreshToken(): Promise<string | null> {
  return getItem(KEYS.REFRESH_TOKEN);
}

export async function setRefreshToken(token: string): Promise<void> {
  await setItem(KEYS.REFRESH_TOKEN, token);
}

export async function getAuthUser<T>(): Promise<T | null> {
  const raw = await getItem(KEYS.AUTH_USER);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function setAuthUser<T>(user: T): Promise<void> {
  await setItem(KEYS.AUTH_USER, JSON.stringify(user));
}

export async function clearAuthStorage(): Promise<void> {
  await Promise.all([
    removeItem(KEYS.AUTH_TOKEN),
    removeItem(KEYS.REFRESH_TOKEN),
    removeItem(KEYS.AUTH_USER),
  ]);
}

/** The last FCM token successfully registered with the backend, so sign-out can unregister it. */
export async function getPushToken(): Promise<string | null> {
  return getItem(KEYS.PUSH_TOKEN);
}

export async function setPushToken(token: string): Promise<void> {
  await setItem(KEYS.PUSH_TOKEN, token);
}

export async function clearPushToken(): Promise<void> {
  await removeItem(KEYS.PUSH_TOKEN);
}
