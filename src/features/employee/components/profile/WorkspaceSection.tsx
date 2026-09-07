import Ionicons from "@expo/vector-icons/Ionicons";
import { Text, View } from "react-native";

import type { WorkspaceInfo } from "@/features/employee/data/profile";

type WorkspaceSectionProps = {
  workspace: WorkspaceInfo;
};

const ROWS: {
  key: keyof WorkspaceInfo;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { key: "currentProject", label: "Current Project", icon: "briefcase-outline" },
  { key: "team", label: "Team", icon: "people-outline" },
  { key: "position", label: "Position", icon: "star-outline" },
];

export function WorkspaceSection({ workspace }: WorkspaceSectionProps) {
  return (
    <View>
      <Text className="mb-3 text-[13px] font-semibold uppercase tracking-[1px] text-[#9CA3AF]">
        Workspace
      </Text>

      <View
        className="rounded-3xl bg-white px-4 py-2"
        style={{
          shadowColor: "#0F172A",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.06,
          shadowRadius: 16,
          elevation: 3,
        }}
      >
        {ROWS.map((row, index) => (
          <View
            key={row.key}
            className={`flex-row items-center py-3.5 ${
              index < ROWS.length - 1 ? "border-b border-[#F3F4F6]" : ""
            }`}
          >
            <View className="mr-3 h-10 w-10 items-center justify-center rounded-2xl bg-[#2563EB]">
              <Ionicons name={row.icon} size={18} color="#FFFFFF" />
            </View>
            <View className="flex-1">
              <Text className="text-[12px] text-[#9CA3AF]">{row.label}</Text>
              <Text className="mt-0.5 text-[15px] font-semibold text-[#111827]">
                {workspace[row.key]}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
