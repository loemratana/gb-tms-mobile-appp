import {
  BottomSheetModal,
  BottomSheetScrollView,
  useBottomSheet,
} from "@gorhom/bottom-sheet";
import { forwardRef, type ReactNode } from "react";
import { Controller } from "react-hook-form";
import { Text, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  ExpandableSheetBackground,
  ExpandableSheetHandle,
  useSheetBackdrop,
} from "@/components/ui/BottomSheet";
import {
  useCreateTaskForm,
  type CreateTaskBottomSheetRef,
} from "@/features/tasks/hooks/useCreateTaskForm";
import { IconButton } from "@/components/ui/IconButton";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { SchedulePickerOverlay } from "@/features/tasks/hooks/useTaskSchedulePicker";
import { colors } from "@/styles";
import { AssigneePicker } from "./AssigneePicker";
import { TaskPrioritySelector } from "./TaskPrioritySelector";
import { TaskScheduleFields } from "./TaskScheduleFields";

const SHEET_BG = colors.surface;

export type { CreateTaskBottomSheetRef };

function CreateTaskSheetHeader({
  topInset,
  onClose,
}: {
  topInset: number;
  onClose: () => void;
}) {
  const { animatedIndex } = useBottomSheet();

  const containerStyle = useAnimatedStyle(() => ({
    paddingTop: interpolate(animatedIndex.value, [0, 1], [0, topInset], Extrapolation.CLAMP),
  }));

  return (
    <Animated.View style={containerStyle} className="border-b border-line-soft bg-surface">
      <View className="h-12 flex-row items-center justify-center px-4">
        <View className="absolute left-3">
          <IconButton icon="close" variant="subtle" accessibilityLabel="Close" onPress={onClose} />
        </View>
        <Text className="text-[17px] font-semibold text-fg">New task</Text>
      </View>
    </Animated.View>
  );
}

export const CreateTaskBottomSheet = forwardRef<CreateTaskBottomSheetRef>(
  function CreateTaskBottomSheet(_, ref) {
    const insets = useSafeAreaInsets();
    const renderBackdrop = useSheetBackdrop();

    const {
      sheetRef,
      snapPoints,
      animationConfigs,
      control,
      errors,
      isSubmitting,
      scheduleType,
      startDate,
      endDate,
      startTime,
      endTime,
      assigneeOptions,
      isLoadingAssignees,
      assigneeLoadError,
      applySchedule,
      openPicker,
      overlayProps,
      onSubmit,
    } = useCreateTaskForm(ref);

    const newLocal = <BottomSheetModal
      ref={sheetRef}
      index={0}
      snapPoints={snapPoints}
      animationConfigs={animationConfigs}
      enableDynamicSizing={false}
      enablePanDownToClose
      enableContentPanningGesture
      enableHandlePanningGesture
      backdropComponent={renderBackdrop}
      backgroundComponent={ExpandableSheetBackground}
      handleComponent={ExpandableSheetHandle}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
    >
      <View style={{ flex: 1, backgroundColor: SHEET_BG }}>
        <CreateTaskSheetHeader
          topInset={insets.top}
          onClose={() => sheetRef.current?.dismiss()} />

        <BottomSheetScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 8,
            paddingBottom: 24,
            flexGrow: 1,
          }}
        >
          <Field
            label="Title"
            error={errors.title?.message}
          >
            <Controller
              control={control}
              name="title"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextField
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="e.g. Update sprint board"
                />
              )} />
          </Field>

          <Field label="Description" error={errors.description?.message}>
            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextField
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="What needs to be done?"
                  multiline
                />
              )} />
          </Field>

          <Field label="Priority" error={errors.priority?.message}>
            <Controller
              control={control}
              name="priority"
              render={({ field: { onChange, value } }) => (
                <TaskPrioritySelector value={value} onChange={onChange} />
              )} />
          </Field>

          <Field label="Assignees" error={errors.assignees?.message}>
            <Controller
              control={control}
              name="assignees"
              render={({ field: { onChange, value } }) => (
                <AssigneePicker
                  employees={assigneeOptions}
                  value={value}
                  onChange={onChange}
                  isLoading={isLoadingAssignees}
                  loadError={assigneeLoadError} />
              )} />
          </Field>

          <TaskScheduleFields
            values={{ scheduleType, startDate, endDate, startTime, endTime }}
            onChange={applySchedule}
            onOpenPicker={openPicker}
            errors={{
              startDate: errors.startDate?.message,
              endDate: errors.endDate?.message,
              startTime: errors.startTime?.message,
              endTime: errors.endTime?.message,
            }} />
        </BottomSheetScrollView>

        <View
          className="border-t border-line-soft bg-surface px-5 pt-3"
          style={{ paddingBottom: Math.max(insets.bottom, 8) }}
        >
          <Button label="Create task" icon="add" isLoading={isSubmitting} onPress={onSubmit} />
        </View>
      </View>
    </BottomSheetModal>;
    return (
      <>
        {newLocal}

        <SchedulePickerOverlay overlayProps={overlayProps} />
      </>
    );
  },
);

function Field({
  label,
  error,
  action,
  children,
}: {
  label: string;
  error?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <View className="mt-4">
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-caption font-semibold text-fg-sub">{label}</Text>
        {action}
      </View>
      {children}
      {error ? (
        <Text className="mt-1 text-label text-error">{error}</Text>
      ) : null}
    </View>
  );
}
