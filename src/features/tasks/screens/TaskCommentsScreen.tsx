import { useLocalSearchParams, useRouter } from "expo-router";
import { useRef } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ScrollViewInstance,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { StackHeader } from "@/components/layout/StackHeader";
import { Button } from "@/components/ui/Button";
import { CommentComposer } from "@/features/tasks/components/detail/CommentComposer";
import { CommentList } from "@/features/tasks/components/detail/CommentList";
import { useTaskConversation } from "@/features/tasks/hooks/useTaskConversation";
import { colors } from "@/styles";

/** An open chat checks for new messages more often than the task screen does. */
const CHAT_POLL_MS = 5_000;
/** Within this distance of the bottom, new messages scroll into view; further up, you keep your place. */
const STICK_TO_BOTTOM_PX = 120;

/**
 * A task's whole conversation, full screen: messages fill the screen, the message box stays pinned
 * above the keyboard. Opened from the task screen's "View all" / "Write a message…".
 */
export default function TaskCommentsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id, focus } = useLocalSearchParams<{ id: string; focus?: string }>();
  const conversation = useTaskConversation(id, CHAT_POLL_MS);

  const scrollRef = useRef<ScrollViewInstance>(null);
  const isNearBottom = useRef(true);
  const hasScrolledInitially = useRef(false);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    isNearBottom.current =
      contentSize.height - (contentOffset.y + layoutMeasurement.height) < STICK_TO_BOTTOM_PX;
  };

  // Open at the newest message; afterwards follow new ones only if you're already at the bottom.
  const handleContentSizeChange = () => {
    if (!hasScrolledInitially.current) {
      hasScrolledInitially.current = true;
      scrollRef.current?.scrollToEnd({ animated: false });
    } else if (isNearBottom.current) {
      scrollRef.current?.scrollToEnd({ animated: true });
    }
  };

  const send = async (message: string) => {
    isNearBottom.current = true; // your own message should always come into view
    await conversation.send(message);
  };

  return (
    <View className="flex-1 bg-surface">
      <StackHeader title={conversation.task?.title ?? "Comments"} onBack={() => router.back()} />

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        {conversation.isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color={colors.textSubtle} />
          </View>
        ) : conversation.isError && conversation.comments.length === 0 ? (
          <View className="flex-1 items-center justify-center gap-3 px-8">
            <Text className="text-center text-body-sm text-fg-soft">Couldn&apos;t load the comments.</Text>
            <Button label="Try again" variant="outline" onPress={() => void conversation.refetch()} />
          </View>
        ) : (
          <ScrollView
            ref={scrollRef}
            className="flex-1"
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 4, paddingBottom: 12, flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            onScroll={handleScroll}
            scrollEventThrottle={64}
            onContentSizeChange={handleContentSizeChange}
          >
            {/* Few messages sit at the bottom, next to the message box, like any chat. */}
            <View className="flex-1 justify-end">
              <CommentList
                comments={conversation.comments}
                currentUserId={conversation.currentUserId}
                roleOf={conversation.roleOf}
              />
            </View>
          </ScrollView>
        )}

        <View
          className="border-t border-line-soft bg-surface pt-2.5"
          style={{ paddingBottom: Math.max(insets.bottom, 10) }}
        >
          <CommentComposer onSend={send} viewer={conversation.viewer} autoFocus={focus === "1"} />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
