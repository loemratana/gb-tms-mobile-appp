import Ionicons from "@expo/vector-icons/Ionicons";
import type { ComponentProps } from "react";
import { Pressable, Text, View } from "react-native";

import type { TeamScope } from "@/features/team/hooks/useTeamRoster";
import { colors } from "@/styles";

export type TeamScopeOption = {
  value: TeamScope;
  label: string;
  icon: ComponentProps<typeof Ionicons>["name"];
};

type TeamScopeTabsProps = {
  options: TeamScopeOption[];
  value: TeamScope;
  onChange: (scope: TeamScope) => void;
};

/**
 * Which group the Team screen lists. Underlined tabs under the header, so they read as switching
 * the whole page — unlike the pill switch inside the list, which only changes the period.
 */
export function TeamScopeTabs({ options, value, onChange }: TeamScopeTabsProps) {
  return (
    <View className="flex-row border-b border-line bg-surface px-2" accessibilityRole="tablist">
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={option.label}
            className="h-12 flex-1 flex-row items-center justify-center gap-2 active:opacity-70"
          >
            <Ionicons
              name={option.icon}
              size={18}
              color={isActive ? colors.brand : colors.textSubtle}
            />
            <Text className={`text-body-sm ${isActive ? "font-semibold text-brand-strong" : "font-medium text-fg-soft"}`}>
              {option.label}
            </Text>
            {isActive ? (
              <View className="absolute bottom-0 left-4 right-4 h-[3px] rounded-t-full bg-brand" />
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}
