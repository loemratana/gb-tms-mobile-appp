import Ionicons from "@expo/vector-icons/Ionicons";
import { Text, View } from "react-native";

import { Avatar } from "@/components/ui/Avatar";
import type { TeamRosterInfo } from "@/features/team/types/team.types";
import { palette } from "@/styles";

type TeamHeroCardProps = {
  team: TeamRosterInfo;
};

/**
 * The group being listed: a department (name, what it does, its manager) or the viewer's direct
 * reports. Identity on top; who leads it and how many people are in it underneath.
 */
export function TeamHeroCard({ team }: TeamHeroCardProps) {
  const isDepartment = team.kind === "department";
  const countLabel = isDepartment
    ? team.memberCount === 1 ? "Member" : "Members"
    : team.memberCount === 1 ? "Report" : "Reports";

  return (
    <View className="mx-4 overflow-hidden rounded-2xl border border-line bg-surface">
      <View className="flex-row items-start gap-3.5 p-4">
        <View className="h-12 w-12 items-center justify-center rounded-2xl bg-brand">
          <Ionicons
            name={isDepartment ? "business" : "git-network-outline"}
            size={22}
            color={palette.white}
          />
        </View>

        <View className="min-w-0 flex-1">
          <Text className="text-micro font-semibold uppercase tracking-wider text-brand-strong">
            {isDepartment ? "Department" : "Direct reports"}
          </Text>
          <Text className="mt-0.5 text-title font-bold text-fg" numberOfLines={2} accessibilityRole="header">
            {team.title}
          </Text>
          {team.description ? (
            <Text className="mt-1 text-caption text-fg-soft" numberOfLines={2}>
              {team.description}
            </Text>
          ) : null}
        </View>
      </View>

      <View className="flex-row border-t border-line-soft">
        <View
          className="min-w-0 flex-1 flex-row items-center gap-2.5 px-4 py-3"
          accessible
          accessibilityLabel={`Manager: ${team.leadName}${team.isLeadYou ? ", you" : ""}`}
        >
          <Avatar name={team.leadName} imageUrl={team.leadAvatarUrl} size={36} />
          <View className="min-w-0 flex-1">
            <Text className="text-micro text-fg-faint">Manager</Text>
            <Text className="text-body-sm font-semibold text-fg" numberOfLines={1}>
              {team.leadName}
              {team.isLeadYou ? <Text className="font-normal text-brand-strong"> · You</Text> : null}
            </Text>
          </View>
        </View>

        <View className="w-px bg-line-soft" />

        <View
          className="min-w-[88px] items-center justify-center px-4 py-3"
          accessible
          accessibilityLabel={`${team.memberCount} ${countLabel.toLowerCase()}`}
        >
          <Text className="text-title font-bold text-fg">{team.memberCount}</Text>
          <Text className="text-micro text-fg-faint">{countLabel}</Text>
        </View>
      </View>
    </View>
  );
}
