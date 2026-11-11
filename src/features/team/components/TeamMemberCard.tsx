import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, Text, View } from "react-native";

import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import type { TeamRosterMember } from "@/features/team/types/team.types";
import { callPhone, sendEmail } from "@/features/team/utils/contact";
import { colors } from "@/styles";

type TeamMemberCardProps = {
  member: TeamRosterMember;
  onPress?: (member: TeamRosterMember) => void;
  /** Kept optional for backward compatibility */
  hasDivider?: boolean;
};

/** Clean, individual card for a teammate in the roster list. */
export function TeamMemberCard({ member, onPress }: TeamMemberCardProps) {
  const { phoneNumber } = member;

  return (
    <Pressable
      onPress={() => onPress?.(member)}
      accessibilityRole="button"
      accessibilityLabel={`${member.name}, ${member.role}${member.isManager ? ", manager" : ""}`}
      accessibilityHint="Opens teammate details"
      className="w-full flex-row items-center gap-3 rounded-2xl border border-line bg-surface p-3.5 active:bg-field"
    >
      <Avatar name={member.name} imageUrl={member.avatarUrl} size={44} />

      {/* Identity: Name, Manager badge, Role & Phone */}
      <View className="min-w-0 flex-1">
        <View className="flex-row items-center gap-2">
          <Text
            className="shrink text-body font-semibold text-fg"
            numberOfLines={1}
          >
            {member.name}
          </Text>
          {member.isManager ? (
            <Badge label="Manager" tone="info" />
          ) : null}
        </View>

        <Text
          className="mt-0.5 text-caption text-fg-soft"
          numberOfLines={1}
        >
          {member.role}
        </Text>

        {phoneNumber ? (
          <View className="mt-1 flex-row items-center gap-1">
            <Ionicons name="call-outline" size={11} color={colors.textSubtle} />
            <Text className="text-micro text-fg-faint" numberOfLines={1}>
              {phoneNumber}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Action buttons (Email, Call) & Chevron */}
      <View className="flex-row items-center gap-1.5">
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            void sendEmail(member.email, member.name);
          }}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel="Email"
          accessibilityHint={member.email}
          className="h-9 w-9 items-center justify-center rounded-xl bg-brand-subtle active:opacity-70"
        >
          <Ionicons name="mail-outline" size={16} color={colors.brandStrong} />
        </Pressable>

        <Pressable
          onPress={
            phoneNumber
              ? (e) => {
                  e.stopPropagation();
                  void callPhone(phoneNumber, member.name);
                }
              : undefined
          }
          disabled={!phoneNumber}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel="Call"
          accessibilityHint={phoneNumber ?? "No phone number"}
          accessibilityState={{ disabled: !phoneNumber }}
          className={`h-9 w-9 items-center justify-center rounded-xl ${
            phoneNumber
              ? "bg-success-subtle active:opacity-70"
              : "bg-subtle opacity-40"
          }`}
        >
          <Ionicons
            name="call-outline"
            size={16}
            color={phoneNumber ? colors.success : colors.textSubtle}
          />
        </Pressable>

        <View className="pl-1">
          <Ionicons name="chevron-forward" size={16} color={colors.textSubtle} />
        </View>
      </View>
    </Pressable>
  );
}