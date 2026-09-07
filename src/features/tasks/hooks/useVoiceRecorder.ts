import { useCallback, useRef, useState } from "react";
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";

export type VoiceRecorderStatus =
  | "idle"
  | "recording"
  | "stopped"
  | "permission-denied"
  | "error";

export type UseVoiceRecorderResult = {
  status: VoiceRecorderStatus;
  durationMillis: number;
  /** Metering level in dB (roughly -160..0), only populated while recording. */
  metering: number | undefined;
  uri: string | null;
  start: () => Promise<void>;
  stop: () => Promise<void>;
  reset: () => void;
};

const RECORDER_OPTIONS = {
  ...RecordingPresets.HIGH_QUALITY,
  isMeteringEnabled: true,
};

export function useVoiceRecorder(): UseVoiceRecorderResult {
  const recorder = useAudioRecorder(RECORDER_OPTIONS);
  const recorderState = useAudioRecorderState(recorder, 100);
  const [status, setStatus] = useState<VoiceRecorderStatus>("idle");
  const [uri, setUri] = useState<string | null>(null);
  const audioModeReady = useRef(false);

  const start = useCallback(async () => {
    try {
      const { granted } = await requestRecordingPermissionsAsync();
      if (!granted) {
        setStatus("permission-denied");
        return;
      }

      if (!audioModeReady.current) {
        await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
        audioModeReady.current = true;
      }

      setUri(null);
      await recorder.prepareToRecordAsync();
      recorder.record();
      setStatus("recording");
    } catch {
      setStatus("error");
    }
  }, [recorder]);

  const stop = useCallback(async () => {
    try {
      await recorder.stop();
      setUri(recorder.uri ?? null);
      setStatus("stopped");
    } catch {
      setStatus("error");
    }
  }, [recorder]);

  const reset = useCallback(() => {
    setUri(null);
    setStatus("idle");
  }, []);

  return {
    status,
    durationMillis: recorderState.durationMillis,
    metering: recorderState.metering,
    uri,
    start,
    stop,
    reset,
  };
}
