import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import {
  LATE_REASON_PRESETS,
  OTHER_LATE_REASON_ID,
  composeLateReason,
  splitLateReason,
} from "@/features/tasks/utils/lateReasons";
import { colors, palette } from "@/styles";

type LateReasonPopupProps = {
  visible: boolean;
  /** "Nov 12, 2026"; shown in the question. */
  dueDateLabel: string | undefined;
  /** What was chosen before, so reopening keeps it. */
  initialReason: string;
  /** The server's limit for the whole reason. */
  maxLength: number;
  onCancel: () => void;
  onConfirm: (reason: string) => void;
};

function ReasonOption({
  label,
  icon,
  isSelected,
  onPress,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  isSelected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ checked: isSelected }}
      accessibilityLabel={label}
      className={`flex-row items-center gap-3 rounded-2xl px-3.5 py-3 ${
        isSelected ? "bg-brand-subtle" : "bg-field active:bg-subtle"
      }`}
    >
      <View
        className={`h-9 w-9 items-center justify-center rounded-full ${isSelected ? "bg-brand" : "bg-surface"}`}
      >
        <Ionicons name={icon} size={17} color={isSelected ? palette.white : colors.textMuted} />
      </View>
      {/* No fixed line height: Khmer stacks vowels and subscripts above and below the line. */}
      <Text className={`flex-1 py-0.5 text-body-sm ${isSelected ? "font-semibold text-brand-strong" : "text-fg"}`}>
        {label}
      </Text>
      <Ionicons
        name={isSelected ? "checkmark-circle" : "ellipse-outline"}
        size={22}
        color={isSelected ? colors.brand : colors.textSubtle}
      />
    </Pressable>
  );
}

/**
 * Asks why the work is late before a late submission goes out: one tap on a common reason (in
 * Khmer), or "Other" to write one. Optional extra detail is added after the chosen reason.
 */
export function LateReasonPopup({
  visible,
  dueDateLabel,
  initialReason,
  maxLength,
  onCancel,
  onConfirm,
}: LateReasonPopupProps) {
  const [presetId, setPresetId] = useState<string | undefined>();
  const [detail, setDetail] = useState("");

  // Re-seed from the last answer each time the popup opens (adjusting state during render).
  const [prevVisible, setPrevVisible] = useState(visible);
  if (visible !== prevVisible) {
    setPrevVisible(visible);
    if (visible) {
      const previous = splitLateReason(initialReason);
      setPresetId(previous.presetId);
      setDetail(previous.detail);
    }
  }

  const preset = LATE_REASON_PRESETS.find((item) => item.id === presetId);
  const isOther = presetId === OTHER_LATE_REASON_ID;
  const reason = composeLateReason(preset?.label, detail);
  const canConfirm = Boolean(presetId) && reason.length > 0 && (!isOther || detail.trim().length > 0);
  // Leave room for the chosen reason and its " — " separator within the server's limit.
  const detailMaxLength = Math.max(maxLength - (preset ? preset.label.length + 3 : 0), 0);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel} statusBarTranslucent>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View className="flex-1 items-center justify-center bg-black/55 px-5">
          <Pressable className="absolute inset-0" onPress={onCancel} accessibilityLabel="Cancel" />

          <View className="max-h-[88%] w-full max-w-[380px] overflow-hidden rounded-3xl bg-surface">
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <View className="items-center px-5 pt-6">
                <View className="h-14 w-14 items-center justify-center rounded-full bg-warning-subtle">
                  <Ionicons name="time" size={28} color={colors.warning} />
                </View>
                <Text className="mt-3 py-1 text-center text-title font-bold text-fg" accessibilityRole="header">
                  ហេតុអ្វីបានជាដាក់ស្នើយឺត?
                </Text>
                <Text className="mt-0.5 py-0.5 text-center text-caption text-fg-soft">
                  {dueDateLabel ? `ភារកិច្ចនេះផុតកំណត់នៅ ${dueDateLabel}។ ` : ""}
                  អ្នកពិនិត្យនឹងឃើញមូលហេតុនេះ។
                </Text>
              </View>

              <View className="mt-5 gap-2 px-4" accessibilityRole="radiogroup">
                {LATE_REASON_PRESETS.map((item) => (
                  <ReasonOption
                    key={item.id}
                    label={item.label}
                    icon={item.icon}
                    isSelected={presetId === item.id}
                    onPress={() => setPresetId(item.id)}
                  />
                ))}
                <ReasonOption
                  label="ផ្សេងៗ (សរសេរមូលហេតុផ្ទាល់ខ្លួន)"
                  icon="create-outline"
                  isSelected={isOther}
                  onPress={() => setPresetId(OTHER_LATE_REASON_ID)}
                />
              </View>

              {presetId ? (
                <View className="mt-4 px-4">
                  <Text className="mb-2 py-0.5 text-caption font-semibold text-fg-sub">
                    {isOther ? "សរសេរមូលហេតុ" : "ព័ត៌មានបន្ថែម (មិនចាំបាច់)"}
                  </Text>
                  <TextField
                    value={detail}
                    onChangeText={setDetail}
                    placeholder={isOther ? "ពន្យល់ពីមូលហេតុដែលយឺត…" : "ឧ. ហិរញ្ញវត្ថុនឹងអនុម័តនៅថ្ងៃសុក្រ…"}
                    multiline
                    maxLength={detailMaxLength}
                    accessibilityLabel={isOther ? "Reason for late submission" : "More detail"}
                  />
                </View>
              ) : null}

              <View className="flex-row gap-3 p-4 pt-5">
                <View className="flex-1">
                  <Button label="បោះបង់" variant="secondary" onPress={onCancel} />
                </View>
                <View className="flex-1">
                  <Button
                    label="ដាក់ស្នើ"
                    icon="paper-plane"
                    disabled={!canConfirm}
                    onPress={() => onConfirm(reason)}
                  />
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
