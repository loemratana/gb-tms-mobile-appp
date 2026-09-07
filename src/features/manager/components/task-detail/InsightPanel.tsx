import { AlertTriangle, Gauge, Sparkles } from "lucide-react-native";
import { Platform, Text, View } from "react-native";

export type TaskInsightData = {
  riskLevel: "low" | "medium" | "high";
  riskNotes: string[];
  productivityScore: number;
  efficiencyLabel: string;
};

const CARD_SHADOW = Platform.select({
  ios: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
  },
  android: { elevation: 3 },
});

const RISK_STYLES = {
  low: { label: "Low", color: "#32CD32", bg: "#ECFDF5" },
  medium: { label: "Medium", color: "#F59E0B", bg: "#FFF7ED" },
  high: { label: "High", color: "#EF4444", bg: "#FEF2F2" },
};

type InsightPanelProps = {
  insights: TaskInsightData;
};

export function InsightPanel({ insights }: InsightPanelProps) {
  const risk = RISK_STYLES[insights.riskLevel];

  return (
    <View
      className="rounded-3xl border border-[#F3F4F6] bg-white p-4"
      style={CARD_SHADOW}
    >
      <View className="mb-4 flex-row items-center gap-2">
        <Sparkles size={18} color="#32CD32" strokeWidth={2.2} />
        <Text className="text-[15px] font-semibold text-[#111827]">Insights</Text>
      </View>

      <View
        className="mb-4 flex-row items-center justify-between rounded-2xl px-3 py-3"
        style={{ backgroundColor: risk.bg }}
      >
        <View className="flex-row items-center gap-2">
          <AlertTriangle size={16} color={risk.color} strokeWidth={2.2} />
          <Text className="text-[13px] font-semibold text-[#111827]">Risk Level</Text>
        </View>
        <Text className="text-[13px] font-bold" style={{ color: risk.color }}>
          {risk.label}
        </Text>
      </View>

      <View className="mb-4 gap-2">
        {insights.riskNotes.map((note) => (
          <Text key={note} className="text-[13px] leading-5 text-[#6B7280]">
            • {note}
          </Text>
        ))}
      </View>

      <View className="flex-row gap-3">
        <View className="flex-1 rounded-2xl bg-[#F9FAFB] p-3">
          <View className="mb-2 flex-row items-center gap-1.5">
            <Gauge size={14} color="#32CD32" strokeWidth={2.2} />
            <Text className="text-[11px] font-medium text-[#6B7280]">
              Productivity Score
            </Text>
          </View>
          <Text className="text-[24px] font-bold text-[#111827]">
            {insights.productivityScore.toFixed(1)}
            <Text className="text-[14px] font-semibold text-[#9CA3AF]"> /10</Text>
          </Text>
        </View>

        <View className="flex-1 rounded-2xl bg-[#F9FAFB] p-3">
          <Text className="mb-2 text-[11px] font-medium text-[#6B7280]">
            Work Efficiency
          </Text>
          <Text className="text-[16px] font-bold text-[#111827]">
            {insights.efficiencyLabel}
          </Text>
        </View>
      </View>
    </View>
  );
}
