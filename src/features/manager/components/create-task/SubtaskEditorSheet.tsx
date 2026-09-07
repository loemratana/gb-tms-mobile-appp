import {
  BottomSheetModal,
  BottomSheetScrollView,
  useBottomSheetSpringConfigs,
} from "@gorhom/bottom-sheet";
import { zodResolver } from "@hookform/resolvers/zod";
import { Ionicons } from "@expo/vector-icons";
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import {
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { FullWindowOverlay } from "react-native-screens";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "@/constants/theme";
import {
  sheetBackgroundStyle,
  sheetHandleIndicatorStyle,
} from "@/features/components/ui/BottomSheet";
import {
  EMPTY_SUBTASK,
  subtaskSchema,
  type CreateTaskFormValues,
  type SubtaskFormValues,
} from "@/features/manager/components/create-task/taskFormSchema";
import {
  AssigneePicker,
  type AssigneePickerOption,
} from "@/features/manager/components/shared/AssigneePicker";
import {
  sheetInputClassName,
  sheetTextAreaClassName,
  SheetField,
} from "@/features/manager/components/shared/sheetForm";
import { TaskScheduleFields } from "@/features/manager/components/shared/TaskScheduleFields";
import {
  SchedulePickerOverlay,
  useTaskSchedulePicker,
  type PickerTarget,
} from "@/features/manager/components/shared/useTaskSchedulePicker";

export type SubtaskEditorSheetRef = {
  open: (values?: SubtaskFormValues, index?: number) => void;
  close: () => void;
};

type SubtaskEditorSheetProps = {
  parentValues: Pick<
    CreateTaskFormValues,
    | "assignees"
    | "scheduleType"
    | "startDate"
    | "endDate"
    | "startTime"
    | "endTime"
  >;
  employees: readonly AssigneePickerOption[];
  onSave: (values: SubtaskFormValues, index?: number) => void;
};

function SubtaskSheetContainer({
  children,
  onClose,
}: {
  children?: ReactNode;
  onClose: () => void;
}) {
  const content = (
    <View style={styles.portalContent} pointerEvents="box-none">
      <Pressable
        style={styles.overlay}
        onPress={onClose}
        accessibilityLabel="Close subtask editor"
      />
      <View style={styles.sheetLayer} pointerEvents="box-none">
        {children}
      </View>
    </View>
  );

  if (Platform.OS === "ios") {
    return <FullWindowOverlay>{content}</FullWindowOverlay>;
  }

  return <View style={styles.androidPortal}>{content}</View>;
}

export const SubtaskEditorSheet = forwardRef<
  SubtaskEditorSheetRef,
  SubtaskEditorSheetProps
>(function SubtaskEditorSheet({ parentValues, employees, onSave }, ref) {
  const insets = useSafeAreaInsets();
  const sheetRef = useRef<BottomSheetModal>(null);
  const [editingIndex, setEditingIndex] = useState<number | undefined>();

  const snapPoints = useMemo(() => ["88%"], []);
  const animationConfigs = useBottomSheetSpringConfigs({
    damping: 70,
    stiffness: 400,
    mass: 0.35,
    overshootClamping: true,
  });

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<SubtaskFormValues>({
    resolver: zodResolver(subtaskSchema),
    defaultValues: EMPTY_SUBTASK,
  });

  const inheritFromParent = useWatch({ control, name: "inheritFromParent" }) ?? true;
  const scheduleType = useWatch({ control, name: "scheduleType" }) ?? "date";
  const startDate = useWatch({ control, name: "startDate" }) ?? "";
  const endDate = useWatch({ control, name: "endDate" }) ?? "";
  const startTime = useWatch({ control, name: "startTime" }) ?? "";
  const endTime = useWatch({ control, name: "endTime" }) ?? "";

  const pickScheduleField = useCallback(
    (target: PickerTarget, value: string) => {
      setValue(target, value, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    },
    [setValue],
  );

  const applySchedule = useCallback(
    (next: {
      scheduleType: SubtaskFormValues["scheduleType"];
      startDate?: string;
      endDate?: string;
      startTime?: string;
      endTime?: string;
    }) => {
      setValue("scheduleType", next.scheduleType, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setValue("startDate", next.startDate ?? "", {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setValue("endDate", next.endDate ?? "", {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setValue("startTime", next.startTime ?? "", {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setValue("endTime", next.endTime ?? "", {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    },
    [setValue],
  );

  const { openPicker, overlayProps } = useTaskSchedulePicker(
    { scheduleType, startDate, endDate, startTime, endTime },
    pickScheduleField,
  );

  const handleDismiss = useCallback(() => {
    setEditingIndex(undefined);
    reset(EMPTY_SUBTASK);
  }, [reset]);

  const handleClose = useCallback(() => {
    sheetRef.current?.dismiss();
  }, []);

  useImperativeHandle(ref, () => ({
    open: (values, index) => {
      setEditingIndex(index);
      reset(values ?? EMPTY_SUBTASK);
      sheetRef.current?.present();
    },
    close: handleClose,
  }));

  const submit = useCallback(() => {
    void handleSubmit((values) => {
      onSave(values, editingIndex);
      handleClose();
    })();
  }, [handleSubmit, onSave, editingIndex, handleClose]);

  const isEditing = editingIndex !== undefined;

  const containerComponent = useCallback(
    (props: { children?: ReactNode }) => (
      <SubtaskSheetContainer onClose={handleClose}>
        {props.children}
      </SubtaskSheetContainer>
    ),
    [handleClose],
  );

  return (
    <>
      <BottomSheetModal
        ref={sheetRef}
        index={0}
        snapPoints={snapPoints}
        stackBehavior="push"
        animationConfigs={animationConfigs}
        enableDynamicSizing={false}
        enablePanDownToClose
        enableContentPanningGesture
        enableHandlePanningGesture
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
        onDismiss={handleDismiss}
        containerComponent={containerComponent}
        backgroundStyle={sheetBackgroundStyle}
        handleIndicatorStyle={sheetHandleIndicatorStyle}
      >
        <View className="flex-row items-center justify-between border-b border-[#F3F4F6] px-4 pb-3">
          <Pressable
            onPress={handleClose}
            hitSlop={8}
            className="h-9 w-9 items-center justify-center rounded-full bg-[#F3F4F6]"
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={22} color="#111827" />
          </Pressable>

          <Text className="text-[16px] font-semibold text-[#111827]">
            {isEditing ? "Edit subtask" : "Add subtask"}
          </Text>

          <Pressable onPress={() => void submit()} hitSlop={8}>
            <Text className="text-[16px] font-semibold text-[#32CD32]">Save</Text>
          </Pressable>
        </View>

        <BottomSheetScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 8,
            paddingBottom: Math.max(insets.bottom, 16) + 20,
          }}
        >
          <SheetField label="Title" error={errors.title?.message}>
            <Controller
              control={control}
              name="title"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Subtask title"
                  placeholderTextColor="#9CA3AF"
                  className={sheetInputClassName}
                  autoFocus
                />
              )}
            />
          </SheetField>

          <SheetField label="Description (optional)">
            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  value={value ?? ""}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="What needs to be done?"
                  placeholderTextColor="#9CA3AF"
                  multiline
                  textAlignVertical="top"
                  className={sheetTextAreaClassName}
                />
              )}
            />
          </SheetField>

          <View className="mt-4 flex-row items-center justify-between rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3">
            <View className="flex-1 pr-3">
              <Text className="text-[13px] font-semibold text-[#374151]">
                Use parent settings
              </Text>
              <Text className="mt-0.5 text-[12px] text-[#6B7280]">
                Inherit assignees and schedule from the main task
              </Text>
            </View>
            <Controller
              control={control}
              name="inheritFromParent"
              render={({ field: { onChange, value } }) => (
                <Switch
                  value={value}
                  onValueChange={onChange}
                  trackColor={{ false: "#D1D5DB", true: "#86EFAC" }}
                  thumbColor={value ? "#32CD32" : "#F9FAFB"}
                />
              )}
            />
          </View>

          {inheritFromParent ? (
            <View className="mt-3 rounded-xl bg-[#F0FDF4] px-4 py-3">
              <Text className="text-[12px] font-medium text-[#15803D]">
                Assignees and schedule will match the parent task
              </Text>
              <Text className="mt-1 text-[12px] text-[#6B7280]">
                {parentValues.assignees.length} assignee
                {parentValues.assignees.length === 1 ? "" : "s"} ·{" "}
                {parentValues.scheduleType === "date"
                  ? "Date range"
                  : parentValues.scheduleType === "time"
                    ? "Time range"
                    : "Date & time"}
              </Text>
            </View>
          ) : (
            <>
              <SheetField label="Assignees" error={errors.assignees?.message}>
                <Controller
                  control={control}
                  name="assignees"
                  render={({ field: { onChange, value } }) => (
                    <AssigneePicker
                      employees={employees}
                      value={value}
                      onChange={onChange}
                    />
                  )}
                />
              </SheetField>

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
            </>
          )}
        </BottomSheetScrollView>
      </BottomSheetModal>

      <SchedulePickerOverlay overlayProps={overlayProps} />
    </>
  );
});

const styles = StyleSheet.create({
  portalContent: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.overlay,
  },
  sheetLayer: {
    flex: 1,
  },
  androidPortal: {
    ...StyleSheet.absoluteFill,
    zIndex: 1000,
    elevation: 1000,
  },
});
