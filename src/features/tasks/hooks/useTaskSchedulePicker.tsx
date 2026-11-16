import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useCallback, useEffect, useRef, useState } from "react";
import { Platform, View } from "react-native";

import { ModalSheet } from "@/components/ui/ModalSheet";
import { colors, isDarkMode } from "@/styles";

export type PickerTarget = "startDate" | "endDate" | "startTime" | "endTime";

/** Current values, so each picker opens on what's already chosen. Times are "HH:mm", dates "YYYY-MM-DD". */
export type SchedulePickerValues = {
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
};

type SchedulePickerOptions = {
  /** Earliest pickable date, e.g. today for task dates the API requires to be today or later. */
  minimumDate?: Date;
};
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
  values: SchedulePickerValues,
  onPick: ScheduleFieldPickHandler,
  options: SchedulePickerOptions = {},
) {
  const [pickerTarget, setPickerTarget] = useState<PickerTarget | null>(null);
  const [pickerDate, setPickerDate] = useState(new Date());
  const onPickRef = useRef(onPick);
  useEffect(() => {
    onPickRef.current = onPick;
  }, [onPick]);

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
  // The end date can't be before the start; neither can be before `minimumDate`.
  const startMinimum = options.minimumDate;
  const endFloor = values.startDate ? parseDateValue(values.startDate) : undefined;
  const endMinimum =
    endFloor && startMinimum ? (endFloor > startMinimum ? endFloor : startMinimum) : (endFloor ?? startMinimum);
  const dateMinimum = pickerTarget === "endDate" ? endMinimum : pickerTarget === "startDate" ? startMinimum : undefined;

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
        backgroundColor: colors.surface,
        overflow: "visible",
      }}
    >
      <DateTimePicker
        value={value}
        mode={mode}
        display={Platform.OS === "ios" ? "spinner" : "default"}
        themeVariant={isDarkMode ? "dark" : "light"}
        textColor={colors.text}
        accentColor={colors.brand}
        minimumDate={minimumDate}
        onChange={onChange}
        style={{
          height: PICKER_SPINNER_HEIGHT,
          width: "100%",
          backgroundColor: colors.surface,
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
  // Seeded from pickerDate on mount; a fresh picker session (new pickerTarget or
  // pickerDate from openPicker) remounts this component via the `key` on
  // <IosPickerModal> in SchedulePickerOverlay below, so no sync effect is needed.
  const [localDate, setLocalDate] = useState(pickerDate);

  const handleSpinnerChange = useCallback(
    (event: DateTimePickerEvent, date?: Date) => {
      if (date) setLocalDate(date);
      onChange(event, date);
    },
    [onChange],
  );

  return (
    <ModalSheet visible title={title} onClose={onClose} onConfirm={() => onConfirm(localDate)}>
      <PickerSpinner
        value={localDate}
        mode={pickerMode}
        minimumDate={isDatePicker ? dateMinimum : undefined}
        onChange={handleSpinnerChange}
      />
    </ModalSheet>
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

  return (
    <IosPickerModal
      key={`${overlayProps.pickerTarget}-${overlayProps.pickerDate.getTime()}`}
      {...overlayProps}
    />
  );
}
