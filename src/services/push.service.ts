import { api } from "@/lib/api";

export type DevicePlatform = "IOS" | "ANDROID";

export async function registerDevice(
  deviceToken: string,
  deviceType: DevicePlatform
): Promise<void> {
  await api.post("/notifications/devices/register", { deviceToken, deviceType });
}

export async function unregisterDevice(deviceToken: string): Promise<void> {
  await api.delete(`/notifications/devices/${deviceToken}`);
}
