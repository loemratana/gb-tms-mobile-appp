import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

const KEYS = {
  AUTH_USER: "@tms/auth_user",
  PUSH_TOKEN: "@tms/push_token",
} as const;

// SecureStore keys may only contain alphanumerics, ".", "-" and "_".
const SECURE_KEYS = {
  AUTH_TOKEN: "tms.auth_token",
  REFRESH_TOKEN: "tms.refresh_token",
} as const;

// Where tokens lived before they moved to SecureStore; read once to migrate existing sessions.
const LEGACY_TOKEN_KEYS: Record<keyof typeof SECURE_KEYS, string> = {
  AUTH_TOKEN: "@tms/auth_token",
  REFRESH_TOKEN: "@tms/refresh_token",
};

// AFTER_FIRST_UNLOCK so background push handlers and token refresh can still read while the device is locked.
const SECURE_STORE_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
};

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

let secureStoreAvailable: boolean | null = null;

async function canUseSecureStore(): Promise<boolean> {
  if (secureStoreAvailable !== null) {
    return secureStoreAvailable;
  }

  try {
    secureStoreAvailable = await SecureStore.isAvailableAsync();
  } catch {
    secureStoreAvailable = false;
  }

  return secureStoreAvailable;
}

async function getSecureItem(name: keyof typeof SECURE_KEYS): Promise<string | null> {
  const key = SECURE_KEYS[name];

  // Web has no SecureStore; fall back to the regular store so local web dev keeps working.
  if (!(await canUseSecureStore())) {
    return getItem(key);
  }

  try {
    const value = await SecureStore.getItemAsync(key, SECURE_STORE_OPTIONS);
    if (value !== null) {
      memoryStore.set(key, value);
      return value;
    }
  } catch {
    return memoryStore.get(key) ?? null;
  }

  return migrateLegacyToken(name);
}

async function migrateLegacyToken(name: keyof typeof SECURE_KEYS): Promise<string | null> {
  const legacyKey = LEGACY_TOKEN_KEYS[name];
  const legacyValue = await getItem(legacyKey);
  if (legacyValue === null) {
    return memoryStore.get(SECURE_KEYS[name]) ?? null;
  }

  await setSecureItem(name, legacyValue);
  await removeItem(legacyKey);
  return legacyValue;
}

async function setSecureItem(name: keyof typeof SECURE_KEYS, value: string): Promise<void> {
  const key = SECURE_KEYS[name];
  memoryStore.set(key, value);

  if (!(await canUseSecureStore())) {
    await setItem(key, value);
    return;
  }

  try {
    await SecureStore.setItemAsync(key, value, SECURE_STORE_OPTIONS);
  } catch {
    // Session still works for the current app run via memoryStore.
  }
}

async function removeSecureItem(name: keyof typeof SECURE_KEYS): Promise<void> {
  const key = SECURE_KEYS[name];
  memoryStore.delete(key);

  if (!(await canUseSecureStore())) {
    await removeItem(key);
    return;
  }

  try {
    await SecureStore.deleteItemAsync(key, SECURE_STORE_OPTIONS);
  } catch {
    // Ignore native removal errors; memoryStore is already cleared.
  }
}

export async function getAuthToken(): Promise<string | null> {
  return getSecureItem("AUTH_TOKEN");
}

export async function setAuthToken(token: string): Promise<void> {
  await setSecureItem("AUTH_TOKEN", token);
}

export async function getRefreshToken(): Promise<string | null> {
  return getSecureItem("REFRESH_TOKEN");
}

export async function setRefreshToken(token: string): Promise<void> {
  await setSecureItem("REFRESH_TOKEN", token);
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
    removeSecureItem("AUTH_TOKEN"),
    removeSecureItem("REFRESH_TOKEN"),
    removeItem(LEGACY_TOKEN_KEYS.AUTH_TOKEN),
    removeItem(LEGACY_TOKEN_KEYS.REFRESH_TOKEN),
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
