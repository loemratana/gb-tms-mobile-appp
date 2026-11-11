import Constants from "expo-constants";
import type { ImageSource } from "expo-image";

import { env } from "@/config/env";

const LOOPBACK_HOSTNAMES = new Set(["localhost", "127.0.0.1", "0.0.0.0"]);

function getDevelopmentHostname(): string | null {
  const hostUri =
    Constants.expoConfig?.hostUri ?? Constants.expoGoConfig?.debuggerHost;

  return hostUri?.split(":")[0] || null;
}

function resolveRemoteUrl(uri: string): URL {
  const remoteUrl = new URL(uri, env.apiUrl);
  const isLoopbackUrl = LOOPBACK_HOSTNAMES.has(remoteUrl.hostname);
  const developmentHostname = __DEV__ ? getDevelopmentHostname() : null;

  if (isLoopbackUrl && developmentHostname) {
    remoteUrl.hostname = developmentHostname;
  }

  return remoteUrl;
}

export function getRemoteImageUrl(uri: string): string {
  return resolveRemoteUrl(uri).toString();
}

export function getRemoteImageSource(
  uri: string | null | undefined,
  accessToken: string | null,
): ImageSource | null {
  if (!uri) return null;

  const imageUrl = resolveRemoteUrl(uri);
  const apiUrl = resolveRemoteUrl(env.apiUrl);

  const canAuthenticate =
    accessToken !== null &&
    imageUrl.origin === apiUrl.origin;

  return {
    uri: imageUrl.toString(),
    ...(canAuthenticate
      ? { headers: { Authorization: `Bearer ${accessToken}` } }
      : {}),
  };
}
