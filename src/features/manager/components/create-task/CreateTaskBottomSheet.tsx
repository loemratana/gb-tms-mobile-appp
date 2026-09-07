import {
  BottomSheetModal,
  BottomSheetScrollView,
  useBottomSheet,
} from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { forwardRef, type ReactNode } from "react";
import { Controller } from "react-hook-form";
import { Pressable, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated";

import {
  ExpandableSheetBackground,
  ExpandableSheetHandle,
  useSheetBackdrop,
} from "@/features/components/ui/BottomSheet";
import { SubtaskEditorSheet } from "@/features/manager/components/create-task/SubtaskEditorSheet";
import { SubtaskListSection } from "@/features/manager/components/create-task/SubtaskListSection";
import { TaskPrioritySelector } from "@/features/manager/components/create-task/TaskPrioritySelector";
import { AssigneePicker } from "@/features/manager/components/shared/AssigneePicker";
import { TaskScheduleFields } from "@/features/manager/components/shared/TaskScheduleFields";
import { SchedulePickerOverlay } from "@/features/manager/components/shared/useTaskSchedulePicker";
import {
  useCreateTaskForm,
  type CreateTaskBottomSheetRef,
} from "@/features/manager/hooks/useCreateTaskForm";
import { VoiceRecordingModal } from "@/features/tasks/components/voice/VoiceRecordingModal";
import { VoiceTaskButton } from "@/features/tasks/components/voice/VoiceTaskButton";

const SHEET_BG = "#FFFFFF";

export type { CreateTaskBottomSheetRef };

function CreateTaskSheetHeader({
  topInset,
  isSaving,
  onBack,
  onSave,
}: {
  topInset: number;
  isSaving: boolean;
  onBack: () => void;
  onSave: () => void;
}) {
  const { animatedIndex } = useBottomSheet();

  const containerStyle = useAnimatedStyle(() => ({
    paddingTop: interpolate(animatedIndex.value, [0, 1], [0, topInset], Extrapolation.CLAMP),
  }));

  return (
    <Animated.View
      style={containerStyle}
      className="border-b border-[#F3F4F6] bg-white"
    >
      <View className="flex-row items-center justify-between px-4 pb-3 pt-1">
        <View className="flex-1 flex-row items-center gap-2">
          <Pressable
            onPress={onBack}
            className="h-9 w-9 items-center justify-center rounded-full bg-[#F3F4F6]"
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={22} color="#111827" />
          </Pressable>
          <Text className="text-[18px] font-bold text-[#111827]">Create task</Text>
        </View>

        <Pressable
          onPress={onSave}
          disabled={isSaving}
          hitSlop={8}
          style={{ opacity: isSaving ? 0.45 : 1 }}
        >
          <Text className="text-[16px] font-semibold text-[#32CD32]">
            {isSaving ? "Saving..." : "Save"}
          </Text>
        </Pressable>
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
      subtaskEditorRef,
      snapPoints,
      animationConfigs,
      handleSheetChange,
      handleClose,
      control,
      errors,
      isSubmitting,
      fields,
      remove,
      subtasks,
      scheduleType,
      startDate,
      endDate,
      startTime,
      endTime,
      assignees,
      departmentId,
      assigneeOptions,
      isLoadingAssignees,
      assigneeLoadError,
      applySchedule,
      openPicker,
      overlayProps,
      isVoiceModalOpen,
      openVoiceModal,
      closeVoiceModal,
      handleVoiceApply,
      handleSubtaskSave,
      openSubtaskEditor,
      onSubmit,
    } = useCreateTaskForm(ref);

    return (
      <>
        <BottomSheetModal
          ref={sheetRef}
          index={0}
          snapPoints={snapPoints}
          animationConfigs={animationConfigs}
          enableDynamicSizing={false}
          enablePanDownToClose
          enableContentPanningGesture
          enableHandlePanningGesture
          onChange={handleSheetChange}
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
              isSaving={isSubmitting}
              onBack={handleClose}
              onSave={onSubmit}
            />

            <BottomSheetScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled
              style={{ flex: 1 }}
              contentContainerStyle={{
                paddingHorizontal: 20,
                paddingTop: 8,
                paddingBottom: Math.max(insets.bottom, 16) + 20,
                flexGrow: 1,
              }}
            >
              <Field
                label="Title"
                error={errors.title?.message}
                action={<VoiceTaskButton onPress={openVoiceModal} />}
              >
                <Controller
                  control={control}
                  name="title"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="e.g. Update sprint board"
                      placeholderTextColor="#9CA3AF"
                      className="h-12 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 text-[15px] text-[#111827]"
                    />
                  )}
                />
              </Field>

              <Field label="Description" error={errors.description?.message}>
                <Controller
                  control={control}
                  name="description"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="What needs to be done?"
                      placeholderTextColor="#9CA3AF"
                      multiline
                      textAlignVertical="top"
                      className="min-h-[96px] rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-[15px] text-[#111827]"
                    />
                  )}
                />
              </Field>

              <Field label="Priority" error={errors.priority?.message}>
                <Controller
                  control={control}
                  name="priority"
                  render={({ field: { onChange, value } }) => (
                    <TaskPrioritySelector value={value} onChange={onChange} />
                  )}
                />
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
                      loadError={assigneeLoadError}
                    />
                  )}
                />
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
                }}
              />

              <SubtaskListSection
                fields={fields}
                subtasks={subtasks}
                onAdd={() => openSubtaskEditor()}
                onEdit={openSubtaskEditor}
                onRemove={remove}
              />
            </BottomSheetScrollView>
          </View>
        </BottomSheetModal>

        <SchedulePickerOverlay overlayProps={overlayProps} />

        <VoiceRecordingModal
          visible={isVoiceModalOpen}
          departmentId={departmentId}
          employees={assigneeOptions}
          onClose={closeVoiceModal}
          onApply={handleVoiceApply}
        />

        <SubtaskEditorSheet
          ref={subtaskEditorRef}
          parentValues={{
            assignees,
            scheduleType,
            startDate,
            endDate,
            startTime,
            endTime,
          }}
          employees={assigneeOptions}
          onSave={handleSubtaskSave}
        />
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
        <Text className="text-[13px] font-semibold text-[#374151]">{label}</Text>
        {action}
      </View>
      {children}
      {error ? (
        <Text className="mt-1 text-[12px] text-[#EF4444]">{error}</Text>
      ) : null}
    </View>
  );
}
