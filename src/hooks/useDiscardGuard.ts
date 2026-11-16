import { useCallback } from "react";
import { Alert } from "react-native";

type DiscardGuardOptions = {
  title?: string;
  message?: string;
  /** Label of the button that throws the changes away. */
  discardLabel?: string;
};

/**
 * Returns `requestClose`: closes straight away when nothing was typed, otherwise asks before
 * throwing the user's changes away. Forms pair it with disabling swipe/backdrop dismissal while
 * `isDirty`, so the only ways out go through this question.
 */
export function useDiscardGuard(
  isDirty: boolean,
  close: () => void,
  {
    title = "Discard changes?",
    message = "What you've entered will be lost.",
    discardLabel = "Discard",
  }: DiscardGuardOptions = {},
): () => void {
  return useCallback(() => {
    if (!isDirty) {
      close();
      return;
    }
    Alert.alert(title, message, [
      { text: "Keep editing", style: "cancel" },
      { text: discardLabel, style: "destructive", onPress: close },
    ]);
  }, [isDirty, close, title, message, discardLabel]);
}
