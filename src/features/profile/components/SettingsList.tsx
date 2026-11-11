import Ionicons from "@expo/vector-icons/Ionicons";
import { Children, Fragment, type ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

import type { IconName } from "@/features/profile/utils/profile";
import { colors } from "@/styles";

type SettingsGroupProps = {
  title?: string;
  /** Small print under the group, e.g. how a setting behaves. */
  footer?: string;
  children: ReactNode;
};

/** A titled block of {@link SettingsRow}s with hairline dividers between them. */
export function SettingsGroup({ title, footer, children }: SettingsGroupProps) {
  const rows = Children.toArray(children).filter(Boolean);

  return (
    <View>
      {title ? (
        <Text className="mb-1.5 px-4 text-label font-semibold uppercase tracking-wide text-fg-soft" accessibilityRole="header">
          {title}
        </Text>
      ) : null}
      <View className="bg-surface">
        {rows.map((row, index) => (
          <Fragment key={index}>
            {index > 0 ? <View className="ml-[60px] h-px bg-line-soft" /> : null}
            {row}
          </Fragment>
        ))}
      </View>
      {footer ? <Text className="mt-1.5 px-4 text-label text-fg-soft">{footer}</Text> : null}
    </View>
  );
}

type SettingsRowProps = {
  icon: IconName;
  label: string;
  /** Second line under the label. */
  description?: string;
  /** Short text on the right, e.g. a status or version. */
  value?: string;
  /** Colours the value, e.g. green for "Allowed". */
  valueTone?: "default" | "success" | "warning";
  isDestructive?: boolean;
  /** Without it the row is plain information: no press state, no chevron. */
  onPress?: () => void;
  accessibilityHint?: string;
  /** Lets the value be long-pressed and copied (email, phone). */
  isValueSelectable?: boolean;
};

const VALUE_TONE_CLASS = {
  default: "text-fg-soft",
  success: "text-success-fg",
  warning: "text-warning-fg",
} as const;

/** One compact settings / details row. */
export function SettingsRow({
  icon,
  label,
  description,
  value,
  valueTone = "default",
  isDestructive = false,
  onPress,
  accessibilityHint,
  isValueSelectable = false,
}: SettingsRowProps) {
  const content = (
    <>
      <View className={`h-9 w-9 items-center justify-center rounded-lg ${isDestructive ? "bg-error-subtle" : "bg-subtle"}`}>
        <Ionicons name={icon} size={18} color={isDestructive ? colors.danger : colors.textSecondary} />
      </View>
      <View className="min-w-0 flex-1">
        <Text className={`text-body font-medium ${isDestructive ? "text-error" : "text-fg"}`} numberOfLines={1}>
          {label}
        </Text>
        {description ? (
          <Text className="mt-0.5 text-caption text-fg-soft" selectable={isValueSelectable}>
            {description}
          </Text>
        ) : null}
      </View>
      {value ? (
        <Text className={`max-w-[45%] text-body-sm ${VALUE_TONE_CLASS[valueTone]}`} numberOfLines={1} selectable={isValueSelectable}>
          {value}
        </Text>
      ) : null}
      {onPress && !isDestructive ? <Ionicons name="chevron-forward" size={18} color={colors.textSubtle} /> : null}
    </>
  );

  if (!onPress) {
    return (
      <View className="min-h-[56px] flex-row items-center gap-3 px-4 py-2.5" accessible accessibilityLabel={[label, description, value].filter(Boolean).join(", ")}>
        {content}
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={[label, value].filter(Boolean).join(", ")}
      accessibilityHint={accessibilityHint}
      className="min-h-[56px] flex-row items-center gap-3 px-4 py-2.5 active:bg-field"
    >
      {content}
    </Pressable>
  );
}
