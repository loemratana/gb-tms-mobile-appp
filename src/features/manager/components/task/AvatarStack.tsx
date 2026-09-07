import { Image, Text, View } from "react-native";

import type { TaskPerson } from "@/features/employee/types/types";

type AvatarStackProps = {
  people: TaskPerson[];
  maxVisible?: number;
  size?: number;
};

export function AvatarStack({
  people,
  maxVisible = 3,
  size = 28,
}: AvatarStackProps) {
  if (people.length === 0) {
    return (
      <View
        className="items-center justify-center rounded-full bg-[#F3F4F6]"
        style={{ width: size, height: size }}
      >
        <Text className="text-[10px] font-semibold text-[#9CA3AF]">—</Text>
      </View>
    );
  }

  const visible = people.slice(0, maxVisible);
  const overflow = people.length - maxVisible;

  return (
    <View className="flex-row items-center">
      {visible.map((person, index) => (
        <View
          key={`${person.name}-${index}`}
          className="overflow-hidden rounded-full border-2 border-white bg-[#F3F4F6]"
          style={{
            width: size,
            height: size,
            marginLeft: index > 0 ? -8 : 0,
            zIndex: visible.length - index,
          }}
        >
          {person.avatarUrl ? (
            <Image
              source={{ uri: person.avatarUrl }}
              className="h-full w-full"
              accessibilityLabel={person.name}
            />
          ) : (
            <View className="h-full w-full items-center justify-center bg-[#E5E7EB]">
              <Text className="text-[10px] font-bold text-[#6B7280]">
                {person.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>
      ))}

      {overflow > 0 ? (
        <View
          className="items-center justify-center rounded-full border-2 border-white bg-[#F3F4F6]"
          style={{
            width: size,
            height: size,
            marginLeft: -8,
            zIndex: 0,
          }}
        >
          <Text className="text-[10px] font-bold text-[#6B7280]">+{overflow}</Text>
        </View>
      ) : null}
    </View>
  );
}
