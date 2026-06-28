import { useAppStore } from "../store/useAppStore";
import { apiPostFormData } from "./api";

const SHOULD_SPEAK_MAX_LENGTH = 500;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SpeechRecognitionInstance = any;

let recognition: SpeechRecognitionInstance | null = null;
let mediaRecorder: MediaRecorder | null = null;
let audioChunks: Blob[] = [];
let activeStream: MediaStream | null = null;
let onDoneCallback: ((text: string) => void) | undefined;
let browserTranscript = "";

function getSpeechRecognition(): SpeechRecognitionInstance | null {
  const w = window as any;
  const SR = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  if (!SR) return null;
  return new SR();
}

function pickMimeType(): string {
  if (typeof MediaRecorder === "undefined") return "";
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
    "audio/mp4",
  ];
  for (const mime of candidates) {
    if (MediaRecorder.isTypeSupported(mime)) return mime;
  }
  return "";
}

function fileExtForMime(mime: string): string {
  if (mime.includes("webm")) return "webm";
  if (mime.includes("ogg")) return "ogg";
  if (mime.includes("mp4")) return "mp4";
  return "wav";
}

export function isSpeechRecognitionSupported(): boolean {
  const w = window as any;
  return !!(w.SpeechRecognition ?? w.webkitSpeechRecognition);
}

export async function startVoiceInput(
  onFinalTranscript?: (text: string) => void,
): Promise<void> {
  if (!isSpeechRecognitionSupported()) {
    console.warn("SpeechRecognition not supported in this browser.");
    return;
  }

  cleanup();
  onDoneCallback = onFinalTranscript;
  browserTranscript = "";

  // Start browser SpeechRecognition for live transcript
  recognition = getSpeechRecognition();
  if (!recognition) return;

  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = "en-US";

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    let interim = "";
    let final = "";
    for (let i = 0; i < event.results.length; i++) {
      const result = event.results[i];
      if (result.isFinal) {
        final += result[0].transcript;
      } else {
        interim += result[0].transcript;
      }
    }
    browserTranscript = final || interim;
    useAppStore.getState().setTranscript(browserTranscript);
  };

  recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
    if (event.error === "aborted" || event.error === "no-speech") return;
    console.error("SpeechRecognition error:", event.error);
  };

  recognition.onend = () => {
    // Browser may stop recognition on its own — don't finalize here,
    // we finalize in stopVoiceInput via the MediaRecorder onstop path
  };

  useAppStore.getState().startListening();
  recognition.start();

  // Also start MediaRecorder for ElevenLabs STT fallback
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true },
    });
    activeStream = stream;
    audioChunks = [];

    const mimeType = pickMimeType();
    const options: MediaRecorderOptions = {};
    if (mimeType) options.mimeType = mimeType;

    mediaRecorder = new MediaRecorder(stream, options);
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunks.push(e.data);
    };
    mediaRecorder.start(250);
  } catch {
    // Mic access failed — SpeechRecognition still works without it
  }
}

export function stopVoiceInput(): void {
  // Stop SpeechRecognition
  if (recognition) {
    try { recognition.stop(); } catch { /* already stopped */ }
    recognition = null;
  }

  // Stop MediaRecorder and attempt ElevenLabs transcription
  if (mediaRecorder && mediaRecorder.state === "recording") {
    const recorder = mediaRecorder;
    const chosenMime = recorder.mimeType;

    recorder.onstop = async () => {
      if (activeStream) {
        activeStream.getTracks().forEach((t) => t.stop());
        activeStream = null;
      }

      const blob = new Blob(audioChunks, { type: chosenMime });
      audioChunks = [];

      // Use browser transcript immediately
      const fallback = browserTranscript.trim();

      if (blob.size > 1000) {
        useAppStore.getState().setTranscript(fallback ? `${fallback} (refining...)` : "Transcribing...");

        try {
          const ext = fileExtForMime(chosenMime);
          const formData = new FormData();
          formData.append("file", blob, `recording.${ext}`);

          const result = await apiPostFormData<{ text: string }>(
            "/transcribe",
            formData,
          );

          const elevenText = result.text?.trim() ?? "";
          if (elevenText) {
            useAppStore.getState().setTranscript(elevenText);
            useAppStore.getState().stopListening();
            if (onDoneCallback) onDoneCallback(elevenText);
            return;
          }
        } catch {
          // ElevenLabs unavailable — fall through to browser transcript
        }
      }

      // Fallback: use browser SpeechRecognition transcript
      useAppStore.getState().setTranscript(fallback);
      useAppStore.getState().stopListening();
      if (fallback && onDoneCallback) {
        onDoneCallback(fallback);
      } else if (!fallback) {
        useAppStore.getState().setTranscript("(no speech detected)");
        setTimeout(() => {
          useAppStore.getState().clearTranscript();
          useAppStore.getState().stopListening();
        }, 1500);
      }
    };

    recorder.stop();
  } else {
    // No MediaRecorder — just use browser transcript
    if (activeStream) {
      activeStream.getTracks().forEach((t) => t.stop());
      activeStream = null;
    }

    const fallback = browserTranscript.trim();
    useAppStore.getState().stopListening();
    if (fallback && onDoneCallback) {
      onDoneCallback(fallback);
    }
  }

  mediaRecorder = null;
}

export function abortVoiceInput(): void {
  onDoneCallback = undefined;
  cleanup();
  useAppStore.getState().stopListening();
  useAppStore.getState().clearTranscript();
}

function cleanup(): void {
  if (recognition) {
    try { recognition.abort(); } catch { /* ignore */ }
    recognition = null;
  }
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    try { mediaRecorder.stop(); } catch { /* ignore */ }
  }
  mediaRecorder = null;
  audioChunks = [];
  if (activeStream) {
    activeStream.getTracks().forEach((t) => t.stop());
    activeStream = null;
  }
  browserTranscript = "";
}

export function shouldAutoSpeak(content: string): boolean {
  if (!content.trim()) return false;
  return content.length <= SHOULD_SPEAK_MAX_LENGTH;
}

export function evaluateAndSetShouldSpeak(content: string): void {
  useAppStore.getState().setShouldSpeak(shouldAutoSpeak(content));
}
