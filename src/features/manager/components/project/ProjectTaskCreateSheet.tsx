import {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  sheetBackgroundStyle,
  sheetHandleIndicatorStyle,
  SheetHeader,
  useSheetBackdrop,
} from "@/features/components/ui/BottomSheet";
import { DateSelector } from "@/features/manager/components/shared/DateSelector";
import { PrioritySelector } from "@/features/manager/components/shared/PrioritySelector";
import { useTeamRoster } from "@/features/manager/hooks/useTeamRoster";
import type { ProjectPriority } from "@/features/manager/types/project";

export type ProjectTaskCreateSheetRef = {
  present: () => void;
  dismiss: () => void;
};

type ProjectTaskCreateSheetProps = {
  onCreate: (input: {
    title: string;
    description: string;
    assigneeId: string;
    dueDate?: string;
    priority: ProjectPriority;
  }) => void;
};

export const ProjectTaskCreateSheet = forwardRef<
  ProjectTaskCreateSheetRef,
  ProjectTaskCreateSheetProps
>(function ProjectTaskCreateSheet({ onCreate }, ref) {
  const sheetRef = useRef<BottomSheetModal>(null);
  const insets = useSafeAreaInsets();
  const snapPoints = useMemo(() => ["72%"], []);
  const { members: assignees, isLoading: isLoadingAssignees } = useTeamRoster();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [priority, setPriority] = useState<ProjectPriority>("medium");
  const [dueDate, setDueDate] = useState<string>();
  const [error, setError] = useState<string>();

  useImperativeHandle(ref, () => ({
    present: () => {
      setTitle("");
      setDescription("");
      setAssigneeId("");
      setPriority("medium");
      setDueDate(undefined);
      setError(undefined);
      sheetRef.current?.present();
    },
    dismiss: () => sheetRef.current?.dismiss(),
  }));

  const renderBackdrop = useSheetBackdrop();

  const handleCreate = () => {
    if (title.trim().length < 2) {
      setError("Task title must be at least 2 characters.");
      return;
    }
    if (!assigneeId) {
      setError("Select an assignee.");
      return;
    }
    setError(undefined);
    onCreate({ title: title.trim(), description: description.trim(), assigneeId, dueDate, priority });
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
          paddingTop: 0,
          paddingBottom: Math.max(insets.bottom, 16) + 20,
        }}
      >
        <SheetHeader
          title="Create Task"
          subtitle="Assign work to your team in seconds."
        />

        <Field label="Title">
          <BottomSheetTextInput
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Authentication API"
            placeholderTextColor="#9CA3AF"
            className="h-12 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 text-[15px] text-[#111827]"
          />
        </Field>

        <Field label="Description">
          <BottomSheetTextInput
            value={description}
            onChangeText={setDescription}
            placeholder="What needs to be done?"
            placeholderTextColor="#9CA3AF"
            multiline
            textAlignVertical="top"
            className="min-h-[96px] rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-[15px] text-[#111827]"
          />
        </Field>

        <Field label="Assignee">
          {isLoadingAssignees ? (
            <Text className="text-[13px] text-[#9CA3AF]">Loading teammates…</Text>
          ) : assignees.length === 0 ? (
            <Text className="text-[13px] text-[#9CA3AF]">No teammates found.</Text>
          ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingRight: 4, paddingVertical: 2 }}
          >
            {assignees.slice(0, 8).map((person) => {
              const selected = assigneeId === person.id;
              return (
                <Pressable
                  key={person.id}
                  onPress={() => setAssigneeId(person.id)}
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
          </ScrollView>
          )}
        </Field>

        <Field label="Priority">
          <PrioritySelector value={priority} onChange={setPriority} />
        </Field>

        <Field label="Due date">
          <DateSelector label="Due date" value={dueDate} onChange={setDueDate} />
        </Field>

        {error ? <Text className="mt-2 text-[12px] text-[#EF4444]">{error}</Text> : null}

        <Pressable
          onPress={handleCreate}
          className="mt-5 h-[50px] items-center justify-center rounded-2xl bg-[#32CD32]"
        >
          <Text className="text-[15px] font-semibold text-white">Create Task</Text>
        </Pressable>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View className="mt-4">
      <Text className="mb-2 text-[13px] font-semibold text-[#374151]">{label}</Text>
      {children}
    </View>
  );
}

