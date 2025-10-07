import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Send, Mic, MicOff, Volume2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIChat() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    isSupported,
  } = useSpeechRecognition();


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const sendMessage = async (text: string = input) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: text.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    resetTranscript();
    setIsLoading(true);

    try {
      // Mock AI response for now - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockResponses = [
        "I'm here to help! How can I assist you today?",
        "That's an interesting question. Let me think about that...",
        "I understand. Could you tell me more about that?",
        "Based on what you've shared, I would suggest...",
        "That's a great point! Here's what I think...",
      ];
      
      const assistantMessage = mockResponses[Math.floor(Math.random() * mockResponses.length)];
      
      setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
      speak(assistantMessage);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleVoiceInput = () => {
    if (isListening) {
      stopListening();
      if (transcript) {
        sendMessage(transcript);
      }
    } else {
      startListening();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="border-b bg-card backdrop-blur-lg shadow-sm">
        <div className="flex h-16 items-center px-4 gap-4 max-w-4xl mx-auto">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">
              AI Assistant
            </h1>
            <p className="text-xs text-muted-foreground">Powered by Gemini</p>
          </div>
          {isSpeaking && (
            <Button variant="outline" size="sm" onClick={stopSpeaking}>
              <Volume2 className="h-4 w-4 mr-2 animate-pulse" />
              Stop
            </Button>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 && (
            <Card className="p-8 text-center bg-card">
              <div className="text-4xl mb-4">🤖</div>
              <h2 className="text-xl font-semibold mb-2 text-foreground">Welcome to AI Chat!</h2>
              <p className="text-muted-foreground">
                Start a conversation or use voice input to chat with me
              </p>
            </Card>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <Card
                className={`max-w-[80%] p-4 ${
                  message.role === 'user'
                    ? 'bg-chat-bubble-user text-chat-bubble-user-foreground'
                    : 'bg-chat-bubble-ai text-chat-bubble-ai-foreground'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">
                    {message.role === 'user' ? '👤' : '🤖'}
                  </div>
                  <div className="flex-1 whitespace-pre-wrap break-words">
                    {message.content}
                  </div>
                </div>
              </Card>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <Card className="max-w-[80%] p-4 bg-chat-bubble-ai text-chat-bubble-ai-foreground">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">🤖</div>
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </Card>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t bg-card p-4">
        <div className="max-w-4xl mx-auto flex gap-2">
          {isSupported && (
            <Button
              variant={isListening ? 'destructive' : 'outline'}
              size="icon"
              onClick={toggleVoiceInput}
              className={isListening ? 'animate-pulse' : ''}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
          )}
          
          <Input
            placeholder={isListening ? 'Listening...' : 'Type your message...'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading || isListening}
            className="flex-1 bg-chat-input"
          />
          
          <Button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading}
            className="bg-primary hover:bg-primary/90"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        {isListening && (
          <p className="text-center text-sm text-muted-foreground mt-2">
            Listening... Speak now or click stop to send
          </p>
        )}
      </div>
    </div>
  );
}