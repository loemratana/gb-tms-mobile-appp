import { useMemo, useState } from "react";
import { View } from "react-native";

import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { StateView } from "@/components/ui/StateView";
import { groupMyWork, type MyWorkFilter } from "@/features/dashboard/utils/myWork";
import { TaskRow } from "@/features/tasks/components/shared/TaskRow";
import type { Task } from "@/features/tasks/types/taskView.types";

const MAX_ROWS = 5;

const EMPTY_COPY: Record<MyWorkFilter, { title: string; message: string }> = {
  today: { title: "Nothing due today", message: "You're all caught up." },
  upcoming: { title: "Nothing upcoming", message: "No open tasks are due later." },
  done: { title: "No completed tasks yet", message: "Finished tasks will show up here." },
};

type MyWorkSectionProps = {
  tasks: Task[];
  onTaskPress: (task: Task) => void;
  onSeeAll: () => void;
};

/** "My work": Today / Upcoming / Done switch over the user's own tasks. */
export function MyWorkSection({ tasks, onTaskPress, onSeeAll }: MyWorkSectionProps) {
  const [filter, setFilter] = useState<MyWorkFilter>("today");
  const groups = useMemo(() => groupMyWork(tasks), [tasks]);
  const visible = groups[filter].slice(0, MAX_ROWS);

  return (
    <View>
      <SectionHeader title="My work" actionLabel="See all" onPressAction={onSeeAll} />
      <SegmentedControl
        value={filter}
        onChange={setFilter}
        options={[
          { value: "today", label: `Today ${groups.today.length}` },
          { value: "upcoming", label: `Upcoming ${groups.upcoming.length}` },
          { value: "done", label: `Done ${groups.done.length}` },
        ]}
      />
      <View className="mt-3">
        {visible.length === 0 ? (
          <StateView
            variant="empty"
            icon="checkmark-done-circle-outline"
            title={EMPTY_COPY[filter].title}
            message={EMPTY_COPY[filter].message}
            isCompact
          />
        ) : (
          <Card isFlush className="overflow-hidden">
            {visible.map((task, index) => (
              <TaskRow key={task.id} task={task} onPress={onTaskPress} hasDivider={index > 0} />
            ))}
          </Card>
        )}
      </View>
    </View>
  );
}
