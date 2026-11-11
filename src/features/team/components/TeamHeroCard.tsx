import Ionicons from "@expo/vector-icons/Ionicons";
import { Text, View } from "react-native";

import { Avatar } from "@/components/ui/Avatar";
import type { TeamRosterInfo } from "@/features/team/types/team.types";
import { colors } from "@/styles";

type TeamHeroCardProps = {
  team: TeamRosterInfo;
};

/** Minimalist hero card showing department details, total team size, and manager. */
export function TeamHeroCard({ team }: TeamHeroCardProps) {
  return (
    <View className="mx-4 rounded-2xl border border-line bg-surface p-4">
      {/* Department Title & Icon */}
      <View className="flex-row items-center gap-3">
        <View className="h-10 w-10 items-center justify-center rounded-xl bg-brand-subtle">
          <Ionicons
            name="business-outline"
            size={20}
            color={colors.brandStrong}
          />
        </View>

        <View className="min-w-0 flex-1">
          <Text className="text-micro font-semibold uppercase tracking-wider text-brand-strong">
            Department
          </Text>
          <Text
            className="text-title font-bold text-fg"
            numberOfLines={1}
          >
            {team.department}
          </Text>
        </View>
      </View>

      {team.description ? (
        <Text
          className="mt-2 text-caption text-fg-soft"
          numberOfLines={2}
        >
          {team.description}
        </Text>
      ) : null}

      {/* Stats & Manager Bar */}
      <View className="mt-3.5 flex-row items-center justify-between rounded-xl border border-line-soft bg-field px-3.5 py-2.5">
        {/* Member count */}
        <View className="flex-row items-center gap-2">
          <Ionicons
            name="people-outline"
            size={18}
            color={colors.textMuted}
          />
          <View className="flex-row items-baseline gap-1.5">
            <Text className="text-body font-bold text-fg">
              {team.memberCount}
            </Text>
            <Text className="text-caption text-fg-soft">
              {team.memberCount === 1 ? "member" : "members"}
            </Text>
          </View>
        </View>

        <View className="h-4 w-px bg-line" />

        {/* Manager */}
        <View className="flex-row items-center gap-2">
          <Avatar
            name={team.managerName}
            imageUrl={team.managerAvatarUrl}
            size={28}
          />
          <View className="min-w-0">
            <Text className="text-micro text-fg-faint">Manager</Text>
            <Text
              className="max-w-[130px] text-body-sm font-semibold text-fg"
              numberOfLines={1}
            >
              {team.managerName}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}