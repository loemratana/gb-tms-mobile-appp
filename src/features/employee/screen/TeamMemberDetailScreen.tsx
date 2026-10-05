import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { SkeletonBlock, SkeletonCircle } from "@/features/components/ui/Skeleton";
import { TaskCard } from "@/features/employee/components/TaskCard";
import { TaskCardSkeleton } from "@/features/employee/components/TaskCardSkeleton";
import { ContactActions } from "@/features/employee/components/team/ContactActions";
import { PerformanceScoreCard } from "@/features/employee/components/team/PerformanceScoreCard";
import { mapTaskResponseToEmployeeTask } from "@/features/employee/data/taskResponseAdapter";
import { computeEmployeePerformance } from "@/features/employee/utils/employeePerformance";
import { useTasks } from "@/features/tasks/hooks/useTasks";
import { useCurrentUser, useUser } from "@/features/users/hooks/useUsers";
import { isManager } from "@/features/users/utils/userRoles";

/** Placeholder avatar for members who haven't uploaded one, matching the convention used in TeamScreen. */
function fallbackAvatar(name: string): string {
  return `https://i.pravatar.cc/100?u=${encodeURIComponent(name)}`;
}

function DetailHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <SafeAreaView edges={["top"]} className="border-b border-[#E5E7EB] bg-white">
      <View className="min-h-[56px] flex-row items-center gap-3 px-4 py-2">
        <Pressable
          onPress={onBack}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          className="h-10 w-10 items-center justify-center rounded-full bg-[#F3F4F6]"
        >
          <Ionicons name="chevron-back" size={22} color="#111827" />
        </Pressable>
        <Text
          className="min-w-0 flex-1 text-[16px] font-bold text-[#111827]"
          numberOfLines={1}
        >
          {title}
        </Text>
      </View>
    </SafeAreaView>
  );
}

/** Loading placeholder shaped like the member hero card + performance score card. */
function MemberDetailSkeleton() {
  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 }}
    >
      <View>
        <View className="flex-row items-center">
          <SkeletonCircle size={64} className="mr-3" />
          <View className="min-w-0 flex-1 gap-1.5">
            <SkeletonBlock height={17} className="w-2/3" />
            <SkeletonBlock height={13} className="w-1/2" />
            <SkeletonBlock height={11} className="w-1/3" />
          </View>
        </View>
        <View className="mt-4 flex-row items-center justify-between border-t border-[#F3F4F6] pt-3.5">
          <SkeletonBlock height={11} className="w-1/4" />
          <SkeletonCircle size={28} />
        </View>
      </View>

      <View className="mt-6 gap-3 border-t border-[#F3F4F6] pt-6">
        <SkeletonBlock height={14} className="w-1/2" />
        <SkeletonBlock height={11} className="w-full" />
        <SkeletonBlock height={11} className="w-3/4" />
      </View>
    </ScrollView>
  );
}

export default function TeamMemberDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: currentUser } = useCurrentUser();

  const { data: member, isLoading: isLoadingMember, isError: isMemberError } = useUser(id);
  const { data: tasksPage, isLoading: isLoadingTasks } = useTasks(
    { assigneeId: id, size: 200 },
    Boolean(id)
  );

  const memberTasks = useMemo(
    () => (tasksPage?.content ?? []).map(mapTaskResponseToEmployeeTask),
    [tasksPage]
  );

  const { completed, completionRate, performanceLevel, metrics } = useMemo(
    () => computeEmployeePerformance(memberTasks),
    [memberTasks]
  );

  if (isLoadingMember) {
    return (
      <View className="flex-1 bg-white">
        <DetailHeader title="Employee Detail" onBack={() => router.back()} />
        <MemberDetailSkeleton />
      </View>
    );
  }

  if (isMemberError || !member) {
    return (
      <View className="flex-1 bg-white">
        <DetailHeader title="Employee Detail" onBack={() => router.back()} />
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-base font-bold text-[#111827]">
            {isMemberError ? "Couldn't load this employee" : "Employee not found"}
          </Text>
          <Text className="mt-1 text-center text-sm text-[#6B7280]">
            {isMemberError
              ? "Check your connection and try again."
              : "This employee may no longer be available."}
          </Text>
        </View>
      </View>
    );
  }

  const memberIsManager = isManager(member);

  return (
    <View className="flex-1 bg-white">
      <DetailHeader title={member.fullName} onBack={() => router.back()} />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 }}
      >
        <View>
          <View className="flex-row items-center">
            <Image
              source={{ uri: member.avatarUrl ?? fallbackAvatar(member.fullName) }}
              className="mr-3 h-16 w-16 rounded-full bg-[#F3F4F6]"
              style={memberIsManager ? { borderWidth: 2, borderColor: "#BFDBFE" } : undefined}
            />

            <View className="min-w-0 flex-1">
              <View className="flex-row items-center gap-1.5">
                <Text
                  className="shrink text-[19px] font-bold text-[#111827]"
                  numberOfLines={1}
                >
                  {member.fullName}
                </Text>
                {memberIsManager ? (
                  <Text className="text-[10px] font-bold tracking-wide text-[#2563EB]">
                    MANAGER
                  </Text>
                ) : null}
              </View>
              <Text className="mt-0.5 text-[14px] text-[#4B5563]" numberOfLines={1}>
                {member.position?.name ?? "Team member"}
              </Text>
              <Text className="mt-0.5 text-[12px] text-[#9CA3AF]" numberOfLines={1}>
                {member.department?.name ?? "No department"}
              </Text>
            </View>
          </View>

          <View className="mt-4 flex-row items-center justify-between border-t border-[#F3F4F6] pt-3.5">
            <Text className="text-[12px] font-medium text-[#9CA3AF]">Contact</Text>
            <ContactActions email={member.email} name={member.fullName} />
          </View>
        </View>

        <View className="mt-5">
          <PerformanceScoreCard
            score={completionRate}
            level={performanceLevel}
            monthLabel={new Date().toLocaleString("en-US", { month: "long" })}
            summary={
              memberTasks.length > 0
                ? `${member.fullName} has completed ${completed} of ${memberTasks.length} assigned task${memberTasks.length === 1 ? "" : "s"}.`
                : `${member.fullName} has no assigned tasks right now.`
            }
            metrics={metrics}
          />
        </View>

        <View className="mt-6 border-t border-[#F3F4F6] pt-6">
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-[13px] font-semibold uppercase tracking-[1px] text-[#9CA3AF]">
              Assigned Tasks
            </Text>
            <Text className="text-[12px] font-semibold text-[#6B7280]">
              {memberTasks.length}
            </Text>
          </View>

          {isLoadingTasks ? (
            <>
              {Array.from({ length: 3 }).map((_, index) => (
                <TaskCardSkeleton key={index} />
              ))}
            </>
          ) : memberTasks.length === 0 ? (
            <View className="items-center rounded-3xl border border-dashed border-[#D1D5DB] bg-white px-4 py-8">
              <Ionicons name="file-tray-outline" size={22} color="#9CA3AF" />
              <Text className="mt-2 text-[13px] font-medium text-[#6B7280]">
                No tasks assigned right now
              </Text>
            </View>
          ) : (
            <View className="gap-3">
              {memberTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  currentUserId={currentUser?.id}
                  onPress={(t) =>
                    router.push({ pathname: "/(employee)/tasks/[id]", params: { id: t.id } })
                  }
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
