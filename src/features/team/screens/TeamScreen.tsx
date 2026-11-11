import { useRouter } from "expo-router";
import { RefreshControl, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SectionHeader } from "@/components/ui/SectionHeader";
import { SegmentedControl, type SegmentOption } from "@/components/ui/SegmentedControl";
import { StateView } from "@/components/ui/StateView";
import { getTeamMemberPathForRole } from "@/features/auth/utils/navigation";
import { TeamHeader } from "@/features/team/components/TeamHeader";
import { TeamHeroCard } from "@/features/team/components/TeamHeroCard";
import { TeamListSkeleton } from "@/features/team/components/TeamListSkeleton";
import { TeamMemberCard } from "@/features/team/components/TeamMemberCard";
import { TeamState } from "@/features/team/components/TeamState";
import { useTeamRoster, type TeamScope } from "@/features/team/hooks/useTeamRoster";
import type { TeamRosterMember } from "@/features/team/types/team.types";
import { useBackAction } from "@/hooks/useBackAction";
import { useAuthStore } from "@/stores/authStore";

export type { TeamScope } from "@/features/team/hooks/useTeamRoster";

type TeamScreenProps = {
  bottomInset?: number;
  scope?: TeamScope;
  /** When given with `onChangeScope`, a switcher above the roster lets the viewer change scope. */
  scopeOptions?: SegmentOption<TeamScope>[];
  onChangeScope?: (scope: TeamScope) => void;
};

export default function TeamScreen({ bottomInset, scope = "department", scopeOptions, onChangeScope }: TeamScreenProps) {
  const router = useRouter();
  const role = useAuthStore((state) => state.user?.role);
  const insets = useSafeAreaInsets();
  const backAction = useBackAction();
  const roster = useTeamRoster(scope);
  const isReportsScope = scope === "directReports";

  const openMember = (member: TeamRosterMember) => {
    if (!role) return;
    router.push(getTeamMemberPathForRole(role, member.id));
  };

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
          </View>

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
            <View className="gap-2.5 px-4">
              {roster.visibleMembers.map((member) => (
                <TeamMemberCard key={member.id} member={member} onPress={openMember} />
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

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, paddingTop: 16, paddingBottom: bottomInset ?? insets.bottom + 16 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        refreshControl={<RefreshControl refreshing={roster.isRefreshing} onRefresh={() => void roster.refresh()} />}
      >
        {scopeOptions && onChangeScope ? (
          <View className="mb-4 px-4">
            <SegmentedControl options={scopeOptions} value={scope} onChange={onChangeScope} />
          </View>
        ) : null}
        {renderBody()}
      </ScrollView>
    </View>
  );
}
