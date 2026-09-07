import Ionicons from "@expo/vector-icons/Ionicons";
import { Alert, Linking, Pressable, View } from "react-native";

type ContactActionsProps = {
  email: string;
  name: string;
};

async function openUrl(url: string, fallbackMessage: string) {
  try {
    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      Alert.alert("Unavailable", fallbackMessage);
      return;
    }
    await Linking.openURL(url);
  } catch {
    Alert.alert("Unavailable", fallbackMessage);
  }
}

export function ContactActions({ email, name }: ContactActionsProps) {
  const handleEmail = () => {
    openUrl(`mailto:${email}`, `Cannot email ${name} right now.`);
  };

  return (
    <View className="flex-row items-center gap-2">
      <Pressable
        onPress={handleEmail}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel={`Email ${name}`}
        className="h-9 w-9 items-center justify-center rounded-full"
        style={{ backgroundColor: "#2563EB" }}
      >
        <Ionicons name="mail" size={16} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}
