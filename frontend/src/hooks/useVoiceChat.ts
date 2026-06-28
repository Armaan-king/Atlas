import { useEffect, useRef, useCallback, useState } from "react";
import { useAppStore } from "../store/useAppStore";
import { useChat } from "./useChat";
import { useVoice } from "./useVoice";
import { useVoiceCommands } from "./useVoiceCommands";
import {
  startVoiceInput,
  stopVoiceInput,
  abortVoiceInput,
  isSpeechRecognitionSupported,
  shouldAutoSpeak,
} from "../lib/voice-controller";

export function useVoiceChat() {
  const { send, messages, loading: chatLoading } = useChat();
  const { speak, stop: stopSpeaking, isPlaying, isLoading: voiceLoading } = useVoice();
  const { processCommand } = useVoiceCommands();

  const isListening = useAppStore((s) => s.voiceInput.isListening);
  const transcript = useAppStore((s) => s.voiceInput.transcript);
  const shouldSpeakFlag = useAppStore((s) => s.voiceInput.shouldSpeak);
  const setSpeaking = useAppStore((s) => s.setSpeaking);

  const [conversationMode, setConversationMode] = useState(false);
  const [commandFeedback, setCommandFeedback] = useState<string | null>(null);
  const prevLoadingRef = useRef(false);
  const waitingForResponseRef = useRef(false);

  const startListening = useCallback(() => {
    stopSpeaking();
    void startVoiceInput((finalText) => {
      if (!finalText) return;

      // Check if it's a voice command first
      const result = processCommand(finalText);
      if (result.handled) {
        // Show feedback briefly, don't send to chat
        if (result.feedback) {
          setCommandFeedback(result.feedback);
          setTimeout(() => setCommandFeedback(null), 2500);
        }
        // In conversation mode, restart listening after command
        if (conversationMode) {
          setTimeout(() => startListening(), 500);
        }
        return;
      }

      // Not a command — send to chat
      waitingForResponseRef.current = true;
      send(finalText);
    });
  }, [send, stopSpeaking, processCommand, conversationMode]);

  const stopListening = useCallback(() => {
    stopVoiceInput();
  }, []);

  const cancel = useCallback(() => {
    abortVoiceInput();
    stopSpeaking();
    waitingForResponseRef.current = false;
  }, [stopSpeaking]);

  const toggleConversationMode = useCallback(() => {
    setConversationMode((prev) => !prev);
  }, []);

  useEffect(() => {
    setSpeaking(isPlaying);
  }, [isPlaying, setSpeaking]);

  useEffect(() => {
    const wasLoading = prevLoadingRef.current;
    prevLoadingRef.current = chatLoading;

    if (wasLoading && !chatLoading && waitingForResponseRef.current) {
      waitingForResponseRef.current = false;

      const lastMsg = messages[messages.length - 1];
      if (lastMsg?.role === "assistant" && lastMsg.content) {
        if (shouldAutoSpeak(lastMsg.content)) {
          speak(lastMsg.content);

          if (conversationMode) {
            const waitForPlayback = () => {
              const checkInterval = setInterval(() => {
                const { voiceInput } = useAppStore.getState();
                if (!voiceInput.isSpeaking) {
                  clearInterval(checkInterval);
                  startListening();
                }
              }, 300);
              setTimeout(() => clearInterval(checkInterval), 30000);
            };
            waitForPlayback();
          }
        } else if (conversationMode) {
          startListening();
        }
      }
    }
  }, [chatLoading, messages, speak, conversationMode, startListening, shouldSpeakFlag]);

  return {
    startListening,
    stopListening,
    cancel,
    isListening,
    transcript,
    isSpeaking: isPlaying,
    isSpeakLoading: voiceLoading,
    chatLoading,
    conversationMode,
    toggleConversationMode,
    commandFeedback,
    speechSupported: isSpeechRecognitionSupported(),
  };
}
