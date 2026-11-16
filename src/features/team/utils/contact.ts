import { Linking } from "react-native";
import { toast } from "@/stores/toastStore";

async function openContactUrl(url: string, fallbackMessage: string): Promise<void> {
  // No canOpenURL pre-check: on Android 11+ and iOS it returns false unless the scheme is
  // declared in the manifest / Info.plist, while openURL itself works and rejects when nothing can handle it.
  try {
    await Linking.openURL(url);
  } catch {
    toast.error("Unavailable", fallbackMessage);
  }
}

/** Opens the phone dialer with the number filled in; the user still taps call. */
export function callPhone(phoneNumber: string, name: string): Promise<void> {
  // The dialer only needs digits and a leading "+"; spaces, dashes and brackets are display formatting.
  const dialable = phoneNumber.replace(/[^\d+]/g, "");
  return openContactUrl(`tel:${dialable}`, `Cannot call ${name} from this device.`);
}

export function sendEmail(email: string, name: string): Promise<void> {
  return openContactUrl(`mailto:${email}`, `Cannot email ${name} right now.`);
}
