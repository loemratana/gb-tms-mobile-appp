import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SkeletonBlock, SkeletonCircle } from "@/components/ui/Skeleton";
import { useTeamRoster } from "@/features/team/hooks/useTeamRoster";
import type { TeamRosterMember } from "@/features/team/types/team.types";

type TeamPreviewProps = {
  onSeeAll?: () => void;
  onMemberPress?: (member: TeamRosterMember) => void;
};

const CARD_WIDTH = 132;

function PreviewCard({ member, onPress }: { member: TeamRosterMember; onPress?: (member: TeamRosterMember) => void }) {
  return (
    <Pressable
      onPress={() => onPress?.(member)}
      accessibilityRole="button"
      accessibilityLabel={`${member.name}, ${member.role}${member.isManager ? ", manager" : ""}`}
      className="items-center rounded-2xl bg-field px-3 pb-3 pt-4 active:bg-subtle"
      style={{ width: CARD_WIDTH }}
    >
      <Avatar name={member.name} imageUrl={member.avatarUrl} size={48} />
      <Text className="mt-2.5 text-center text-body-sm font-semibold text-fg" numberOfLines={1}>
        {member.name}
      </Text>
      <Text className="mt-0.5 text-center text-micro text-fg-soft" numberOfLines={1}>
        {member.role}
      </Text>
      <View className="mt-2 h-6 justify-center">
        {member.isManager ? <Badge label="Manager" tone="success" /> : null}
      </View>
    </Pressable>
  );
}

function PreviewCardSkeleton() {
  return (
    <View className="items-center rounded-2xl bg-field px-3 pb-3 pt-4" style={{ width: CARD_WIDTH }}>
      <SkeletonCircle size={48} />
      <SkeletonBlock height={13} className="mt-2.5 w-4/5" />
      <SkeletonBlock height={10} className="mt-1.5 w-1/2" />
      <View className="mt-2 h-6" />
    </View>
  );
}

/** Dashboard strip of the viewer's department: horizontally scrolling teammate cards. */
export function TeamPreview({ onSeeAll, onMemberPress }: TeamPreviewProps) {
  const router = useRouter();
  const { status, team, members } = useTeamRoster("department");

  // No department (or the profile failed) — the full Team screen explains why; the dashboard just omits the strip.
  if (status !== "loading" && status !== "ready") return null;

  const handleSeeAll = () => {
    if (onSeeAll) {
      onSeeAll();
      return;
    }
    router.push("/(employee)/team");
  };

  return (
    <View>
      <SectionHeader
        title={status === "loading" ? "Team" : team.title}
        meta={status === "ready" ? `${members.length} ${members.length === 1 ? "member" : "members"}` : undefined}
        actionLabel="See all"
        onPressAction={handleSeeAll}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: 4 }}>
        {status === "loading"
          ? Array.from({ length: 4 }).map((_, index) => <PreviewCardSkeleton key={index} />)
          : members.map((member) => <PreviewCard key={member.id} member={member} onPress={onMemberPress} />)}
      </ScrollView>
    </View>
  );
}
