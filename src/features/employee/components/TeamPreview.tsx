import { useRouter } from "expo-router";
import { Image, Pressable, ScrollView, Text, View } from "react-native";

import { SkeletonBlock, SkeletonCircle } from "@/features/components/ui/Skeleton";
import type { TeamRosterMember } from "@/features/employee/types/team";
import { useDepartment, useDepartmentMembers } from "@/features/departments/hooks/useDepartments";
import { useCurrentUser } from "@/features/users/hooks/useUsers";

type TeamPreviewProps = {
  onSeeAll?: () => void;
  onMemberPress?: (member: TeamRosterMember) => void;
};

/** Placeholder avatar for members who haven't uploaded one, matching the convention used in TeamScreen. */
function fallbackAvatar(name: string): string {
  return `https://i.pravatar.cc/100?u=${encodeURIComponent(name)}`;
}

function PreviewCard({
  member,
  onPress,
}: {
  member: TeamRosterMember;
  onPress?: (member: TeamRosterMember) => void;
}) {
  return (
    <Pressable
      onPress={() => onPress?.(member)}
      accessibilityRole="button"
      accessibilityLabel={`${member.name}, ${member.role}`}
      className="mr-3 w-[148px] rounded-2xl border border-[#E5E7EB] p-3.5"
      style={{
        backgroundColor: "#FFFFFF",
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 2,
      }}
    >
      <View className="items-center">
        <Image
          source={{ uri: member.avatarUrl }}
          className="mb-2.5 h-14 w-14 rounded-full bg-[#F3F4F6]"
          style={member.isManager ? { borderWidth: 2, borderColor: "#BFDBFE" } : undefined}
        />

        {member.isManager ? (
          <View className="mb-1 rounded-full bg-[#EFF6FF] px-2 py-0.5">
            <Text className="text-[9px] font-bold tracking-wide text-[#2563EB]">
              MANAGER
            </Text>
          </View>
        ) : null}

        <Text
          className="text-center text-[14px] font-bold text-[#111827]"
          numberOfLines={1}
        >
          {member.name}
        </Text>
        <Text
          className="mt-0.5 text-center text-[11px] text-[#6B7280]"
          numberOfLines={1}
        >
          {member.role}
        </Text>
      </View>
    </Pressable>
  );
}

function PreviewCardSkeleton() {
  return (
    <View
      className="mr-3 w-[148px] items-center rounded-2xl border border-[#E5E7EB] bg-white p-3.5"
    >
      <SkeletonCircle size={56} className="mb-2.5" />
      <SkeletonBlock height={13} className="w-4/5" />
      <SkeletonBlock height={10} className="mt-1.5 w-1/2" />
    </View>
  );
}

export function TeamPreview({ onSeeAll, onMemberPress }: TeamPreviewProps) {
  const router = useRouter();

  const { data: me } = useCurrentUser();
  const departmentId = me?.department?.id;

  const { data: department } = useDepartment(departmentId);
  const { data: rawMembers, isLoading } = useDepartmentMembers(departmentId);

  const managerId = department?.manager?.id;
  const members: TeamRosterMember[] = (rawMembers ?? []).map((member) => ({
    id: member.id,
    name: member.fullName,
    email: member.email,
    role: member.position?.name ?? "Team member",
    avatarUrl: member.avatarUrl ?? fallbackAvatar(member.fullName),
    isManager: member.id === managerId,
  }));

  const handleSeeAll = () => {
    if (onSeeAll) {
      onSeeAll();
      return;
    }
    router.push("/(employee)/(tabs)/team");
  };

  if (!departmentId) {
    return null;
  }

  return (
    <View>
      <View className="mb-3 flex-row items-end justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-[13px] font-semibold uppercase tracking-[1px] text-[#9CA3AF]">
            Team
          </Text>
          <Text className="mt-1 text-[18px] font-bold tracking-tight text-[#111827]">
            {department?.name ?? "Your team"}
          </Text>
          <Text className="mt-0.5 text-[12px] text-[#6B7280]">
            {members.length} member{members.length === 1 ? "" : "s"}
          </Text>
        </View>

        <Pressable
          onPress={handleSeeAll}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="See all team members"
        >
          <Text className="text-[14px] font-semibold text-[#2563EB]">
            See all
          </Text>
        </Pressable>
      </View>

      {isLoading ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 4 }}
        >
          {Array.from({ length: 4 }).map((_, index) => (
            <PreviewCardSkeleton key={index} />
          ))}
        </ScrollView>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 4 }}
        >
          {members.map((member) => (
            <PreviewCard
              key={member.id}
              member={member}
              onPress={onMemberPress}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}
