import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { Image, Text, View } from "react-native";

import type { TeamRosterInfo, TeamRosterMember } from "@/features/employee/types/team";

type TeamHeroCardProps = {
  team: TeamRosterInfo;
  members: TeamRosterMember[];
};

export function TeamHeroCard({ team, members }: TeamHeroCardProps) {
  const preview = members.slice(0, 5);

  return (
    <View
      className="overflow-hidden rounded-3xl"
      style={{
        shadowColor: "#1E40AF",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.18,
        shadowRadius: 18,
        elevation: 5,
      }}
    >
      <LinearGradient
        colors={["#1E3A8A", "#2563EB", "#3B82F6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingHorizontal: 20, paddingVertical: 22 }}
      >
        <View
          pointerEvents="none"
          className="absolute -right-8 -top-8 h-32 w-32 rounded-full"
          style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
        />
        <View
          pointerEvents="none"
          className="absolute -bottom-10 -left-6 h-28 w-28 rounded-full"
          style={{ backgroundColor: "rgba(50,205,50,0.18)" }}
        />

        <View className="flex-row items-center">
          <View
            className="mr-3 h-12 w-12 items-center justify-center rounded-2xl"
            style={{ backgroundColor: "rgba(255,255,255,0.18)" }}
          >
            <Ionicons name="people" size={24} color="#FFFFFF" />
          </View>
          <View className="flex-1">
            <Text className="text-[20px] font-bold text-white">
              {team.department}
            </Text>
            <Text className="mt-0.5 text-[13px] text-white/80">
              {team.description}
            </Text>
          </View>
        </View>

        <View className="mt-5 flex-row items-center justify-between">
          <View>
            <Text className="text-[12px] font-medium text-white/75">
              Team size
            </Text>
            <Text className="mt-0.5 text-[18px] font-bold text-white">
              {team.memberCount} Members
            </Text>
          </View>

          <View className="items-end">
            <Text className="text-[12px] font-medium text-white/75">
              Managed by
            </Text>
            <Text className="mt-0.5 text-[15px] font-semibold text-white">
              {team.managerName}
            </Text>
          </View>
        </View>

        <View className="mt-5 flex-row items-center">
          <View className="flex-row">
            {preview.map((member, idx) => (
              <Image
                key={member.id}
                source={{ uri: member.avatarUrl }}
                className="h-9 w-9 rounded-full border-2 border-white/40"
                style={{ marginLeft: idx > 0 ? -10 : 0 }}
              />
            ))}
            {members.length > preview.length ? (
              <View
                className="h-9 w-9 items-center justify-center rounded-full border-2 border-white/40"
                style={{
                  marginLeft: -10,
                  backgroundColor: "rgba(255,255,255,0.2)",
                }}
              >
                <Text className="text-[11px] font-bold text-white">
                  +{members.length - preview.length}
                </Text>
              </View>
            ) : null}
          </View>
          <Text className="ml-3 text-[12px] font-medium text-white/80">
            Active collaborators
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
}
