import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, ScrollView, Text, TextInput, View } from "react-native";

import { TeamHeader } from "@/features/employee/components/team/TeamHeader";
import { TeamHeroCard } from "@/features/employee/components/team/TeamHeroCard";
import { TeamListSkeleton } from "@/features/employee/components/team/TeamListSkeleton";
import { TeamMemberCard } from "@/features/employee/components/team/TeamMemberCard";
import type { TeamRosterInfo, TeamRosterMember } from "@/features/employee/types/team";
import { useDepartment, useDepartmentMembers } from "@/features/departments/hooks/useDepartments";
import { useCurrentUser } from "@/features/users/hooks/useUsers";

/** Placeholder avatar for members who haven't uploaded one, matching the convention used elsewhere in the app. */
function fallbackAvatar(name: string): string {
  return `https://i.pravatar.cc/100?u=${encodeURIComponent(name)}`;
}

export default function TeamScreen({ bottomInset = 32 }: { bottomInset?: number }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const { data: me, isLoading: isLoadingMe } = useCurrentUser();
  const departmentId = me?.department?.id;

  const { data: department, isLoading: isLoadingDepartment } = useDepartment(departmentId);
  const { data: rawMembers, isLoading: isLoadingMembers, isError } =
    useDepartmentMembers(departmentId);

  const managerId = department?.manager?.id;

  const allMembers: TeamRosterMember[] = useMemo(() => {
    if (!rawMembers) return [];
    return rawMembers.map((member) => ({
      id: member.id,
      name: member.fullName,
      email: member.email,
      role: member.position?.name ?? "Team member",
      avatarUrl: member.avatarUrl ?? fallbackAvatar(member.fullName),
      isManager: member.id === managerId,
    }));
  }, [rawMembers, managerId]);

  const team: TeamRosterInfo = {
    department: department?.name ?? "Your team",
    description: department?.description ?? null,
    memberCount: allMembers.length,
    managerName: department?.manager?.name ?? "Unassigned",
  };

  const filteredMembers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allMembers;
    return allMembers.filter(
      (member) =>
        member.name.toLowerCase().includes(q) ||
        member.role.toLowerCase().includes(q)
    );
  }, [allMembers, query]);

  const isLoading = isLoadingMe || isLoadingDepartment || isLoadingMembers;

  const openMember = (member: TeamRosterMember) => {
    router.push({
      pathname: "/(employee)/team/[id]",
      params: { id: member.id },
    });
  };

  return (
    <View className="flex-1 bg-white">
      <TeamHeader
        onPressSearch={() => setSearchOpen((prev) => !prev)}
        onPressFilter={() =>
          Alert.alert("Filter", "Team filters coming soon.")
        }
      />

      {searchOpen ? (
        <View className="border-b border-[#E5E7EB] bg-white px-5 py-3">
          <View className="flex-row items-center rounded-2xl bg-[#F3F4F6] px-3 py-2.5">
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search teammates..."
              placeholderTextColor="#9CA3AF"
              autoFocus
              className="flex-1 text-[15px] text-[#111827]"
            />
          </View>
        </View>
      ) : null}

      {isLoading ? (
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: bottomInset }}
        >
          <View className="px-5 pt-4">
            <TeamListSkeleton count={6} />
          </View>
        </ScrollView>
      ) : isError || !departmentId ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-base font-bold text-[#111827]">
            Couldn&apos;t load your team
          </Text>
          <Text className="mt-1 text-center text-xs text-[#6B7280]">
            {departmentId
              ? "Something went wrong reaching the server. Pull to refresh or try again shortly."
              : "You're not assigned to a department yet."}
          </Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: bottomInset }}
          keyboardShouldPersistTaps="handled"
        >
          <TeamHeroCard team={team} members={allMembers} />

          <View className="px-5 pt-6">
            <View className="mb-1 flex-row items-center justify-between">
              <Text className="text-[13px] font-semibold uppercase tracking-[1px] text-[#9CA3AF]">
                Teammates
              </Text>
              <Text className="text-[12px] font-medium text-[#6B7280]">
                {allMembers.length} members
              </Text>
            </View>

            {filteredMembers.length === 0 ? (
              <View className="items-center rounded-2xl border border-dashed border-[#D1D5DB] px-4 py-10">
                <Text className="text-base font-bold text-[#111827]">
                  No members found
                </Text>
                <Text className="mt-1 text-center text-xs text-[#6B7280]">
                  Try a different search
                </Text>
              </View>
            ) : (
              filteredMembers.map((member) => (
                <TeamMemberCard
                  key={member.id}
                  member={member}
                  onPress={openMember}
                  onViewDetails={openMember}
                />
              ))
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
