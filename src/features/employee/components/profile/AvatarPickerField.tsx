import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import { Alert, Image, Pressable, Text, View } from "react-native";

type AvatarPickerFieldProps = {
  uri: string;
  onChange: (uri: string) => void;
  error?: string;
};

export function AvatarPickerField({
  uri,
  onChange,
  error,
}: AvatarPickerFieldProps) {
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission needed",
        "Allow photo library access to change your profile picture."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      onChange(result.assets[0].uri);
    }
  };

  return (
    <View className="mb-6 items-center">
      <Image
        source={{ uri }}
        className="h-28 w-28 rounded-full border-[3px] border-[#E5E7EB] bg-[#F3F4F6]"
      />

      <Pressable
        onPress={pickImage}
        accessibilityRole="button"
        className="mt-4 flex-row items-center rounded-full bg-[#EFF6FF] px-4 py-2.5"
      >
        <Ionicons name="camera-outline" size={18} color="#2563EB" />
        <Text className="ml-2 text-[14px] font-semibold text-[#2563EB]">
          Change Photo
        </Text>
      </Pressable>

      {error ? (
        <Text className="mt-2 text-[12px] text-[#EF4444]">{error}</Text>
      ) : null}
    </View>
  );
}
