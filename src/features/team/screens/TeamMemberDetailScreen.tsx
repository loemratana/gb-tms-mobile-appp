import { callPhone, sendEmail } from "@/features/team/utils/contact";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import type { ComponentProps } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { StackHeader } from "@/components/layout/StackHeader";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SkeletonBlock, SkeletonCircle } from "@/components/ui/Skeleton";
import { StateView } from "@/components/ui/StateView";
import { getTaskDetailPathForRole } from "@/features/auth/utils/navigation";
import { TaskCard } from "@/features/tasks/components/list/TaskCard";
import { TaskCardSkeleton } from "@/features/tasks/components/list/TaskCardSkeleton";
import { PerformanceOverview } from "@/features/team/components/PerformanceOverview";
import { useTeamMemberDetail } from "@/features/team/hooks/useTeamMemberDetail";
import { useCurrentUser } from "@/features/users/hooks/useUsers";
import { useAuthStore } from "@/stores/authStore";
import { colors } from "@/styles";

function ContactRow({
  icon,
  label,
  value,
  hasDivider = false,
}: {
  icon: ComponentProps<typeof Ionicons>["name"];
  label: string;
  value: string;
  hasDivider?: boolean;
}) {
  return (
    <View
      className={`flex-row items-center gap-3 px-3 py-3 ${hasDivider ? "border-t border-line-soft" : ""
        }`}
    >
      <View className="h-9 w-9 items-center justify-center rounded-lg bg-subtle">
        <Ionicons name={icon} size={17} color={colors.textMuted} />
      </View>
      <View className="min-w-0 flex-1">
        <Text className="text-micro text-fg-faint">{label}</Text>
        <Text className="text-body-sm font-medium text-fg" numberOfLines={1} selectable>
          {value}
        </Text>
      </View>
    </View>
  );
}

/** Loading placeholder shaped like the profile section + task list. */
function MemberDetailSkeleton() {
  return (
    <View className="gap-6 pt-4">
      <View className="bg-surface px-4 py-5">
        <View className="flex-row items-center gap-4">
          <SkeletonCircle size={72} />
          <View className="flex-1 gap-2">
            <SkeletonBlock height={18} className="w-2/3" />
            <SkeletonBlock height={13} className="w-1/3" />
            <SkeletonBlock height={20} radius={999} className="w-1/2" />
          </View>
        </View>
        <SkeletonBlock height={44} radius={12} className="mt-5 w-full" />
      </View>
      <View className="gap-3 px-4">
        <SkeletonBlock height={16} className="w-1/3" />
        <TaskCardSkeleton />
        <TaskCardSkeleton />
      </View>
    </View>
  );
}

export default function TeamMemberDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: currentUser } = useCurrentUser();
  const viewerRole = useAuthStore((state) => state.user?.role);
  const detail = useTeamMemberDetail(id);
  const { member } = detail;

  const goBack = () => router.back();
  const openTask = (taskId: string) => {
    if (!viewerRole) return;
    router.push(getTaskDetailPathForRole(viewerRole, taskId));
  };

  if (detail.isLoadingMember) {
    return (
      <View className="flex-1 bg-screen">
        <StackHeader title="Team member" onBack={goBack} />
        <MemberDetailSkeleton />
      </View>
    );
  }

  if (detail.isMemberError || !member) {
    return (
      <View className="flex-1 bg-screen">
        <StackHeader title="Team member" onBack={goBack} />
        <View className="flex-1 justify-center px-4">
          <StateView
            variant={detail.isMemberError ? "error" : "empty"}
            icon={detail.isMemberError ? "cloud-offline-outline" : "person-outline"}
            title={detail.isMemberError ? "Couldn't load this teammate" : "Teammate not found"}
            message={
              detail.isMemberError
                ? "Check your connection and try again."
                : "This person may no longer be on the team."
            }
            actionLabel={detail.isMemberError ? "Try again" : undefined}
            onPressAction={detail.isMemberError ? detail.refetchMember : undefined}
          />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-screen">
      <StackHeader title="Team member" onBack={goBack} />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}
      >
        {/* Profile */}
        <View className="bg-surface px-4 pb-5 pt-5">
          {/* Header: avatar + identity */}
          <View className="flex-row items-center gap-4">
            <Avatar name={member.fullName} imageUrl={member.avatarUrl} size={72} />
            <View className="min-w-0 flex-1">
              <Text className="text-display font-bold text-fg" numberOfLines={2}>
                {member.fullName}
              </Text>
              <Text className="mt-0.5 text-body-sm text-fg-soft" numberOfLines={1}>
                {member.position?.name ?? "Team member"}
              </Text>
              <View className="mt-2 flex-row flex-wrap gap-1.5">
                {detail.isMemberManager ? <Badge label="Manager" tone="success" /> : null}
                <Badge label={member.department?.name ?? "No department"} icon="business" />
              </View>
            </View>
          </View>

          {/* Contact info — 2-column icon grid */}
          <View className="mt-4 flex-row gap-3">
            {/* Email */}
            <Pressable
              onPress={() => void sendEmail(member.email, member.fullName)}
              accessibilityRole="button"
              accessibilityLabel={`Email ${member.fullName}`}
              className="h-12 flex-1 flex-row items-center justify-center gap-2 rounded-lg border border-[#CBD5E1] bg-[#E2E8F0] active:bg-[#CBD5E1]"
            >
              <Ionicons name="mail-outline" size={19} color={colors.textSecondary} />
              <Text className="text-sm font-semibold text-[#1E293B]">
                Email
              </Text>
            </Pressable>

            {/* Phone */}
            <Pressable
              onPress={
                member.phoneNumber
                  ? () => void callPhone(member.phoneNumber!, member.fullName)
                  : undefined
              }
              disabled={!member.phoneNumber}
              accessibilityRole="button"
              accessibilityLabel={
                member.phoneNumber ? `Call ${member.fullName}` : "No phone number"
              }
              className={`h-12 flex-1 flex-row items-center justify-center gap-2 rounded-lg border border-[#CBD5E1] bg-[#E2E8F0] active:bg-[#CBD5E1] ${member.phoneNumber ? "" : "opacity-40"
                }`}
            >
              <Ionicons name="call-outline" size={19} color={colors.textSecondary} />
              <Text className="text-sm font-semibold text-[#1E293B]">
                Call
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Performance */}
        <View className="mt-6 px-4">
          <SectionHeader title="Performance" />
          <PerformanceOverview userId={id} />
        </View>

        {/* Assigned tasks */}
        <View className="mt-6 px-4">
          <SectionHeader title="Assigned tasks" meta={String(detail.tasks.length)} />
          {detail.isLoadingTasks ? (
            <View className="gap-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <TaskCardSkeleton key={index} />
              ))}
            </View>
          ) : detail.tasks.length === 0 ? (
            <StateView
              variant="empty"
              title="No tasks assigned"
              message="Nothing on their plate right now."
              isCompact
            />
          ) : (
            <View className="gap-3">
              {detail.tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  currentUserId={currentUser?.id}
                  onPress={(pressedTask) => openTask(pressedTask.id)}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}