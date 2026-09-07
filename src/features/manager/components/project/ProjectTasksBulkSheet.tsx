import {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import { Plus, Trash2 } from "lucide-react-native";
import {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  sheetBackgroundStyle,
  sheetHandleIndicatorStyle,
  SheetHeader,
  useSheetBackdrop,
} from "@/features/components/ui/BottomSheet";
import { DateSelector } from "@/features/manager/components/shared/DateSelector";
import { useTeamRoster } from "@/features/manager/hooks/useTeamRoster";

type DraftRow = {
  id: string;
  title: string;
  assigneeId: string;
  dueDate?: string;
};

export type ProjectTasksBulkSheetRef = {
  present: () => void;
  dismiss: () => void;
};

type ProjectTasksBulkSheetProps = {
  onCreate: (rows: Array<{ title: string; assigneeId: string; dueDate?: string }>) => void;
};

function createRow(): DraftRow {
  return {
    id: `row-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    title: "",
    assigneeId: "",
    dueDate: undefined,
  };
}

export const ProjectTasksBulkSheet = forwardRef<
  ProjectTasksBulkSheetRef,
  ProjectTasksBulkSheetProps
>(function ProjectTasksBulkSheet({ onCreate }, ref) {
  const sheetRef = useRef<BottomSheetModal>(null);
  const insets = useSafeAreaInsets();
  const snapPoints = useMemo(() => ["82%"], []);
  const { members: assignees, isLoading: isLoadingAssignees } = useTeamRoster();
  const [rows, setRows] = useState<DraftRow[]>([createRow()]);
  const [error, setError] = useState<string>();

  useImperativeHandle(ref, () => ({
    present: () => {
      setRows([createRow()]);
      setError(undefined);
      sheetRef.current?.present();
    },
    dismiss: () => sheetRef.current?.dismiss(),
  }));

  const renderBackdrop = useSheetBackdrop();

  const updateRow = (id: string, patch: Partial<DraftRow>) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const removeRow = (id: string) => {
    setRows((prev) => (prev.length > 1 ? prev.filter((row) => row.id !== id) : prev));
  };

  const handleCreate = () => {
    const invalid = rows.some((row) => row.title.trim().length < 2 || !row.assigneeId);
    if (invalid) {
      setError("Each task needs a title and assignee.");
      return;
    }
    setError(undefined);
    onCreate(rows.map(({ title, assigneeId, dueDate }) => ({ title: title.trim(), assigneeId, dueDate })));
    sheetRef.current?.dismiss();
  };

  return (
    <BottomSheetModal
      ref={sheetRef}
      index={0}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      enablePanDownToClose
      keyboardBehavior="interactive"
      android_keyboardInputMode="adjustResize"
      backdropComponent={renderBackdrop}
      backgroundStyle={sheetBackgroundStyle}
      handleIndicatorStyle={sheetHandleIndicatorStyle}
    >
      <BottomSheetScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 6,
          paddingBottom: Math.max(insets.bottom, 16) + 20,
        }}
      >
        <SheetHeader
          title="Add Multiple Tasks"
          subtitle="Add several tasks quickly for this project."
        />

        {rows.map((row, index) => (
          <View key={row.id} className="mt-4 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-3">
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="text-[13px] font-semibold text-[#374151]">Task {index + 1}</Text>
              <Pressable onPress={() => removeRow(row.id)} hitSlop={8}>
                <Trash2 size={16} color="#9CA3AF" />
              </Pressable>
            </View>

            <BottomSheetTextInput
              value={row.title}
              onChangeText={(value) => updateRow(row.id, { title: value })}
              placeholder="Task title"
              placeholderTextColor="#9CA3AF"
              className="h-11 rounded-xl border border-[#E5E7EB] bg-white px-3 text-[14px] text-[#111827]"
            />

            <Text className="mb-1 mt-3 text-[12px] font-semibold text-[#6B7280]">Assignee</Text>
            {isLoadingAssignees ? (
              <Text className="text-[13px] text-[#9CA3AF]">Loading teammates…</Text>
            ) : assignees.length === 0 ? (
              <Text className="text-[13px] text-[#9CA3AF]">No teammates found.</Text>
            ) : (
            <View className="flex-row flex-wrap gap-2">
              {assignees.slice(0, 6).map((person) => {
                const selected = row.assigneeId === person.id;
                return (
                  <Pressable
                    key={person.id}
                    onPress={() => updateRow(row.id, { assigneeId: person.id })}
                    className={`rounded-full border px-3 py-1.5 ${
                      selected ? "border-[#32CD32] bg-[#F0FDF4]" : "border-[#E5E7EB] bg-white"
                    }`}
                  >
                    <Text
                      className={`text-[12px] font-semibold ${
                        selected ? "text-[#16A34A]" : "text-[#6B7280]"
                      }`}
                    >
                      {person.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            )}

            <View className="mt-3">
              <Text className="mb-1 text-[12px] font-semibold text-[#6B7280]">Due date (optional)</Text>
              <DateSelector
                label="Due date"
                value={row.dueDate}
                onChange={(value) => updateRow(row.id, { dueDate: value })}
              />
            </View>
          </View>
        ))}

        <Pressable
          onPress={() => setRows((prev) => [...prev, createRow()])}
          className="mt-4 h-11 flex-row items-center justify-center rounded-xl border border-dashed border-[#D1D5DB]"
        >
          <Plus size={16} color="#6B7280" />
          <Text className="ml-2 text-[13px] font-semibold text-[#6B7280]">Add another task</Text>
        </Pressable>

        {error ? <Text className="mt-2 text-[12px] text-[#EF4444]">{error}</Text> : null}

        <Pressable
          onPress={handleCreate}
          className="mt-5 h-[50px] items-center justify-center rounded-2xl bg-[#32CD32]"
        >
          <Text className="text-[15px] font-semibold text-white">Create {rows.length} Tasks</Text>
        </Pressable>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

