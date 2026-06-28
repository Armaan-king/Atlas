import { Volume2, VolumeX, Loader2 } from "lucide-react";
import { useVoice } from "../../hooks/useVoice";

interface VoiceReadoutProps {
  text: string;
}

export function VoiceReadout({ text }: VoiceReadoutProps) {
  const { speak, stop, isPlaying, isLoading } = useVoice();

  const handleClick = () => {
    if (isPlaying) {
      stop();
    } else {
      speak(text);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      title={isPlaying ? "Stop" : "Read aloud"}
      className="p-1.5 rounded-md transition-colors text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-50"
    >
      {isLoading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : isPlaying ? (
        <VolumeX size={16} />
      ) : (
        <Volume2 size={16} />
      )}
    </button>
  );
}
