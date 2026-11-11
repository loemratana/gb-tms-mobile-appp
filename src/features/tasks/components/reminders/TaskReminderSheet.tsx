import Ionicons from "@expo/vector-icons/Ionicons";
import { BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { Pressable, Switch, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import {
  SheetHeader,
  sheetBackgroundStyle,
  sheetHandleIndicatorStyle,
  useSheetBackdrop,
} from "@/components/ui/BottomSheet";
import { SkeletonBlock } from "@/components/ui/Skeleton";
import { ReminderTimeGrid } from "./ReminderTimeGrid";
import { ReminderTimePicker } from "./ReminderTimePicker";
import { ReminderTimezoneField } from "./ReminderTimezoneField";
import {
  MAX_REMINDER_TIMES,
  useReminderSettingsForm,
} from "@/features/tasks/hooks/useReminderSettingsForm";
import { colors, palette } from "@/styles";

export type TaskReminderSheetRef = {
  present: () => void;
  dismiss: () => void;
};

type TaskReminderSheetProps = {
  taskId: string | undefined;
};

/** Which time the picker is editing: an index into the list, or "new" for an added time. */
type PickerTarget = number | "new" | null;

/** Per-task alarm reminders: on/off, daily ring times, and timezone. */
export const TaskReminderSheet = forwardRef<
  TaskReminderSheetRef,
  TaskReminderSheetProps
>(function TaskReminderSheet({ taskId }, ref) {
  const sheetRef = useRef<BottomSheetModal>(null);
  const insets = useSafeAreaInsets();
  const snapPoints = useMemo(() => ["85%"], []);
  const renderBackdrop = useSheetBackdrop();
  const [isSaving, setIsSaving] = useState(false);

  useImperativeHandle(ref, () => ({
    present: () => sheetRef.current?.present(),
    dismiss: () => sheetRef.current?.dismiss(),
  }));

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      enablePanDownToClose={!isSaving}
      topInset={insets.top}
      backdropComponent={renderBackdrop}
      backgroundStyle={sheetBackgroundStyle}
      handleIndicatorStyle={sheetHandleIndicatorStyle}
    >
      {/* The modal only mounts its children while open, so reminder settings are
            fetched when the sheet opens — not every time a task screen opens. */}
      <ReminderSheetContent
        taskId={taskId}
        onClose={() => sheetRef.current?.dismiss()}
        onSavingChange={setIsSaving}
      />
    </BottomSheetModal>
  );
});

type ReminderSheetContentProps = {
  taskId: string | undefined;
  onClose: () => void;
  onSavingChange: (isSaving: boolean) => void;
};

function ReminderSheetContent({
  taskId,
  onClose,
  onSavingChange,
}: ReminderSheetContentProps) {
  const insets = useSafeAreaInsets();
  const form = useReminderSettingsForm(taskId);
  const [pickerTarget, setPickerTarget] = useState<PickerTarget>(null);

  useEffect(() => {
    onSavingChange(form.isSaving);
  }, [form.isSaving, onSavingChange]);

  const handleSave = async () => {
    if (await form.save()) onClose();
  };

  const needsTime = form.isEnabled && form.times.length === 0;
  const canSave = form.isDirty && !form.isSaving && !needsTime;

  return (
    <>
      <View style={{ flex: 1 }}>
        <View className="px-5 pt-1">
          <SheetHeader
            title="Reminders"
            subtitle="An alarm rings at these times until the task is done"
            onClose={onClose}
          />
        </View>

        <BottomSheetScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
        >
          {!taskId ? null : form.isLoading ? (
            <View className="gap-3">
              <SkeletonBlock height={84} radius={16} className="w-full" />
              <View className="flex-row gap-2.5">
                <SkeletonBlock height={76} radius={16} className="flex-1" />
                <SkeletonBlock height={76} radius={16} className="flex-1" />
              </View>
              <SkeletonBlock height={64} radius={16} className="w-full" />
            </View>
          ) : form.isError ? (
            <View className="items-center rounded-2xl border border-line bg-field px-6 py-8">
              <Ionicons
                name="cloud-offline-outline"
                size={24}
                color={palette.gray[400]}
              />
              <Text className="mt-2 text-body-sm font-semibold text-fg">
                Couldn&apos;t load reminders
              </Text>
              <Pressable
                onPress={form.refetch}
                accessibilityRole="button"
                className="mt-3 rounded-xl border border-line bg-surface px-4 py-2 active:bg-subtle"
              >
                <Text className="text-caption font-semibold text-fg">
                  Try again
                </Text>
              </Pressable>
            </View>
          ) : (
            <View className="gap-5">
              <View
                className="flex-row items-center gap-3 rounded-2xl px-4 py-4"
                style={{
                  backgroundColor: form.isEnabled
                    ? palette.blue[50]
                    : palette.gray[50],
                }}
              >
                <View
                  className="h-11 w-11 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: form.isEnabled
                      ? colors.brand
                      : palette.gray[200],
                  }}
                >
                  <Ionicons
                    name={form.isEnabled ? "alarm" : "alarm-outline"}
                    size={22}
                    color={
                      form.isEnabled ? colors.textInverse : palette.gray[500]
                    }
                  />
                </View>
                <View className="min-w-0 flex-1">
                  <Text className="text-body font-semibold text-fg">
                    Alarm reminders
                  </Text>
                  <Text className="mt-0.5 text-label leading-[17px] text-fg-soft">
                    {form.isEnabled
                      ? "Rings every day at the times below while the task is open."
                      : "Off — you won't be reminded about this task."}
                  </Text>
                </View>
                <Switch
                  value={form.isEnabled}
                  onValueChange={form.setIsEnabled}
                  accessibilityLabel="Alarm reminders"
                  trackColor={{ false: palette.gray[300], true: colors.brandBorder }}
                  thumbColor={form.isEnabled ? colors.brand : palette.gray[50]}
                />
              </View>

              <ReminderTimeGrid
                times={form.times}
                maxTimes={MAX_REMINDER_TIMES}
                canAddTime={form.canAddTime}
                isDisabled={!form.isEnabled}
                onEdit={(index) => setPickerTarget(index)}
                onAdd={() => setPickerTarget("new")}
                onQuickAdd={(value) => form.saveTime(value)}
                onRemove={form.removeTime}
              />

              {needsTime ? (
                <Text className="-mt-2 text-label text-warning">
                  Add at least one time, or turn reminders off.
                </Text>
              ) : null}

              <ReminderTimezoneField
                value={form.timezone}
                onChange={form.setTimezone}
                isDisabled={!form.isEnabled}
              />
            </View>
          )}
        </BottomSheetScrollView>

        <View
          className="border-t border-line-soft bg-surface px-5 pt-3"
          style={{ paddingBottom: Math.max(insets.bottom, 12) }}
        >
          <Button
            label={form.isDirty ? "Save reminders" : "No changes"}
            isLoading={form.isSaving}
            disabled={!canSave}
            onPress={() => void handleSave()}
          />
        </View>
      </View>

      {pickerTarget !== null ? (
        <ReminderTimePicker
          initialTime={
            pickerTarget === "new" ? undefined : form.times[pickerTarget]
          }
          onConfirm={(value) => {
            form.saveTime(
              value,
              pickerTarget === "new" ? undefined : pickerTarget,
            );
            setPickerTarget(null);
          }}
          onCancel={() => setPickerTarget(null)}
        />
      ) : null}
    </>
  );
}
