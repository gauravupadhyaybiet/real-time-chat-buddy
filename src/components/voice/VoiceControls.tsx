import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";

interface VoiceControlsProps {
  onSpeak: (text: string) => void;
  isPlaying: boolean;
  onStop: () => void;
  isLoading: boolean;
}

export function VoiceControls({ onSpeak, isPlaying, onStop, isLoading }: VoiceControlsProps) {
  const handleToggleVoice = () => {
    if (isPlaying) {
      onStop();
    }
  };

  return (
    <div className="flex items-center gap-2">
      {isPlaying && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleToggleVoice}
          className="text-destructive hover:text-destructive"
        >
          <VolumeX className="h-4 w-4 mr-2" />
          Stop
        </Button>
      )}
    </div>
  );
}