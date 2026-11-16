import Ionicons from "@expo/vector-icons/Ionicons";
import {
  BottomSheetModal,
  BottomSheetScrollView,
  TouchableOpacity as BottomSheetTouchableOpacity,
  useBottomSheet,
} from "@gorhom/bottom-sheet";
import { forwardRef, useState } from "react";
import { Controller } from "react-hook-form";
import { Pressable, Text, View } from "react-native";
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
import { Button } from "@/components/ui/Button";
import { FormField, FormSection } from "@/components/ui/FormField";
import { IconButton } from "@/components/ui/IconButton";
import { TextField } from "@/components/ui/TextField";
import {
  OptionPickerSheet,
  type PickerOption,
} from "@/features/tasks/components/shared/OptionPickerSheet";
import { PersonPickerSheet } from "@/features/tasks/components/shared/PersonPickerSheet";
import {
  useCreateTaskForm,
  type AssignTarget,
  type CreateTaskBottomSheetRef,
} from "@/features/tasks/hooks/useCreateTaskForm";
import { SchedulePickerOverlay } from "@/features/tasks/hooks/useTaskSchedulePicker";
import {
  TASK_DESCRIPTION_MAX_LENGTH,
  TASK_TITLE_MAX_LENGTH,
} from "@/features/tasks/schemas/createTask.schema";
import type { AudienceSummary } from "@/features/tasks/utils/taskAudience";
import { colors, priorityColors } from "@/styles";

import { AssigneePicker } from "./AssigneePicker";
import { TaskScheduleFields } from "./TaskScheduleFields";

import type { AssignmentMode, Priority } from "@/features/tasks/types/task.types";

const ASSIGN_TARGET_OPTIONS: PickerOption<AssignTarget>[] = [
  {
    value: "PEOPLE",
    label: "Specific people",
    description: "Pick one or more people by name.",
    icon: "person-outline",
  },
  {
    value: "DEPARTMENT",
    label: "Whole department",
    description: "Everyone active in the department you choose.",
    icon: "business-outline",
  },
  {
    value: "POSITION",
    label: "Everyone in a position",
    description: "Everyone holding the position you choose, e.g. all accountants.",
    icon: "briefcase-outline",
  },
];

const PRIORITY_PICKER_OPTIONS: PickerOption<Priority>[] = [
  { value: "LOW", label: "Low", description: "Whenever there's time.", icon: "flag", iconColor: priorityColors.low },
  { value: "MEDIUM", label: "Medium", description: "Normal work.", icon: "flag", iconColor: priorityColors.medium },
  { value: "HIGH", label: "High", description: "Do this before normal work.", icon: "flag", iconColor: priorityColors.high },
  { value: "URGENT", label: "Urgent", description: "Drop other work for this.", icon: "flag", iconColor: priorityColors.urgent },
];

const MODE_OPTIONS: PickerOption<AssignmentMode>[] = [
  {
    value: "INDIVIDUAL",
    label: "Each person does their own",
    description:
      "Everyone gets their own copy to submit. Progress shows who's done, and the task closes when all are approved.",
    icon: "person-outline",
  },
  {
    value: "SHARED",
    label: "Shared — one submission",
    description: "One task for the whole group. Anyone can submit, and one approval completes it for everyone.",
    icon: "people-outline",
  },
];

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
        <Text className="font-sans text-[17px] font-semibold text-fg">New task</Text>
      </View>
    </Animated.View>
  );
}

