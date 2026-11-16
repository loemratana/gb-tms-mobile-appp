import type { ReactNode } from "react";
import { Text, View } from "react-native";

type ChartSectionProps = {
  title: string;
  /** One line of context under the title, e.g. "Last 7 days". */
  subtitle?: string;
  /** Right of the title, e.g. a total. */
  meta?: string;
  children: ReactNode;
};

/**
 * One block of the analytics report: a heading and its chart, laid straight on the page.
 * No card or shadow — the report reads as one clean page, not a stack of widgets.
 */
export function ChartSection({ title, subtitle, meta, children }: ChartSectionProps) {
  return (
    <View>
      <View className="flex-row items-start justify-between gap-3">
        <View className="min-w-0 flex-1">
          <Text className="text-headline font-semibold text-fg" accessibilityRole="header">
            {title}
          </Text>
          {subtitle ? <Text className="mt-0.5 text-label text-fg-soft">{subtitle}</Text> : null}
        </View>
        {meta ? <Text className="text-body-sm font-semibold text-fg-sub">{meta}</Text> : null}
      </View>
      <View className="mt-4">{children}</View>
    </View>
  );
}
