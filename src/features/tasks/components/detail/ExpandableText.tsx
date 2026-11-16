import { useState } from "react";
import { Pressable, Text, View, type TextLayoutEvent } from "react-native";

type ExpandableTextProps = {
  text: string;
  /** Lines shown before "Show more". */
  collapsedLines?: number;
  className?: string;
};

/** Long text (a task description) clipped to a few lines, with "Show more" / "Show less". */
export function ExpandableText({ text, collapsedLines = 4, className = "" }: ExpandableTextProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isClippable, setIsClippable] = useState(false);

  // Measure once at full length: only offer the toggle when the text really is longer.
  const handleLayout = (event: TextLayoutEvent) => {
    if (!isClippable && event.nativeEvent.lines.length > collapsedLines) setIsClippable(true);
  };

  return (
    <View>
      <Text
        className={className}
        numberOfLines={isExpanded || !isClippable ? undefined : collapsedLines}
        onTextLayout={handleLayout}
      >
        {text}
      </Text>
      {isClippable ? (
        <Pressable
          onPress={() => setIsExpanded((value) => !value)}
          hitSlop={8}
          accessibilityRole="button"
          className="mt-1 self-start"
        >
          <Text className="text-label font-semibold text-brand-strong">
            {isExpanded ? "Show less" : "Show more"}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