export const CreateTaskBottomSheet = forwardRef<CreateTaskBottomSheetRef>(
  function CreateTaskBottomSheet(_, ref) {
    const insets = useSafeAreaInsets();

    const {
      sheetRef,
      snapPoints,
      animationConfigs,
      control,
      errors,
      isSubmitting,
      hasChanges,
      requestClose,
      startDate,
      dueDate,
      assigneeOptions,
      isLoadingAssignees,
      assigneeLoadError,
      isMultiAssignee,
      canSelectAllAssignees,
      selectAllAssignees,
      selectAllLabel,
      assigneePickerTitle,
      canPickDepartment,
      showDepartmentField,
      departmentName,
      departmentOptions,
      isLoadingDepartments,
      departmentLoadError,
      departmentPickerVisible,
      openDepartmentPicker,
      closeDepartmentPicker,
      selectDepartment,
      departmentId,
      assignTo,
      setAssignTo,
      audienceSummary,
      isLoadingAudience,
      audienceLoadError,
      positionId,
      positionName,
      positionDepartmentName,
      positionOptions,
      positionError,
      positionPickerVisible,
      openPositionPicker,
      closePositionPicker,
      selectPosition,
      openPicker,
      overlayProps,
      onSubmit,
    } = useCreateTaskForm(ref);

    // Once something is entered, a backdrop tap asks before discarding instead of closing.
    const renderBackdrop = useSheetBackdrop(!isSubmitting, hasChanges ? requestClose : undefined);

    // Which select dropdown is open (only one at a time).
    const [openSelect, setOpenSelect] = useState<"priority" | "assignTo" | "mode" | null>(null);
    const assignTargetOption =
      ASSIGN_TARGET_OPTIONS.find((option) => option.value === assignTo) ?? ASSIGN_TARGET_OPTIONS[0];

    return (
      <>
        <BottomSheetModal
          ref={sheetRef}
          index={0}
          snapPoints={snapPoints}
          animationConfigs={animationConfigs}
          enableDynamicSizing={false}
          // Swiping away would silently lose what was typed; the close button asks first.
          enablePanDownToClose={!hasChanges && !isSubmitting}
          enableContentPanningGesture
          enableHandlePanningGesture
          backdropComponent={renderBackdrop}
          backgroundComponent={ExpandableSheetBackground}
          handleComponent={ExpandableSheetHandle}
          keyboardBehavior="interactive"
          keyboardBlurBehavior="restore"
          android_keyboardInputMode="adjustResize"
        >
          <View className="flex-1 bg-surface">
            <CreateTaskSheetHeader topInset={insets.top} onClose={requestClose} />

            <BottomSheetScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled
              style={{ flex: 1 }}
              contentContainerStyle={{
                paddingHorizontal: 20,
                paddingTop: 0,
                paddingBottom: 24,
                flexGrow: 1,
              }}
            >
              <FormSection title="What">
                <FormField label="Title" error={errors.title?.message}>
                  <Controller
                    control={control}
                    name="title"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextField
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholder="e.g. Update sprint board"
                        maxLength={TASK_TITLE_MAX_LENGTH}
                        accessibilityLabel="Title"
                        isInvalid={Boolean(errors.title)}
                      />
                    )}
                  />
                </FormField>

                <FormField label="Description" isOptional error={errors.description?.message}>
                  <Controller
                    control={control}
                    name="description"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextField
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholder="Details, links, what done looks like…"
                        multiline
                        maxLength={TASK_DESCRIPTION_MAX_LENGTH}
                        accessibilityLabel="Description"
                        isInvalid={Boolean(errors.description)}
                      />
                    )}
                  />
                </FormField>

                <FormField label="Priority" error={errors.priority?.message}>
                  <Controller
                    control={control}
                    name="priority"
                    render={({ field: { onChange, value } }) => {
                      const selected = PRIORITY_PICKER_OPTIONS.find((option) => option.value === value);
                      return (
                        <>
                          <SelectField
                            icon="flag"
                            iconColor={selected?.iconColor}
                            value={selected?.label}
                            placeholder="Choose a priority"
                            accessibilityLabel={`Priority: ${selected?.label ?? "none selected"}. Change`}
                            onPress={() => setOpenSelect("priority")}
                          />
                          <OptionPickerSheet
                            visible={openSelect === "priority"}
                            title="Priority"
                            options={PRIORITY_PICKER_OPTIONS}
                            value={value}
                            onSelect={(priority) => {
                              onChange(priority);
                              setOpenSelect(null);
                            }}
                            onClose={() => setOpenSelect(null)}
                          />
                        </>
                      );
                    }}
                  />
                </FormField>
              </FormSection>

              <FormSection title="Who">
                {canPickDepartment ? (
                  <FormField label="Assign to">
                    <SelectField
                      icon={assignTargetOption.icon ?? "people-outline"}
                      value={assignTargetOption.label}
                      placeholder="Choose who gets this task"
                      accessibilityLabel={`Assign to: ${assignTargetOption.label}. Change`}
                      onPress={() => setOpenSelect("assignTo")}
                    />
                    <OptionPickerSheet
                      visible={openSelect === "assignTo"}
                      title="Assign to"
                      options={ASSIGN_TARGET_OPTIONS}
                      value={assignTo}
                      onSelect={(target) => {
                        setAssignTo(target);
                        setOpenSelect(null);
                      }}
                      onClose={() => setOpenSelect(null)}
                    />
                  </FormField>
                ) : null}

                {showDepartmentField ? (
                  <FormField
                    label={assignTo === "DEPARTMENT" ? "Which department?" : "Filed under department"}
                    hint={
                      assignTo === "PEOPLE"
                        ? "You don't belong to a department, so choose which one this task is filed under."
                        : undefined
                    }
                  >
                    <SelectField
                      icon="business-outline"
                      value={departmentName}
                      placeholder="Choose a department"
                      accessibilityLabel={`Department: ${departmentName ?? "none selected"}. Change department`}
                      onPress={openDepartmentPicker}
                    />
                  </FormField>
                ) : null}

                {assignTo === "POSITION" ? (
                  <FormField label="Which position?" error={positionError}>
                    <SelectField
                      icon="briefcase-outline"
                      value={positionName ? `${positionName} · ${positionDepartmentName ?? ""}` : undefined}
                      placeholder="Choose a position"
                      accessibilityLabel={`Position: ${positionName ?? "none selected"}. Change position`}
                      onPress={openPositionPicker}
                    />
                  </FormField>
                ) : null}

                {audienceSummary ? <AudienceNotice summary={audienceSummary} /> : null}

                {assignTo === "PEOPLE" ? (
                  <FormField
                    label="Assignees"
                    error={errors.assignees?.message}
                    action={
                      canSelectAllAssignees ? (
                        <Pressable onPress={selectAllAssignees} hitSlop={8} accessibilityRole="button">
                          <Text className="text-label font-semibold text-brand-strong">{selectAllLabel}</Text>
                        </Pressable>
                      ) : null
                    }
                  >
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
                          title={assigneePickerTitle}
                        />
                      )}
                    />
                  </FormField>
                ) : null}

                {isMultiAssignee ? (
                  <FormField label="How should they work on it?" error={errors.assignmentMode?.message}>
                    <Controller
                      control={control}
                      name="assignmentMode"
                      render={({ field: { onChange, value } }) => {
                        const selected = MODE_OPTIONS.find((option) => option.value === value);
                        return (
                          <>
                            <SelectField
                              icon={selected?.icon ?? "person-outline"}
                              value={selected?.label}
                              placeholder="Choose how they work on it"
                              accessibilityLabel={`Work mode: ${selected?.label ?? "none selected"}. Change`}
                              onPress={() => setOpenSelect("mode")}
                            />
                            {selected?.description ? (
                              <Text className="mt-1.5 px-1 text-label leading-[17px] text-fg-soft">
                                {selected.description}
                              </Text>
                            ) : null}
                            <OptionPickerSheet
                              visible={openSelect === "mode"}
                              title="How should they work on it?"
                              options={MODE_OPTIONS}
                              value={value}
                              onSelect={(mode) => {
                                onChange(mode);
                                setOpenSelect(null);
                              }}
                              onClose={() => setOpenSelect(null)}
                            />
                          </>
                        );
                      }}
                    />
                  </FormField>
                ) : null}
              </FormSection>

              <FormSection title="When">
                <TaskScheduleFields
                  values={{ startDate, dueDate }}
                  onOpenPicker={openPicker}
                  errors={{
                    startDate: errors.startDate?.message,
                    dueDate: errors.dueDate?.message,
                  }}
                />
              </FormSection>
            </BottomSheetScrollView>

            <View
              className="border-t border-line-soft bg-surface px-5 pt-3"
              style={{ paddingBottom: Math.max(insets.bottom, 8) }}
            >
              <Button label="Create task" icon="add" isLoading={isSubmitting} onPress={onSubmit} />
            </View>
          </View>
        </BottomSheetModal>

        {canPickDepartment ? (
          <PersonPickerSheet
            visible={departmentPickerVisible}
            title="Task department"
            onClose={closeDepartmentPicker}
            people={departmentOptions}
            isLoading={isLoadingDepartments}
            loadError={departmentLoadError}
            selectionMode="single"
            selectedId={departmentId}
            onSelect={selectDepartment}
          />
        ) : null}

        {canPickDepartment ? (
          <PersonPickerSheet
            visible={positionPickerVisible}
            title="Assign to everyone in"
            onClose={closePositionPicker}
            people={positionOptions}
            isLoading={isLoadingAudience}
            loadError={audienceLoadError}
            selectionMode="single"
            selectedId={positionId}
            onSelect={selectPosition}
          />
        ) : null}

        <SchedulePickerOverlay overlayProps={overlayProps} />
      </>
    );
  },
);

