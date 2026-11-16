import * as ImagePicker from "expo-image-picker";
import { Text, View } from "react-native";

import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { toast } from "@/stores/toastStore";

type AvatarPickerFieldProps = {
  /** Current photo uri; empty when the user has none. */
  uri: string;
  /** Used for the initials shown when there's no photo. */
  name: string;
  onChange: (uri: string) => void;
  error?: string;
};

export function AvatarPickerField({ uri, name, onChange, error }: AvatarPickerFieldProps) {
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      toast.warning("Permission needed", "Allow photo library access to change your profile picture.");
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
    <View className="mb-5 items-center">
      <Avatar name={name || "?"} imageUrl={uri || null} size={72} />
      <View className="mt-3">
        <Button
          label={uri ? "Change photo" : "Add photo"}
          icon="camera-outline"
          variant="ghost"
          size="sm"
          isFullWidth={false}
          onPress={() => void pickImage()}
        />
      </View>
      {error ? <Text className="mt-2 text-label text-error">{error}</Text> : null}
    </View>
  );
}
