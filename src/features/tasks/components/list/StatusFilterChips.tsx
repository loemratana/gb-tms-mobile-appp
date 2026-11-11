import { View } from "react-native";

import { ChipRow, type ChipOption } from "@/components/ui/ChipRow";
import type { StatusFilter } from "@/features/tasks/types/taskView.types";
import { palette } from "@/styles";

const STATUS_OPTIONS: ChipOption<StatusFilter>[] = [
  { key: "all", label: "All", color: palette.gray[700] },
  { key: "todo", label: "To Do", color: palette.amber[600] },
  { key: "in_progress", label: "In Progress", color: palette.blue[600] },
  { key: "review", label: "In Review", color: palette.violet[500] },
  { key: "done", label: "Done", color: palette.green[600] },
  { key: "overdue", label: "Overdue", color: palette.red[600] },
  { key: "cancelled", label: "Cancelled", color: palette.gray[500] },
];

type StatusFilterChipsProps = {
  active: StatusFilter;
  onChange: (status: StatusFilter) => void;
  counts?: Record<StatusFilter, number>;
};

export function StatusFilterChips({
  active,
  onChange,
  counts,
}: StatusFilterChipsProps) {
  const options = counts
    ? STATUS_OPTIONS.map((option) => ({
        ...option,
        count: counts[option.key],
      }))
    : STATUS_OPTIONS;

  return (
    <View className="py-3">
      <ChipRow
        options={options}
        active={active}
        onChange={onChange}
        selectedVariant="solid"
      />
    </View>
  );
}