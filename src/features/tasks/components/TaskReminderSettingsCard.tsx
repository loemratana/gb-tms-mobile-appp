import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Bell, ChevronRight, Plus, Trash2 } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Platform,
  Pressable,
  Switch,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  DEFAULT_REMINDER_TIMEZONE,
  getTimezoneLabel,
  REMINDER_TIMEZONE_OPTIONS,
} from "@/features/tasks/data/timezones";
import { useUpdateTaskReminderSettings } from "@/features/tasks/hooks/useTaskMutations";
import { useTaskReminderSettings } from "@/features/tasks/hooks/useTasks";

const MAX_REMINDER_TIMES = 6;

const CARD_SHADOW = Platform.select({
  ios: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  android: { elevation: 1 },
});

function formatLocalTime(date: Date) {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

function parseTimeValue(timeStr: string) {
  const next = new Date();
  const [hours, minutes] = timeStr.split(":").map(Number);
  next.setHours(hours || 0, minutes || 0, 0, 0);
  return next;
}

function formatDisplayTime(timeStr: string) {
  return parseTimeValue(timeStr).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

type TaskReminderSettingsCardProps = {
  taskId: string | undefined;
};

export function TaskReminderSettingsCard({ taskId }: TaskReminderSettingsCardProps) {
  const insets = useSafeAreaInsets();
  const { data, isLoading, isError } = useTaskReminderSettings(taskId);
  const updateMutation = useUpdateTaskReminderSettings(taskId ?? "");

  const [enabled, setEnabled] = useState(true);
  const [timezone, setTimezone] = useState(DEFAULT_REMINDER_TIMEZONE);
  const [times, setTimes] = useState<string[]>([]);
  const [tzModalVisible, setTzModalVisible] = useState(false);
  const [activeTimeIndex, setActiveTimeIndex] = useState<number | null>(null);
  const [pickerDate, setPickerDate] = useState(new Date());

  useEffect(() => {
    if (!data) return;
    setEnabled(data.enabled);
    setTimezone(data.timezone);
    setTimes([...data.reminderTimes].sort());
  }, [data]);

  const openTimePicker = useCallback(
    (index: number) => {
      setPickerDate(index < times.length ? parseTimeValue(times[index]) : new Date());
      setActiveTimeIndex(index);
    },
    [times]
  );

  const closeTimePicker = useCallback(() => setActiveTimeIndex(null), []);

  const confirmTimePicker = useCallback(
    (index: number, date: Date) => {
      const value = formatLocalTime(date);
      setTimes((prev) => {
        if (index < prev.length) {
          const next = [...prev];
          next[index] = value;
          return next.sort();
        }
        if (prev.includes(value)) return prev;
        return [...prev, value].sort();
      });
      setActiveTimeIndex(null);
    },
    []
  );

  const handleAndroidChange = useCallback(
    (event: DateTimePickerEvent, date?: Date) => {
      if (activeTimeIndex === null) return;
      if (event.type === "set" && date) {
        confirmTimePicker(activeTimeIndex, date);
      } else {
        setActiveTimeIndex(null);
      }
    },
    [activeTimeIndex, confirmTimePicker]
  );

  const removeTime = useCallback((index: number) => {
    setTimes((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSave = useCallback(() => {
    updateMutation.mutate(
      { enabled, timezone, reminderTimes: times },
      {
        onSuccess: () => {
          Alert.alert("Saved", "Reminder settings updated.");
        },
        onError: () => {
          Alert.alert("Couldn't save", "Please try again.");
        },
      }
    );
  }, [updateMutation, enabled, timezone, times]);

  if (!taskId) return null;

  return (
    <View>
      <Text className="mb-3 text-[13px] font-semibold uppercase tracking-[1px] text-[#9CA3AF]">
        Reminders
      </Text>

      <View
        className="rounded-3xl border border-[#E5E7EB] bg-white p-4"
        style={CARD_SHADOW}
      >
        {isLoading ? (
          <View className="items-center py-4">
            <ActivityIndicator color="#32CD32" />
          </View>
        ) : isError ? (
          <Text className="text-[13px] text-[#EF4444]">
            {"Couldn't load reminder settings."}
          </Text>
        ) : (
          <>
            <View className="flex-row items-center justify-between">
              <View className="flex-1 flex-row items-center gap-2 pr-3">
                <Bell size={16} color="#6B7280" />
                <Text className="text-[14px] font-semibold text-[#111827]">
                  Remind me while this task is incomplete
                </Text>
              </View>
              <Switch
                value={enabled}
                onValueChange={setEnabled}
                trackColor={{ false: "#D1D5DB", true: "#86EFAC" }}
                thumbColor={enabled ? "#32CD32" : "#F9FAFB"}
              />
            </View>

            {enabled ? (
              <>
                <Pressable
                  onPress={() => setTzModalVisible(true)}
                  className="mt-4 flex-row items-center justify-between rounded-2xl bg-[#F9FAFB] px-3 py-3"
                >
                  <View>
                    <Text className="text-[11px] text-[#9CA3AF]">Timezone</Text>
                    <Text className="mt-0.5 text-[13px] font-semibold text-[#111827]">
                      {getTimezoneLabel(timezone)}
                    </Text>
                  </View>
                  <ChevronRight size={16} color="#9CA3AF" />
                </Pressable>

                <View className="mt-4">
                  <Text className="mb-2 text-[11px] text-[#9CA3AF]">
                    Reminder times ({times.length}/{MAX_REMINDER_TIMES})
                  </Text>
                  {times.map((time, index) => (
                    <View
                      key={`${time}-${index}`}
                      className="mb-2 flex-row items-center justify-between rounded-2xl bg-[#F9FAFB] px-3 py-2.5"
                    >
                      <Pressable
                        onPress={() => openTimePicker(index)}
                        className="flex-1"
                      >
                        <Text className="text-[14px] font-semibold text-[#111827]">
                          {formatDisplayTime(time)}
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() => removeTime(index)}
                        hitSlop={8}
                        accessibilityLabel={`Remove ${formatDisplayTime(time)} reminder`}
                      >
                        <Trash2 size={16} color="#EF4444" />
                      </Pressable>
                    </View>
                  ))}

                  {times.length < MAX_REMINDER_TIMES ? (
                    <Pressable
                      onPress={() => openTimePicker(times.length)}
                      className="flex-row items-center justify-center gap-1.5 rounded-2xl border border-dashed border-[#D1D5DB] py-2.5"
                    >
                      <Plus size={14} color="#32CD32" />
                      <Text className="text-[13px] font-semibold text-[#32CD32]">
                        Add reminder time
                      </Text>
                    </Pressable>
                  ) : null}
                </View>
              </>
            ) : null}

            <Pressable
              onPress={handleSave}
              disabled={updateMutation.isPending}
              className="mt-4 items-center rounded-2xl bg-[#111827] py-3"
              style={{ opacity: updateMutation.isPending ? 0.6 : 1 }}
            >
              <Text className="text-[13px] font-semibold text-white">
                {updateMutation.isPending ? "Saving…" : "Save reminder settings"}
              </Text>
            </Pressable>
          </>
        )}
      </View>

      {/* Timezone picker */}
      <Modal
        visible={tzModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setTzModalVisible(false)}
      >
        <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.45)" }}>
          <Pressable
            style={{ flex: 1 }}
            onPress={() => setTzModalVisible(false)}
            accessibilityLabel="Close timezone picker"
          />
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingTop: 16,
              paddingBottom: Math.max(insets.bottom, 16) + 12,
              maxHeight: "70%",
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: "#111827",
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              Timezone
            </Text>
            <FlatList
              data={REMINDER_TIMEZONE_OPTIONS}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    setTimezone(item.value);
                    setTzModalVisible(false);
                  }}
                  style={{
                    paddingHorizontal: 20,
                    paddingVertical: 14,
                    backgroundColor:
                      item.value === timezone ? "#ECFDF5" : "transparent",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: item.value === timezone ? "700" : "500",
                      color: item.value === timezone ? "#15803D" : "#111827",
                    }}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Time picker */}
      {activeTimeIndex !== null ? (
        Platform.OS === "android" ? (
          <DateTimePicker
            value={pickerDate}
            mode="time"
            onChange={handleAndroidChange}
          />
        ) : (
          <Modal visible transparent animationType="slide" onRequestClose={closeTimePicker}>
            <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.45)" }}>
              <Pressable
                style={{ flex: 1 }}
                onPress={closeTimePicker}
                accessibilityLabel="Close time picker"
              />
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
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <Pressable onPress={closeTimePicker} hitSlop={8}>
                    <Text style={{ fontSize: 16, color: "#6B7280" }}>Cancel</Text>
                  </Pressable>
                  <Text style={{ fontSize: 16, fontWeight: "600", color: "#111827" }}>
                    Reminder Time
                  </Text>
                  <Pressable
                    onPress={() => confirmTimePicker(activeTimeIndex, pickerDate)}
                    hitSlop={8}
                  >
                    <Text style={{ fontSize: 16, fontWeight: "600", color: "#32CD32" }}>
                      Done
                    </Text>
                  </Pressable>
                </View>
                <DateTimePicker
                  value={pickerDate}
                  mode="time"
                  display="spinner"
                  themeVariant="light"
                  textColor="#111827"
                  accentColor="#32CD32"
                  onChange={(_event, date) => {
                    if (date) setPickerDate(date);
                  }}
                  style={{ height: 216, width: "100%", backgroundColor: "#FFFFFF" }}
                />
              </View>
            </View>
          </Modal>
        )
      ) : null}
    </View>
  );
}
