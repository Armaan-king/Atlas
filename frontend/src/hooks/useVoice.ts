import { useState, useRef, useCallback } from "react";

const API_BASE = "http://localhost:8000";

export function useVoice() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const speak = useCallback(
    async (text: string) => {
      // Stop any currently playing audio
      stop();

      setIsLoading(true);

      try {
        const res = await fetch(`${API_BASE}/api/voice`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });

        if (!res.ok) {
          throw new Error(`Voice API error: ${res.status}`);
        }

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        objectUrlRef.current = url;

        const audio = new Audio(url);
        audioRef.current = audio;

        audio.onplay = () => setIsPlaying(true);
        audio.onended = () => {
          setIsPlaying(false);
          URL.revokeObjectURL(url);
          objectUrlRef.current = null;
        };
        audio.onerror = () => {
          setIsPlaying(false);
          URL.revokeObjectURL(url);
          objectUrlRef.current = null;
        };

        await audio.play();
      } catch {
        // Fallback to browser speech synthesis
        fallbackSpeak(text);
      } finally {
        setIsLoading(false);
      }
    },
    [stop]
  );

  return { speak, stop, isPlaying, isLoading };
}

function fallbackSpeak(text: string) {
  if (!("speechSynthesis" in window)) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
}
