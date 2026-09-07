import Ionicons from "@expo/vector-icons/Ionicons";
import { Image, Pressable, Text, View } from "react-native";

import type {
  ProductivityStat,
  ProfileUser,
} from "@/features/employee/data/profile";

type ProfileHeroCardProps = {
  user: ProfileUser;
  stats: ProductivityStat[];
  onPressEdit?: () => void;
};

export function ProfileHeroCard({
  user,
  stats,
  onPressEdit,
}: ProfileHeroCardProps) {
  return (
    <View className="bg-white pt-2">
      <View className="items-center">
        <View className="relative">
          <Image
            source={{ uri: user.avatarUrl }}
            className="h-24 w-24 rounded-full border-[3px] border-[#F3F4F6] bg-[#F3F4F6]"
          />

          <Pressable
            onPress={onPressEdit}
            accessibilityRole="button"
            accessibilityLabel="Edit profile"
            hitSlop={6}
            className="absolute -bottom-1 -right-1 h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-[#2563EB]"
          >
            <Ionicons name="create-outline" size={16} color="#FFFFFF" />
          </Pressable>
        </View>

        <Text className="mt-4 text-[22px] font-bold tracking-tight text-[#111827]">
          {user.name}
        </Text>
        <Text className="mt-1 text-[14px] font-medium text-[#2563EB]">
          {user.role}
        </Text>
        <Text className="mt-1 text-[13px] text-[#6B7280]">{user.department}</Text>

        <Pressable
          onPress={onPressEdit}
          accessibilityRole="button"
          className="mt-4 flex-row items-center rounded-full bg-[#EFF6FF] px-4 py-2"
        >
          <Ionicons name="create-outline" size={16} color="#2563EB" />
          <Text className="ml-1.5 text-[13px] font-semibold text-[#2563EB]">
            Edit Profile
          </Text>
        </Pressable>
      </View>

      <View className="mt-6 flex-row items-stretch justify-between rounded-2xl bg-[#F3F4F6] px-2 py-3">
        {stats.map((stat, index) => (
          <View
            key={stat.id}
            className="flex-1 items-center px-1"
            style={
              index < stats.length - 1
                ? {
                    borderRightWidth: 1,
                    borderRightColor: "#E5E7EB",
                  }
                : undefined
            }
          >
            <View className="mb-2 h-8 w-8 items-center justify-center rounded-xl bg-[#2563EB]">
              <Ionicons name={stat.icon} size={16} color="#FFFFFF" />
            </View>
            <Text className="text-[16px] font-bold text-[#111827]">
              {stat.value}
            </Text>
            <Text className="mt-0.5 text-center text-[10px] font-medium text-[#6B7280]">
              {stat.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
