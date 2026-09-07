import { api, type ApiEnvelope } from "@/lib/api";
import type {
  VoiceParseRequest,
  VoiceParseResponse,
  VoiceTranscribeResponse,
} from "@/features/tasks/types/voice.types";

export type VoiceAudioFile = {
  uri: string;
  name: string;
  type: string;
};

export async function transcribeVoice(
  file: VoiceAudioFile,
  language = "km-KH"
): Promise<VoiceTranscribeResponse> {
  const formData = new FormData();
  formData.append("audio", file as unknown as Blob);
  formData.append("language", language);

  const { data } = await api.post<ApiEnvelope<VoiceTranscribeResponse>>(
    "/tasks/voice/transcribe",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data.data;
}

export async function parseVoiceTask(
  input: VoiceParseRequest
): Promise<VoiceParseResponse> {
  const { data } = await api.post<ApiEnvelope<VoiceParseResponse>>(
    "/tasks/voice/parse",
    input
  );
  return data.data;
}
