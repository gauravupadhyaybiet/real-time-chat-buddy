import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, Mic } from "lucide-react";
import { cn } from "@/lib/utils";
import { VoiceInput } from "./VoiceInput";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, isLoading, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [showVoiceInput, setShowVoiceInput] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleVoiceMessage = (voiceMessage: string) => {
    onSendMessage(voiceMessage);
    setShowVoiceInput(false);
  };

  return (
    <div className="border-t bg-background p-4 space-y-4">
      {showVoiceInput && (
        <VoiceInput 
          onSendMessage={handleVoiceMessage}
          disabled={disabled || isLoading}
        />
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="flex gap-2">
          <div className="flex-1">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message or use voice input..."
              className={cn(
                "min-h-[60px] resize-none bg-chat-input transition-all",
                "focus:ring-2 focus:ring-primary/20"
              )}
              disabled={disabled || isLoading}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => setShowVoiceInput(!showVoiceInput)}
              disabled={disabled || isLoading}
              className={cn(
                "h-[60px] w-[60px] rounded-xl transition-all",
                showVoiceInput && "bg-primary text-primary-foreground"
              )}
            >
              <Mic className="h-4 w-4" />
            </Button>
            <Button
              type="submit"
              size="lg"
              disabled={!message.trim() || isLoading || disabled}
              className={cn(
                "h-[60px] w-[60px] rounded-xl transition-all",
                "hover:scale-105 active:scale-95"
              )}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}