import { Mic, Square, X } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { FullWindowOverlay } from "react-native-screens";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { TaskExtractionResult } from "@/features/tasks/components/voice/TaskExtractionResult";
import { VoiceTranscription } from "@/features/tasks/components/voice/VoiceTranscription";
import { VoiceWaveform } from "@/features/tasks/components/voice/VoiceWaveform";
import { useVoiceRecorder } from "@/features/tasks/hooks/useVoiceRecorder";
import {
  useParseVoiceTask,
  useTranscribeVoice,
} from "@/features/tasks/hooks/useVoiceTaskMutations";
import type { Priority } from "@/features/tasks/types/task.types";
import type { VoiceAssigneeOption } from "@/features/tasks/types/voice.types";

export type VoiceExtractionApplyValues = {
  title: string;
  description: string;
  priority: Priority;
  dueDate: string | null;
  assigneeId: string | undefined;
};

type ModalPhase = "recording" | "transcribing" | "parsing" | "result" | "permission-denied" | "error";

type VoiceRecordingModalProps = {
  visible: boolean;
  departmentId: string | undefined;
  employees: readonly VoiceAssigneeOption[];
  onClose: () => void;
  onApply: (values: VoiceExtractionApplyValues) => void;
};

function formatDuration(millis: number): string {
  const totalSeconds = Math.floor(millis / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function extensionFromUri(uri: string): string {
  const match = /\.([a-zA-Z0-9]+)$/.exec(uri);
  return match?.[1]?.toLowerCase() ?? "m4a";
}

const MIME_BY_EXTENSION: Record<string, string> = {
  m4a: "audio/m4a",
  "3gp": "audio/3gpp",
  wav: "audio/wav",
};

export function VoiceRecordingModal({
  visible,
  departmentId,
  employees,
  onClose,
  onApply,
}: VoiceRecordingModalProps) {
  const insets = useSafeAreaInsets();
  const recorder = useVoiceRecorder();
  const transcribeMutation = useTranscribeVoice();
  const parseMutation = useParseVoiceTask();

  const [phase, setPhase] = useState<ModalPhase>("recording");
  const [transcript, setTranscript] = useState("");
  const [isEditingTranscript, setIsEditingTranscript] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [dueDateText, setDueDateText] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<
    { userId: string; fullName: string; score: number }[]
  >([]);
  const [assigneeId, setAssigneeId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!visible) return;
    setPhase("recording");
    setTranscript("");
    setIsEditingTranscript(false);
    void recorder.start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  useEffect(() => {
    if (recorder.status === "permission-denied") setPhase("permission-denied");
    if (recorder.status === "error") setPhase("error");
  }, [recorder.status]);

  const runParse = async (text: string) => {
    if (!departmentId) {
      setPhase("error");
      return;
    }
    setPhase("parsing");
    try {
      const result = await parseMutation.mutateAsync({
        text,
        language: "km-KH",
        departmentId,
      });
      setTitle(result.title);
      setDescription(result.description ?? "");
      setPriority(result.priority);
      setDueDate(result.dueDate);
      setDueDateText(result.dueDateText);
      setCandidates(result.assigneeCandidates);
      setAssigneeId(result.assigneeCandidates[0]?.userId);
      setPhase("result");
    } catch {
      setPhase("error");
    }
  };

  const handleStop = async () => {
    await recorder.stop();
    setPhase("transcribing");
    try {
      const uri = recorder.uri;
      if (!uri) {
        setPhase("error");
        return;
      }
      const extension = extensionFromUri(uri);
      const result = await transcribeMutation.mutateAsync({
        uri,
        name: `voice-task.${extension}`,
        type: MIME_BY_EXTENSION[extension] ?? "audio/m4a",
      });
      setTranscript(result.text);
      await runParse(result.text);
    } catch {
      setPhase("error");
    }
  };

  const handleRetryRecording = () => {
    recorder.reset();
    setPhase("recording");
    setTranscript("");
    setIsEditingTranscript(false);
    void recorder.start();
  };

  const handleToggleEditing = () => {
    if (isEditingTranscript) {
      void runParse(transcript);
    }
    setIsEditingTranscript((prev) => !prev);
  };

  const handleApply = () => {
    onApply({ title, description, priority, dueDate, assigneeId });
  };

  const isRecording = phase === "recording" && recorder.status === "recording";

  const content = (
    <View className="flex-1 justify-end bg-black/45">
      <Pressable className="flex-1" onPress={onClose} accessibilityLabel="Close voice input" />
      <View
        className="rounded-t-3xl bg-white px-5 pt-5"
        style={{ maxHeight: "88%", paddingBottom: Math.max(insets.bottom, 16) }}
      >
        <View className="mb-2 flex-row items-center justify-between">
          <Text className="text-[17px] font-bold text-[#111827]">Speak your task</Text>
          <Pressable onPress={onClose} hitSlop={8} accessibilityLabel="Close">
            <X size={22} color="#6B7280" />
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {phase === "recording" ? (
            <View className="items-center py-6">
              <View
                className={`h-20 w-20 items-center justify-center rounded-full ${
                  isRecording ? "bg-[#FEE2E2]" : "bg-[#F3F4F6]"
                }`}
              >
                <Mic size={32} color={isRecording ? "#EF4444" : "#9CA3AF"} />
              </View>
              <Text className="mt-4 text-[22px] font-semibold text-[#111827]">
                {formatDuration(recorder.durationMillis)}
              </Text>
              <VoiceWaveform metering={recorder.metering} isActive={isRecording} />
              <Text className="mt-2 text-[13px] text-[#6B7280]">
                {isRecording ? "Listening… speak in Khmer" : "Preparing microphone…"}
              </Text>
              <Pressable
                onPress={handleStop}
                disabled={!isRecording}
                className="mt-6 h-16 w-16 items-center justify-center rounded-full bg-[#EF4444]"
                accessibilityRole="button"
                accessibilityLabel="Stop recording"
              >
                <Square size={22} color="white" fill="white" />
              </Pressable>
            </View>
          ) : null}

          {phase === "permission-denied" ? (
            <View className="items-center py-10">
              <Text className="text-center text-[15px] text-[#111827]">
                Microphone access is required to record your task.
              </Text>
              <Pressable
                onPress={() => void recorder.start()}
                className="mt-4 rounded-xl bg-[#32CD32] px-5 py-3"
              >
                <Text className="text-[14px] font-semibold text-white">Try again</Text>
              </Pressable>
            </View>
          ) : null}

          {phase === "error" ? (
            <View className="items-center py-10">
              <Text className="text-center text-[15px] text-[#111827]">
                Something went wrong. Please try again.
              </Text>
              <Pressable onPress={handleRetryRecording} className="mt-4 rounded-xl bg-[#32CD32] px-5 py-3">
                <Text className="text-[14px] font-semibold text-white">Record again</Text>
              </Pressable>
            </View>
          ) : null}

          {phase === "transcribing" ? (
            <View className="items-center py-10">
              <ActivityIndicator color="#32CD32" />
              <Text className="mt-3 text-[13px] text-[#6B7280]">Converting speech to text…</Text>
            </View>
          ) : null}

          {phase === "parsing" || phase === "result" ? (
            <>
              <VoiceTranscription
                text={transcript}
                onChangeText={setTranscript}
                onRetryRecording={handleRetryRecording}
                isEditable={isEditingTranscript}
                onToggleEditing={handleToggleEditing}
              />

              {phase === "parsing" ? (
                <View className="items-center py-8">
                  <ActivityIndicator color="#32CD32" />
                  <Text className="mt-3 text-[13px] text-[#6B7280]">Extracting task details…</Text>
                </View>
              ) : (
                <TaskExtractionResult
                  title={title}
                  description={description}
                  priority={priority}
                  dueDate={dueDate}
                  dueDateText={dueDateText}
                  candidates={candidates}
                  employees={employees}
                  selectedAssigneeId={assigneeId}
                  onChangeTitle={setTitle}
                  onChangeDescription={setDescription}
                  onChangePriority={setPriority}
                  onSelectAssignee={setAssigneeId}
                />
              )}
            </>
          ) : null}
        </ScrollView>

        {phase === "result" ? (
          <Pressable
            onPress={handleApply}
            disabled={!title.trim()}
            style={{ opacity: title.trim() ? 1 : 0.5 }}
            className="mt-4 h-12 items-center justify-center rounded-xl bg-[#32CD32]"
          >
            <Text className="text-[15px] font-semibold text-white">Use these details</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      {Platform.OS === "ios" ? <FullWindowOverlay>{content}</FullWindowOverlay> : content}
    </Modal>
  );
}
