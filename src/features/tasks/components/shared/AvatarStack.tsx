import { Text, View } from "react-native";

import { Avatar, type AvatarSize } from "@/components/ui/Avatar";
import type { TaskPerson } from "@/features/tasks/types/taskView.types";

type AvatarStackProps = {
  people: TaskPerson[];
  maxVisible?: number;
  size?: AvatarSize;
};

/** Overlapping avatars with a "+N" chip; "Unassigned" when empty. */
export function AvatarStack({ people, maxVisible = 3, size = 28 }: AvatarStackProps) {
  if (people.length === 0) {
    return <Text className="text-label text-fg-faint">Unassigned</Text>;
  }

  const visible = people.slice(0, maxVisible);
  const hiddenCount = people.length - visible.length;
  const overlap = Math.round(size / 3.5);

  return (
    <View
      className="flex-row items-center"
      accessible
      accessibilityLabel={`Assigned to ${people.map((person) => person.name).join(", ")}`}
    >
      {visible.map((person, index) => (
        <View
          key={`${person.id ?? person.name}-${index}`}
          className="rounded-full border-2 border-surface"
          style={{ marginLeft: index > 0 ? -overlap : 0, zIndex: visible.length - index }}
        >
          <Avatar name={person.name} imageUrl={person.avatarUrl} size={size} />
        </View>
      ))}
      {hiddenCount > 0 ? (
        <View
          className="items-center justify-center rounded-full border-2 border-surface bg-subtle"
          style={{ width: size + 4, height: size + 4, marginLeft: -overlap }}
        >
          <Text className="text-micro font-semibold text-fg-soft">+{hiddenCount}</Text>
        </View>
      ) : null}
    </View>
  );
}
