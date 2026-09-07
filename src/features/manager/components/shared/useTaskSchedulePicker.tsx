import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useCallback, useEffect, useRef, useState } from "react";
import { Modal, Platform, Pressable, Text, View } from "react-native";
import { FullWindowOverlay } from "react-native-screens";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { ScheduleValues } from "@/features/manager/components/shared/TaskScheduleFields";

export type PickerTarget = "startDate" | "endDate" | "startTime" | "endTime";
export type ScheduleFieldPickHandler = (target: PickerTarget, value: string) => void;

const PICKER_SPINNER_HEIGHT = 216;

function parseDateValue(dateStr?: string) {
  return dateStr ? new Date(`${dateStr}T12:00:00`) : new Date();
}

function parseTimeValue(timeStr?: string) {
  const next = new Date();
  if (!timeStr) return next;
  const [hours, minutes] = timeStr.split(":").map(Number);
  next.setHours(hours, minutes, 0, 0);
  return next;
}

function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatLocalTime(date: Date) {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

function getPickerTitle(target: PickerTarget) {
  switch (target) {
    case "startDate":
      return "Start Date";
    case "endDate":
      return "End Date";
    case "startTime":
      return "Start Time";
    case "endTime":
      return "End Time";
  }
}

function formatPickerValue(target: PickerTarget, date: Date) {
  if (target === "startDate" || target === "endDate") {
    return formatLocalDate(date);
  }
  return formatLocalTime(date);
}

export function useTaskSchedulePicker(
  values: ScheduleValues,
  onPick: ScheduleFieldPickHandler,
) {
  const [pickerTarget, setPickerTarget] = useState<PickerTarget | null>(null);
  const [pickerDate, setPickerDate] = useState(new Date());
  const onPickRef = useRef(onPick);
  onPickRef.current = onPick;

  const openPicker = useCallback(
    (target: PickerTarget) => {
      setPickerTarget(target);
      if (target === "startDate") setPickerDate(parseDateValue(values.startDate));
      if (target === "endDate") setPickerDate(parseDateValue(values.endDate));
      if (target === "startTime") setPickerDate(parseTimeValue(values.startTime));
      if (target === "endTime") setPickerDate(parseTimeValue(values.endTime));
    },
    [values.endDate, values.endTime, values.startDate, values.startTime],
  );

  const closePicker = useCallback(() => setPickerTarget(null), []);

  const confirmPicker = useCallback((target: PickerTarget, date: Date) => {
    onPickRef.current(target, formatPickerValue(target, date));
    setPickerTarget(null);
  }, []);

  const handlePickerChange = useCallback(
    (event: DateTimePickerEvent, date?: Date) => {
      if (!pickerTarget) return;

      if (Platform.OS === "android") {
        if (event.type === "set" && date) confirmPicker(pickerTarget, date);
        else setPickerTarget(null);
        return;
      }

      if (date) setPickerDate(date);
    },
    [confirmPicker, pickerTarget],
  );

  const pickerMode: "date" | "time" =
    pickerTarget?.includes("Time") ? "time" : "date";
  const isDatePicker = pickerTarget === "startDate" || pickerTarget === "endDate";
  const dateMinimum =
    pickerTarget === "endDate" && values.startDate
      ? parseDateValue(values.startDate)
      : undefined;

  return {
    openPicker,
    overlayProps: pickerTarget
      ? {
          pickerTarget,
          pickerDate,
          pickerMode,
          isDatePicker,
          dateMinimum,
          title: getPickerTitle(pickerTarget),
          onClose: closePicker,
          onConfirm: (date: Date) => confirmPicker(pickerTarget, date),
          onChange: handlePickerChange,
        }
      : null,
  };
}

type SchedulePickerOverlayProps = {
  pickerTarget: PickerTarget;
  pickerDate: Date;
  pickerMode: "date" | "time";
  isDatePicker: boolean;
  dateMinimum?: Date;
  title: string;
  onClose: () => void;
  onConfirm: (date: Date) => void;
  onChange: (event: DateTimePickerEvent, date?: Date) => void;
};

function PickerSpinner({
  value,
  mode,
  minimumDate,
  onChange,
}: {
  value: Date;
  mode: "date" | "time";
  minimumDate?: Date;
  onChange: (event: DateTimePickerEvent, date?: Date) => void;
}) {
  return (
    <View
      style={{
        height: PICKER_SPINNER_HEIGHT,
        width: "100%",
        justifyContent: "center",
        backgroundColor: "#FFFFFF",
        overflow: "visible",
      }}
    >
      <DateTimePicker
        value={value}
        mode={mode}
        display={Platform.OS === "ios" ? "spinner" : "default"}
        themeVariant="light"
        textColor="#111827"
        accentColor="#32CD32"
        minimumDate={minimumDate}
        onChange={onChange}
        style={{
          height: PICKER_SPINNER_HEIGHT,
          width: "100%",
          backgroundColor: "#FFFFFF",
        }}
      />
    </View>
  );
}

function IosPickerModal({
  pickerTarget,
  pickerDate,
  pickerMode,
  isDatePicker,
  dateMinimum,
  title,
  onClose,
  onConfirm,
  onChange,
}: SchedulePickerOverlayProps) {
  const insets = useSafeAreaInsets();
  const [localDate, setLocalDate] = useState(pickerDate);

  useEffect(() => {
    setLocalDate(pickerDate);
  }, [pickerDate, pickerTarget]);

  const handleSpinnerChange = useCallback(
    (event: DateTimePickerEvent, date?: Date) => {
      if (date) setLocalDate(date);
      onChange(event, date);
    },
    [onChange],
  );

  const sheet = (
    <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.45)" }}>
      <Pressable style={{ flex: 1 }} onPress={onClose} accessibilityLabel="Close picker" />
      <View
        style={{
          backgroundColor: "#FFFFFF",
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: Math.max(insets.bottom, 16) + 12,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <Pressable onPress={onClose} hitSlop={8}>
            <Text style={{ fontSize: 16, color: "#6B7280" }}>Cancel</Text>
          </Pressable>
          <Text style={{ fontSize: 16, fontWeight: "600", color: "#111827" }}>{title}</Text>
          <Pressable onPress={() => onConfirm(localDate)} hitSlop={8}>
            <Text style={{ fontSize: 16, fontWeight: "600", color: "#32CD32" }}>Done</Text>
          </Pressable>
        </View>

        <PickerSpinner
          value={localDate}
          mode={pickerMode}
          minimumDate={isDatePicker ? dateMinimum : undefined}
          onChange={handleSpinnerChange}
        />
      </View>
    </View>
  );

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      {Platform.OS === "ios" ? <FullWindowOverlay>{sheet}</FullWindowOverlay> : sheet}
    </Modal>
  );
}

/** Only mount while open */
export function SchedulePickerOverlay({
  overlayProps,
}: {
  overlayProps: SchedulePickerOverlayProps | null;
}) {
  if (!overlayProps) return null;

  if (Platform.OS === "android") {
    return (
      <DateTimePicker
        value={overlayProps.pickerDate}
        mode={overlayProps.pickerMode}
        minimumDate={overlayProps.isDatePicker ? overlayProps.dateMinimum : undefined}
        onChange={overlayProps.onChange}
      />
    );
  }

  return <IosPickerModal {...overlayProps} />;
}
