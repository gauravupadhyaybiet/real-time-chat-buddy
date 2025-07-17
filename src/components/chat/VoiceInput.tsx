import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";

interface VoiceInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export function VoiceInput({ onSendMessage, disabled }: VoiceInputProps) {
  const {
    isListening,
    transcript,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  const [showTranscript, setShowTranscript] = useState(false);

  useEffect(() => {
    if (transcript) {
      setShowTranscript(true);
    }
  }, [transcript]);

  const handleStartListening = () => {
    resetTranscript();
    setShowTranscript(false);
    startListening();
  };

  const handleStopListening = () => {
    stopListening();
  };

  const handleSendTranscript = () => {
    if (transcript.trim()) {
      onSendMessage(transcript.trim());
      resetTranscript();
      setShowTranscript(false);
    }
  };

  const handleClearTranscript = () => {
    resetTranscript();
    setShowTranscript(false);
  };

  if (!isSupported) {
    return null;
  }

  return (
    <div className="space-y-2">
      {showTranscript && transcript && (
        <div className="bg-muted/50 rounded-lg p-3 border">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">Voice Input:</p>
              <p className="text-sm">{transcript}</p>
            </div>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={handleClearTranscript}
                className="h-8 px-2"
              >
                Clear
              </Button>
              <Button
                size="sm"
                onClick={handleSendTranscript}
                disabled={!transcript.trim()}
                className="h-8 px-2"
              >
                <Send className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex justify-center">
        <Button
          variant={isListening ? "destructive" : "outline"}
          size="lg"
          onClick={isListening ? handleStopListening : handleStartListening}
          disabled={disabled}
          className={cn(
            "h-12 w-12 rounded-full transition-all",
            isListening && "animate-pulse"
          )}
        >
          {isListening ? (
            <MicOff className="h-5 w-5" />
          ) : (
            <Mic className="h-5 w-5" />
          )}
        </Button>
      </div>
      
      {isListening && (
        <p className="text-center text-sm text-muted-foreground">
          Listening... Speak now
        </p>
      )}
    </div>
  );
}