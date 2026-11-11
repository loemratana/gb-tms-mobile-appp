import Ionicons from "@expo/vector-icons/Ionicons";
import { useMemo, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";

import { ModalSheet } from "@/components/ui/ModalSheet";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/ui/SearchInput";
import { SegmentedControl, type SegmentOption } from "@/components/ui/SegmentedControl";
import type { BookingTargets } from "@/features/meetings/types/meeting.types";
import { countTargets, matchesQuery, type MemberDirectory } from "@/features/meetings/utils/memberDirectory";
import { colors } from "@/styles";

type MemberTab = "people" | "departments" | "positions";

const TAB_OPTIONS: SegmentOption<MemberTab>[] = [
  { value: "people", label: "People" },
  { value: "departments", label: "Departments" },
  { value: "positions", label: "Positions" },
];

const TARGET_KEY: Record<MemberTab, keyof BookingTargets> = {
  people: "userIds",
  departments: "departmentIds",
  positions: "positionIds",
};

type Row = { id: string; title: string; subtitle: string; avatar?: { name: string; url: string | null } };

type MemberPickerModalProps = {
  visible: boolean;
  directory: MemberDirectory;
  isLoading: boolean;
  isError: boolean;
  organizerId: string | undefined;
  value: BookingTargets;
  onConfirm: (targets: BookingTargets) => void;
  onClose: () => void;
};

/** Pick whole departments, everyone in a position, or individual people. Selections combine. */
export function MemberPickerModal({
  visible,
  directory,
  isLoading,
  isError,
  organizerId,
  value,
  onConfirm,
  onClose,
}: MemberPickerModalProps) {
  // The parent mounts this only while open, so the draft starts from `value` each time.
  const [draft, setDraft] = useState<BookingTargets>(value);
  const [tab, setTab] = useState<MemberTab>("people");
  const [query, setQuery] = useState("");

  const rows = useMemo<Row[]>(() => {
    if (tab === "departments") {
      return directory.departments
        .filter((department) => matchesQuery(query, department.name))
        .map((department) => ({
          id: department.id,
          title: department.name,
          subtitle: `${department.memberCount} ${department.memberCount === 1 ? "member" : "members"}`,
        }));
    }
    if (tab === "positions") {
      return directory.positions
        .filter((position) => matchesQuery(query, position.name, position.departmentName))
        .map((position) => ({
          id: position.id,
          title: position.name,
          subtitle: `${position.departmentName} · ${position.memberCount} ${position.memberCount === 1 ? "person" : "people"}`,
        }));
    }
    return directory.people
      .filter((person) => person.id !== organizerId)
      .filter((person) => matchesQuery(query, person.fullName, person.departmentName, person.positionName))
      .map((person) => ({
        id: person.id,
        title: person.fullName,
        subtitle: [person.positionName, person.departmentName].filter(Boolean).join(" · "),
        avatar: { name: person.fullName, url: person.avatarUrl },
      }));
  }, [tab, query, directory, organizerId]);

  const key = TARGET_KEY[tab];
  const toggle = (id: string) =>
    setDraft((current) => ({
      ...current,
      [key]: current[key].includes(id) ? current[key].filter((item) => item !== id) : [...current[key], id],
    }));

  const selectedCount = countTargets(draft);

  return (
    <ModalSheet
      visible={visible}
      title="Add members"
      onClose={onClose}
      footer={
        <Button
          label={selectedCount > 0 ? `Done · ${selectedCount} selected` : "Done"}
          onPress={() => {
            onConfirm(draft);
            onClose();
          }}
        />
      }
    >
      <SegmentedControl options={TAB_OPTIONS} value={tab} onChange={setTab} />
      <View className="mt-3">
        <SearchInput value={query} onChangeText={setQuery} placeholder={`Search ${tab}`} accessibilityLabel={`Search ${tab}`} />
      </View>

      {isLoading ? (
        <Text className="py-8 text-center text-caption text-fg-soft">Loading the directory…</Text>
      ) : isError ? (
        <Text className="py-8 text-center text-caption text-error">{"Couldn't load departments and people."}</Text>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(row) => row.id}
          style={{ maxHeight: 380, marginTop: 8 }}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={<Text className="py-8 text-center text-caption text-fg-soft">{`Nothing matches "${query}".`}</Text>}
          renderItem={({ item }) => {
            const isSelected = draft[key].includes(item.id);
            return (
              <Pressable
                onPress={() => toggle(item.id)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isSelected }}
                className="flex-row items-center gap-3 border-b border-line-soft py-3 active:bg-field"
              >
                {item.avatar ? (
                  <Avatar name={item.avatar.name} imageUrl={item.avatar.url} size={36} />
                ) : (
                  <View className="h-9 w-9 items-center justify-center rounded-full bg-brand-subtle">
                    <Ionicons
                      name={tab === "departments" ? "business-outline" : "briefcase-outline"}
                      size={16}
                      color={colors.brandStrong}
                    />
                  </View>
                )}
                <View className="min-w-0 flex-1">
                  <Text className="text-body-sm font-semibold text-fg" numberOfLines={1}>
                    {item.title}
                  </Text>
                  {item.subtitle ? (
                    <Text className="text-label text-fg-soft" numberOfLines={1}>
                      {item.subtitle}
                    </Text>
                  ) : null}
                </View>
                <View
                  className={`h-6 w-6 items-center justify-center rounded-full border ${
                    isSelected ? "border-brand bg-brand" : "border-line-strong"
                  }`}
                >
                  {isSelected ? <Ionicons name="checkmark" size={14} color={colors.textInverse} /> : null}
                </View>
              </Pressable>
            );
          }}
        />
      )}
    </ModalSheet>
  );
}
