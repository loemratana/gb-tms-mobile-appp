import Ionicons from "@expo/vector-icons/Ionicons";
import { useState, type ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

import { Avatar } from "@/components/ui/Avatar";
import type { BookingTargets } from "@/features/meetings/types/meeting.types";
import type { MemberDirectory } from "@/features/meetings/utils/memberDirectory";
import { colors } from "@/styles";

type Organizer = { id: string; fullName: string; avatarUrl: string | null };

/** Selections shown before the list folds into "Show all"; the organizer is always shown on top. */
const COLLAPSED_VISIBLE_COUNT = 3;

type MemberListProps = {
  organizer: Organizer | undefined;
  organizerSubtitle?: string;
  targets: BookingTargets;
  directory: MemberDirectory;
  onRemove: (key: keyof BookingTargets, id: string) => void;
};

function MemberRow({
  title,
  subtitle,
  leading,
  badge,
  onRemove,
  isHighlighted = false,
}: {
  title: string;
  subtitle?: string;
  leading: ReactNode;
  badge?: string;
  onRemove?: () => void;
  isHighlighted?: boolean;
}) {
  return (
    <View
      className={`flex-row items-center gap-3 rounded-full border px-2 py-1.5 ${
        isHighlighted ? "border-violet-border bg-violet-subtle" : "border-line bg-surface"
      }`}
    >
      {leading}
      <View className="min-w-0 flex-1">
        <Text className="text-body-sm font-semibold text-fg" numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text className="text-label text-fg-soft" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {badge ? (
        <View className="rounded-full bg-violet-subtle px-2.5 py-1">
          <Text className="text-micro font-semibold text-violet-fg">{badge}</Text>
        </View>
      ) : null}
      {onRemove ? (
        <Pressable
          onPress={onRemove}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={`Remove ${title}`}
          className="mr-1 h-8 w-8 items-center justify-center rounded-full active:bg-subtle"
        >
          <Ionicons name="close" size={18} color={colors.textMuted} />
        </Pressable>
      ) : null}
    </View>
  );
}

function GroupIcon({ icon }: { icon: "business-outline" | "briefcase-outline" }) {
  return (
    <View className="h-9 w-9 items-center justify-center rounded-full bg-brand-subtle">
      <Ionicons name={icon} size={16} color={colors.brandStrong} />
    </View>
  );
}

type SelectedRow = {
  key: string;
  title: string;
  subtitle?: string;
  leading: ReactNode;
  onRemove: () => void;
};

/**
 * Organizer first, then selected departments, positions and people, each removable. Long
 * selections fold after a few rows behind "Show all N" so the form stays a short scroll.
 */
export function MemberList({ organizer, organizerSubtitle, targets, directory, onRemove }: MemberListProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const departments = directory.departments.filter((department) => targets.departmentIds.includes(department.id));
  const positions = directory.positions.filter((position) => targets.positionIds.includes(position.id));
  const people = directory.people.filter((person) => targets.userIds.includes(person.id));

  // Groups first: one department row can stand for many people.
  const rows: SelectedRow[] = [
    ...departments.map((department) => ({
      key: `department-${department.id}`,
      title: department.name,
      subtitle: `Whole department · ${department.memberCount} members`,
      leading: <GroupIcon icon="business-outline" />,
      onRemove: () => onRemove("departmentIds", department.id),
    })),
    ...positions.map((position) => ({
      key: `position-${position.id}`,
      title: position.name,
      subtitle: `Everyone in this position · ${position.departmentName}`,
      leading: <GroupIcon icon="briefcase-outline" />,
      onRemove: () => onRemove("positionIds", position.id),
    })),
    ...people.map((person) => ({
      key: `person-${person.id}`,
      title: person.fullName,
      subtitle: [person.positionName, person.departmentName].filter(Boolean).join(" · "),
      leading: <Avatar name={person.fullName} imageUrl={person.avatarUrl} size={36} />,
      onRemove: () => onRemove("userIds", person.id),
    })),
  ];

  // Folding one row behind a toggle saves nothing, so only fold when at least two are hidden.
  const canCollapse = rows.length > COLLAPSED_VISIBLE_COUNT + 1;
  const visibleRows = canCollapse && !isExpanded ? rows.slice(0, COLLAPSED_VISIBLE_COUNT) : rows;
  const hiddenCount = rows.length - visibleRows.length;

  return (
    <View className="gap-2">
      {organizer ? (
        <MemberRow
          title={organizer.fullName}
          subtitle={organizerSubtitle}
          leading={<Avatar name={organizer.fullName} imageUrl={organizer.avatarUrl} size={36} />}
          badge="Organizer"
          isHighlighted
        />
      ) : null}
      {visibleRows.map((row) => (
        <MemberRow key={row.key} title={row.title} subtitle={row.subtitle} leading={row.leading} onRemove={row.onRemove} />
      ))}
      {canCollapse ? (
        <Pressable
          onPress={() => setIsExpanded((expanded) => !expanded)}
          accessibilityRole="button"
          accessibilityState={{ expanded: isExpanded }}
          accessibilityLabel={isExpanded ? "Show fewer members" : `Show all ${rows.length} selected members`}
          className="flex-row items-center justify-center gap-1.5 rounded-full border border-dashed border-line-strong py-2.5 active:bg-subtle"
        >
          <Text className="text-body-sm font-semibold text-brand-strong">
            {isExpanded ? "Show less" : `Show all ${rows.length} · ${hiddenCount} more`}
          </Text>
          <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={16} color={colors.brandStrong} />
        </Pressable>
      ) : null}
    </View>
  );
}
