import Ionicons from "@expo/vector-icons/Ionicons";
import type { ComponentProps, ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

import { colors } from "@/styles";

type IconName = ComponentProps<typeof Ionicons>["name"];

export type TaskFact = {
  key: string;
  icon: IconName;
  label: string;
  /** Main line; a string or a custom node (avatars, a progress bar…). */
  value: ReactNode;
  /** Small second line, e.g. "in 3 days". */
  hint?: string;
  /** Turns the value/hint red, e.g. an overdue due date. */
  isAlert?: boolean;
  /** Makes the tile tappable (e.g. change priority, reassign); shows a chevron. */
  onPress?: () => void;
  accessibilityLabel?: string;
};

/**
 * The task's key facts as a 2-column grid of tiles, so the important things (when, who, how
 * urgent, how far along) are visible at a glance instead of in a long list of rows.
 */
export function TaskFactsGrid({ facts }: { facts: TaskFact[] }) {
  return (
    <View className="flex-row flex-wrap">
      {facts.map((fact, index) => {
        const isRightColumn = index % 2 === 1;
        const isLastRow = index >= facts.length - (facts.length % 2 === 0 ? 2 : 1);
        const body = (
          <>
            <View className="flex-row items-center gap-1.5">
              <Ionicons name={fact.icon} size={14} color={colors.textSubtle} />
              <Text className="flex-1 text-micro font-semibold uppercase tracking-wide text-fg-faint">
                {fact.label}
              </Text>
              {fact.onPress ? <Ionicons name="chevron-forward" size={14} color={colors.textSubtle} /> : null}
            </View>
            <View className="mt-1.5">
              {typeof fact.value === "string" ? (
                <Text
                  className={`text-body-sm font-semibold ${fact.isAlert ? "text-error" : "text-fg"}`}
                  numberOfLines={1}
                >
                  {fact.value}
                </Text>
              ) : (
                fact.value
              )}
            </View>
            {fact.hint ? (
              <Text
                className={`mt-0.5 text-label ${fact.isAlert ? "font-medium text-error" : "text-fg-soft"}`}
                numberOfLines={1}
              >
                {fact.hint}
              </Text>
            ) : null}
          </>
        );

        const className = `w-1/2 py-3 ${isRightColumn ? "border-l border-line-soft pl-3.5" : "pr-3.5"} ${
          isLastRow ? "" : "border-b border-line-soft"
        }`;

        return fact.onPress ? (
          <Pressable
            key={fact.key}
            onPress={fact.onPress}
            accessibilityRole="button"
            accessibilityLabel={fact.accessibilityLabel}
            className={`${className} active:bg-field`}
          >
            {body}
          </Pressable>
        ) : (
          <View key={fact.key} className={className} accessible accessibilityLabel={fact.accessibilityLabel}>
            {body}
          </View>
        );
      })}
    </View>
  );
}
