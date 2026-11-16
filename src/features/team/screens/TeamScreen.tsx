import { useRouter } from "expo-router";
import { useMemo } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SectionHeader } from "@/components/ui/SectionHeader";
import { StateView } from "@/components/ui/StateView";
import { getTeamMemberPathForRole } from "@/features/auth/utils/navigation";
import { LeaderboardPeriodPicker } from "@/features/team/components/LeaderboardPeriodPicker";
import { TeamHeader } from "@/features/team/components/TeamHeader";
import { TeamHeroCard } from "@/features/team/components/TeamHeroCard";
import { TeamListSkeleton } from "@/features/team/components/TeamListSkeleton";
import { TeamMemberRow } from "@/features/team/components/TeamMemberRow";
import { TeamScopeTabs, type TeamScopeOption } from "@/features/team/components/TeamScopeTabs";
import { TeamState } from "@/features/team/components/TeamState";
import { useTeamPerformance } from "@/features/team/hooks/useTeamPerformance";
import { useTeamRoster, type TeamScope } from "@/features/team/hooks/useTeamRoster";
import type { TeamRosterMember } from "@/features/team/types/team.types";
import { sortByPerformance } from "@/features/team/utils/teamPerformance";
import { useCurrentUser } from "@/features/users/hooks/useUsers";
import { useBackAction } from "@/hooks/useBackAction";
import { useAuthStore } from "@/stores/authStore";

export type { TeamScope } from "@/features/team/hooks/useTeamRoster";

type TeamScreenProps = {
  bottomInset?: number;
  scope?: TeamScope;
  /** When given with `onChangeScope`, tabs under the header let the viewer change scope. */
  scopeOptions?: TeamScopeOption[];
  onChangeScope?: (scope: TeamScope) => void;
};

export default function TeamScreen({ bottomInset, scope = "department", scopeOptions, onChangeScope }: TeamScreenProps) {
  const router = useRouter();
  const role = useAuthStore((state) => state.user?.role);
  const insets = useSafeAreaInsets();
  const backAction = useBackAction();
  const roster = useTeamRoster(scope);
  const { data: me } = useCurrentUser();
  const isReportsScope = scope === "directReports";
  // Rankings are per department, so performance shows only for viewers who belong to one.
  const hasPerformance = Boolean(me?.department?.id);
  const performance = useTeamPerformance(hasPerformance);
  const members = useMemo(
    () => sortByPerformance(roster.visibleMembers, performance.entriesByUserId),
    [roster.visibleMembers, performance.entriesByUserId],
  );

  const openMemberById = (memberId: string) => {
    if (!role) return;
    router.push(getTeamMemberPathForRole(role, memberId));
  };
  const openMember = (member: TeamRosterMember) => openMemberById(member.id);

  const renderBody = () => {
    if (roster.status === "loading") return <TeamListSkeleton count={6} />;
    if (roster.status !== "ready") {
      return (
        <View className="px-4">
          <TeamState variant={roster.status} onRetry={() => void roster.refresh()} />
        </View>
      );
    }

    return (
      <View className="gap-5">
        <TeamHeroCard team={roster.team} />

        <View>
          <View className="mb-2 px-4">
            <SectionHeader
              title={isReportsScope ? "Direct reports" : "Teammates"}
              meta={roster.query ? `${roster.visibleMembers.length} of ${roster.members.length}` : String(roster.members.length)}
            />
            {hasPerformance ? (
              <LeaderboardPeriodPicker value={performance.selection} onChange={performance.setSelection} />
            ) : null}
          </View>

          {performance.isError ? (
            <Text className="mb-2 px-4 text-label text-error" onPress={performance.refetch}>
              Couldn&apos;t load performance. Tap to retry.
            </Text>
          ) : null}

          {roster.visibleMembers.length === 0 ? (
            <View className="px-4">
              <StateView
                variant="empty"
                icon="search-outline"
                title="No teammates found"
                message="Try a different name, role or phone number."
                isCompact
              />
            </View>
          ) : (
            <View className="bg-surface" style={{ opacity: performance.isSwitchingPeriod ? 0.6 : 1 }}>
              {members.map((member, index) => (
                <TeamMemberRow
                  key={member.id}
                  member={member}
                  performance={performance.entriesByUserId.get(member.id)}
                  hasPerformance={hasPerformance && !performance.isError}
                  isPerformanceLoading={performance.isLoading}
                  isMe={member.id === me?.id}
                  hasDivider={index > 0}
                  onPress={openMember}
                />
              ))}
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-screen">
      <TeamHeader
        memberCount={roster.members.length}
        query={roster.query}
        onChangeQuery={roster.setQuery}
        onBack={backAction}
      />
      {scopeOptions && onChangeScope ? (
        <TeamScopeTabs options={scopeOptions} value={scope} onChange={onChangeScope} />
      ) : null}

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, paddingTop: 16, paddingBottom: bottomInset ?? insets.bottom + 16 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        refreshControl={<RefreshControl refreshing={roster.isRefreshing} onRefresh={() => void roster.refresh()} />}
      >
        {renderBody()}
      </ScrollView>
    </View>
  );
}