/**
 * A tappable field that opens a picker sheet, showing the current choice. Uses the bottom sheet's
 * own touchable so taps aren't swallowed by the sheet's pan gesture on Android.
 *
 * On Android that touchable comes from react-native-gesture-handler, which NativeWind doesn't style,
 * so the classes live on an inner View (styled on both platforms) and the touchable only handles taps.
 */
function SelectField({
  icon,
  iconColor,
  value,
  placeholder,
  accessibilityLabel,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  /** Defaults to the muted field colour. */
  iconColor?: string;
  value: string | undefined;
  placeholder: string;
  accessibilityLabel: string;
  onPress: () => void;
}) {
  return (
    <BottomSheetTouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <View className="h-12 flex-row items-center gap-2 rounded-xl border border-line bg-field px-3.5">
        <Ionicons name={icon} size={18} color={iconColor ?? colors.textMuted} />
        <Text
          className={`flex-1 text-body-sm ${value ? "font-semibold text-fg" : "text-fg-soft"}`}
          numberOfLines={1}
        >
          {value ?? placeholder}
        </Text>
        <Ionicons name="chevron-down" size={16} color={colors.textMuted} />
      </View>
    </BottomSheetTouchableOpacity>
  );
}

/** Who a department / position choice reaches, so the admin knows before creating. */
function AudienceNotice({ summary }: { summary: AudienceSummary }) {
  const { text, isWarning } = summary;
  return (
    <View
      className={`mt-3 flex-row items-start gap-2 rounded-xl px-3.5 py-3 ${isWarning ? "bg-error-subtle" : "bg-brand-subtle"}`}
    >
      <Ionicons
        name={isWarning ? "alert-circle-outline" : "people-outline"}
        size={18}
        color={isWarning ? colors.danger : colors.brand}
        style={{ marginTop: 1 }}
      />
      <Text className={`flex-1 text-label leading-[18px] ${isWarning ? "text-error" : "text-brand-strong"}`}>
        {text}
      </Text>
    </View>
  );
}
