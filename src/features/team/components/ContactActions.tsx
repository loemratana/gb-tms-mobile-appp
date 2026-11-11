import { View } from "react-native";

import { Button } from "@/components/ui/Button";
import { callPhone, sendEmail } from "@/features/team/utils/contact";

type ContactActionsProps = {
  email: string;
  phoneNumber: string | null;
  name: string;
  /** "default" = side-by-side row, "inline" = stacked full-width buttons */
  layout?: "default" | "inline";
};

/** "Call" and "Email" buttons for a teammate. Call stays visible but disabled when there's no phone number. */
export function ContactActions({
  email,
  phoneNumber,
  name,
  layout = "default",
}: ContactActionsProps) {
  const isStacked = layout === "inline";

  return (
    <View className={isStacked ? "gap-2" : "flex-row gap-3"}>
      <View className={isStacked ? "" : "flex-1"}>
        <Button
          label={phoneNumber ? "Call" : "No phone"}
          icon="call"
          variant="success"
          disabled={!phoneNumber}
          accessibilityHint={phoneNumber ?? `No phone number for ${name}`}
          onPress={phoneNumber ? () => void callPhone(phoneNumber, name) : undefined}
        />
      </View>
      <View className={isStacked ? "" : "flex-1"}>
        <Button
          label="Email"
          icon="mail"
          variant="outline"
          accessibilityHint={email}
          onPress={() => void sendEmail(email, name)}
        />
      </View>
    </View>
  );
}