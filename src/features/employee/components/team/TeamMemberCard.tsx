import Ionicons from "@expo/vector-icons/Ionicons";
import { Image, Pressable, Text, View } from "react-native";

import type { TeamRosterMember } from "@/features/employee/types/team";

type TeamMemberCardProps = {
  member: TeamRosterMember;
  onPress?: (member: TeamRosterMember) => void;
  onViewDetails?: (member: TeamRosterMember) => void;
};

export function TeamMemberCard({
  member,
  onPress,
  onViewDetails,
}: TeamMemberCardProps) {
  return (
    <Pressable
      onPress={() => onPress?.(member)}
      accessibilityRole="button"
      className="mb-3 rounded-2xl border border-[#E5E7EB] bg-white p-4"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      <View className="flex-row items-center">
        <View className="relative mr-3">
          <Image
            source={{ uri: member.avatarUrl }}
            className="h-12 w-12 rounded-full bg-[#F3F4F6]"
          />
        </View>

        <View className="min-w-0 flex-1">
          {member.isManager ? (
            <View className="mb-1.5 self-start rounded-full bg-[#EFF6FF] px-2 py-0.5">
              <Text className="text-[9px] font-bold tracking-wide text-[#2563EB]">
                MANAGER
              </Text>
            </View>
          ) : null}

          <Text
            className="text-[15px] font-bold text-[#111827]"
            numberOfLines={1}
          >
            {member.name}
          </Text>
          <Text className="mt-0.5 text-[13px] text-[#6B7280]" numberOfLines={1}>
            {member.role}
          </Text>

          <View className="mt-1.5 flex-row items-center">
            <Ionicons name="mail-outline" size={12} color="#9CA3AF" />
            <Text className="ml-1 text-[12px] text-[#6B7280]" numberOfLines={1}>
              {member.email}
            </Text>
          </View>
        </View>
      </View>

      <View className="mt-3 items-end">
        <Pressable
          onPress={() => (onViewDetails ?? onPress)?.(member)}
          accessibilityRole="button"
          accessibilityLabel={`View details for ${member.name}`}
          hitSlop={8}
        >
          <Text className="text-[12px] font-semibold text-[#2563EB]">
            View Details →
          </Text>
        </Pressable>
      </View>

    </Pressable>
  );
}
