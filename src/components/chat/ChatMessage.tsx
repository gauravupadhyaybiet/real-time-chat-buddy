import { cn } from "@/lib/utils";
import { Bot, User, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatMessageProps {
  message: {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: Date;
  };
  onSpeak?: (text: string) => void;
}

export function ChatMessage({ message, onSpeak }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={cn(
      "flex gap-3 p-4 transition-colors hover:bg-muted/30",
      isUser ? "flex-row-reverse" : "flex-row"
    )}>
      <div className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
        isUser 
          ? "bg-chat-bubble-user text-chat-bubble-user-foreground" 
          : "bg-chat-bubble-ai text-chat-bubble-ai-foreground border"
      )}>
        {isUser ? (
          <User className="h-4 w-4" />
        ) : (
          <Bot className="h-4 w-4" />
        )}
      </div>
      
      <div className={cn(
        "flex-1 space-y-1",
        isUser ? "text-right" : "text-left"
      )}>
        <div className={cn(
          "inline-block max-w-[80%] rounded-2xl px-4 py-2 text-sm",
          isUser
            ? "bg-chat-bubble-user text-chat-bubble-user-foreground"
            : "bg-chat-bubble-ai text-chat-bubble-ai-foreground border"
        )}>
        <div className="whitespace-pre-wrap break-words">
          {message.content}
        </div>
        {!isUser && onSpeak && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSpeak(message.content)}
            className="mt-2 h-8 px-2 text-xs"
          >
            <Volume2 className="h-3 w-3 mr-1" />
            Speak
          </Button>
        )}
      </div>
      <div className="text-xs text-muted-foreground">
        {message.timestamp.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}