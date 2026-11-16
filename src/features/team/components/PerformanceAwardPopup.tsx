import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";

import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { getTeamMemberPathForRole } from "@/features/auth/utils/navigation";
import { TopPerformersModal, type PodiumPerformer } from "@/features/dashboard/components/TopPerformersModal";
import { StarRating } from "@/features/team/components/StarRating";
import { useAward, useMarkAwardSeen, usePendingAwards } from "@/features/team/hooks/usePerformanceAwards";
import type { PerformanceAward, PerformanceAwardEntry } from "@/features/team/types/award.types";
import { useAuthStore } from "@/stores/authStore";
import { colors } from "@/styles";

type AwardPodiumPerformer = PodiumPerformer & { userId: string };

function toPodium(entries: PerformanceAwardEntry[]): AwardPodiumPerformer[] {
  return entries.map((entry) => ({
    id: entry.userId,
    userId: entry.userId,
    rank: entry.rank,
    name: entry.fullName,
    avatarUrl: entry.avatarUrl,
    score: Math.round(entry.score),
    stars: entry.stars,
  }));
}

/** The viewer's own result, as a small card under the podium. */
function MyPlace({ award }: { award: PerformanceAward }) {
  const me = award.myEntry;
  if (!me) {
    return (
      <View className="flex-row items-center gap-3 rounded-2xl bg-field p-3.5">
        <View className="h-10 w-10 items-center justify-center rounded-full bg-surface">
          <Ionicons name="hourglass-outline" size={18} color={colors.textSubtle} />
        </View>
        <Text className="flex-1 text-caption leading-5 text-fg-soft">
          You weren&apos;t rated this time. Finish a few more tasks to join the ranking.
        </Text>
      </View>
    );
  }

  const isOnPodium = me.rank <= 3;
  return (
    <View className={`flex-row items-center gap-3 rounded-2xl p-3.5 ${isOnPodium ? "bg-brand-subtle" : "bg-field"}`}>
      <View className={`h-10 w-10 items-center justify-center rounded-full ${isOnPodium ? "bg-brand" : "bg-surface"}`}>
        <Text className={`text-body font-bold ${isOnPodium ? "text-white" : "text-fg"}`}>#{me.rank}</Text>
      </View>
      <View className="min-w-0 flex-1">
        <Text className={`text-body-sm font-semibold ${isOnPodium ? "text-brand-strong" : "text-fg"}`}>
          {isOnPodium ? "🎉 Congratulations, you made the podium!" : "Your place"}
        </Text>
        <View className="mt-0.5 flex-row items-center gap-1.5">
          <StarRating value={me.stars} size={11} />
          <Text className="text-label text-fg-soft">
            #{me.rank} of {award.ratedCount} · score {Math.round(me.score)}
          </Text>
        </View>
      </View>
    </View>
  );
}

function FullRanking({ awardId, myUserId }: { awardId: string; myUserId: string | undefined }) {
  const awardQuery = useAward(awardId);
  if (awardQuery.isLoading) {
    return <ActivityIndicator className="py-4" color={colors.brand} />;
  }
  if (awardQuery.isError || !awardQuery.data) {
    return <Text className="py-3 text-center text-caption text-fg-soft">Couldn&apos;t load the full ranking.</Text>;
  }
  return (
    <ScrollView style={{ maxHeight: 240 }} nestedScrollEnabled showsVerticalScrollIndicator={false}>
      {awardQuery.data.entries.map((entry) => {
        const isMe = entry.userId === myUserId;
        return (
          <View
            key={entry.userId}
            className={`flex-row items-center gap-3 rounded-xl px-2.5 py-2 ${isMe ? "bg-brand-subtle" : ""}`}
          >
            <Text className="w-6 text-center text-caption font-bold text-fg-soft">{entry.rank}</Text>
            <Avatar name={entry.fullName} imageUrl={entry.avatarUrl} size={28} />
            <View className="min-w-0 flex-1">
              <Text className="text-caption font-semibold text-fg" numberOfLines={1}>
                {entry.fullName}
                {isMe ? <Text className="font-normal text-brand-strong"> · You</Text> : null}
              </Text>
              <StarRating value={entry.stars} size={10} />
            </View>
            <Text className="text-body-sm font-bold text-fg">{Math.round(entry.score)}</Text>
          </View>
        );
      })}
    </ScrollView>
  );
}

/**
 * Shows the newest monthly / yearly top-performer announcement the user hasn't closed yet, as the
 * confetti podium. Closing it marks it seen; the next pending one (if any) follows. Mount once
 * inside the signed-in layouts.
 */
export function PerformanceAwardPopup() {
  const router = useRouter();
  const role = useAuthStore((state) => state.user?.role);
  const myUserId = useAuthStore((state) => state.user?.id);
  const pendingQuery = usePendingAwards(Boolean(role));
  const markSeen = useMarkAwardSeen();
  const [expandedAwardId, setExpandedAwardId] = useState<string | null>(null);
  // Hidden right away on close, before the pending list refetches.
  const [closedIds, setClosedIds] = useState<string[]>([]);

  const award = pendingQuery.data?.find((candidate) => !closedIds.includes(candidate.id));

  const close = () => {
    if (!award) return;
    setClosedIds((ids) => [...ids, award.id]);
    setExpandedAwardId(null);
    markSeen.mutate(award.id);
  };

  const openMember = (performer: AwardPodiumPerformer) => {
    close();
    if (role) router.push(getTeamMemberPathForRole(role, performer.userId));
  };

  if (!award) return null;
  const isExpanded = expandedAwardId === award.id;

  return (
    <TopPerformersModal
      visible
      performers={toPodium(award.entries)}
      onClose={close}
      onViewDetails={openMember}
      title={award.period === "YEARLY" ? "Top Performers of the Year" : "Top Performers"}
      subtitle={`${award.label} · ${award.departmentName}`}
      footer={
        <View className="gap-3">
          <MyPlace award={award} />
          {isExpanded ? <FullRanking awardId={award.id} myUserId={myUserId} /> : null}
          <View className="flex-row gap-2">
            {award.ratedCount > award.entries.length ? (
              <View className="flex-1">
                <Button
                  label={isExpanded ? "Hide" : "Full ranking"}
                  variant="outline"
                  size="sm"
                  onPress={() => setExpandedAwardId(isExpanded ? null : award.id)}
                />
              </View>
            ) : null}
            <View className="flex-1">
              <Button label="Got it" size="sm" onPress={close} />
            </View>
          </View>
        </View>
      }
    />
  );
}
