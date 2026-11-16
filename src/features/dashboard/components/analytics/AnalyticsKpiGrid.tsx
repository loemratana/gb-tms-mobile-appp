import Ionicons from "@expo/vector-icons/Ionicons";
import { Text, View } from "react-native";

import { ProgressBar } from "@/components/ui/ProgressBar";
import type { ManagerAssignedKpiResponse } from "@/features/tasks/types/task.types";
import { toneColors, type Tone } from "@/styles";

type KpiTileProps = {
  icon: keyof typeof Ionicons.glyphMap;
  tone: Tone;
  value: string;
  label: string;
  hint: string;
  /** 0–100: shows a progress bar under the value. */
  progress?: number;
};

function KpiTile({ icon, tone, value, label, hint, progress }: KpiTileProps) {
  const colors = toneColors[tone];
  return (
    <View
      className="flex-1 rounded-2xl px-3.5 py-3"
      style={{ backgroundColor: colors.subtle }}
      accessible
      accessibilityLabel={`${label}: ${value}. ${hint}`}
    >
      <View className="flex-row items-center gap-1.5">
        <Ionicons name={icon} size={14} color={colors.color} />
        <Text className="text-label font-semibold" style={{ color: colors.fg }}>
          {label}
        </Text>
      </View>
      <Text className="mt-1.5 text-display font-bold text-fg">{value}</Text>
      {progress !== undefined ? (
        <View className="mt-1.5">
          <ProgressBar value={progress} tone={tone} accessibilityLabel={`${label} ${progress} percent`} />
        </View>
      ) : null}
      <Text className="mt-1 text-label text-fg-soft" numberOfLines={1}>
        {hint}
      </Text>
    </View>
  );
}

/** The four numbers a manager checks first, before any chart. */
export function AnalyticsKpiGrid({ kpi }: { kpi: ManagerAssignedKpiResponse }) {
  const completionRate = kpi.totalTasks > 0 ? Math.round((kpi.doneTasks / kpi.totalTasks) * 100) : 0;
  // The KPI already leaves out cancelled tasks, so "open" is everything not done.
  const openTasks = kpi.totalTasks - kpi.doneTasks;

  return (
    <View className="gap-3">
      <View className="flex-row gap-3">
        <KpiTile
          icon="checkmark-done"
          tone="success"
          value={`${completionRate}%`}
          label="Completed"
          hint={`${kpi.doneTasks} of ${kpi.totalTasks} tasks`}
          progress={completionRate}
        />
        <KpiTile icon="layers-outline" tone="info" value={String(openTasks)} label="Open" hint="Not finished yet" />
      </View>
      <View className="flex-row gap-3">
        <KpiTile
          icon="eye-outline"
          tone="warning"
          value={String(kpi.reviewTasks)}
          label="In review"
          hint={kpi.reviewTasks > 0 ? "Waiting for a decision" : "Nothing waiting"}
        />
        <KpiTile
          icon="alert-circle-outline"
          tone={kpi.overdueTasks > 0 ? "error" : "neutral"}
          value={String(kpi.overdueTasks)}
          label="Overdue"
          hint={kpi.overdueTasks > 0 ? "Past the due date" : "All on schedule"}
        />
      </View>
    </View>
  );
}
