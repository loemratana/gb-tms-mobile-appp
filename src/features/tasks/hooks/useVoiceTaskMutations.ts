import { useMutation } from "@tanstack/react-query";

import {
  parseVoiceTask,
  transcribeVoice,
  type VoiceAudioFile,
} from "@/services/voiceTask.service";
import type { VoiceParseRequest } from "@/features/tasks/types/voice.types";

export function useTranscribeVoice() {
  return useMutation({
    mutationFn: (file: VoiceAudioFile) => transcribeVoice(file),
  });
}

export function useParseVoiceTask() {
  return useMutation({
    mutationFn: (input: VoiceParseRequest) => parseVoiceTask(input),
  });
}
