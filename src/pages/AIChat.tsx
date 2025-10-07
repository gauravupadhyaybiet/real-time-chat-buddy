import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Send, Mic, MicOff, Volume2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useGeminiAI } from '@/hooks/useGeminiAI';
import { ApiKeyDialog } from '@/components/chat/ApiKeyDialog';

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
  const [apiKey, setApiKey] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    isSupported,
  } = useSpeechRecognition();

  const { sendMessage: sendGeminiMessage } = useGeminiAI();

  useEffect(() => {
    // Load API key from localStorage
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  const handleApiKeyChange = (key: string) => {
    setApiKey(key);
    localStorage.setItem('gemini_api_key', key);
  };


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

    if (!apiKey) {
      toast({
        title: 'API Key Required',
        description: 'Please set your Gemini API key to start chatting.',
        variant: 'destructive',
      });
      return;
    }

    const userMessage: Message = { role: 'user', content: text.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    resetTranscript();
    setIsLoading(true);

    try {
      const aiResponse = await sendGeminiMessage(text.trim(), apiKey);
      
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
      speak(aiResponse);
    } catch (error) {
      console.error('Error:', error);
      // Error toast is already handled by useGeminiAI hook
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
    <div className="flex flex-col h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <header className="border-b bg-card/80 backdrop-blur-xl shadow-lg sticky top-0 z-50">
        <div className="flex h-20 items-center px-6 gap-4 max-w-6xl mx-auto">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/')}
            className="hover:bg-primary/10 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              AI Assistant
            </h1>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Powered by Gemini
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ApiKeyDialog apiKey={apiKey} onApiKeyChange={handleApiKeyChange} />
            {isSpeaking && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={stopSpeaking}
                className="animate-fade-in"
              >
                <Volume2 className="h-4 w-4 mr-2 animate-pulse" />
                Stop
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 && (
            <Card className="p-12 text-center bg-gradient-to-br from-card to-card/50 border-primary/10 shadow-2xl animate-fade-in">
              <div className="text-6xl mb-6 animate-scale-in">🤖</div>
              <h2 className="text-3xl font-bold mb-4 text-foreground">Welcome to AI Chat!</h2>
              <p className="text-muted-foreground text-lg mb-6 max-w-md mx-auto">
                {apiKey 
                  ? "Start a conversation using text or voice input" 
                  : "Set your Gemini API key to begin chatting"}
              </p>
              {!apiKey && (
                <div className="animate-fade-in">
                  <ApiKeyDialog apiKey={apiKey} onApiKeyChange={handleApiKeyChange} />
                </div>
              )}
            </Card>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              <Card
                className={`max-w-[85%] p-5 shadow-lg transition-all hover:shadow-xl ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-primary/20'
                    : 'bg-gradient-to-br from-card to-card/80 text-foreground border-primary/10'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`text-3xl ${message.role === 'assistant' ? 'animate-scale-in' : ''}`}>
                    {message.role === 'user' ? '👤' : '🤖'}
                  </div>
                  <div className="flex-1 whitespace-pre-wrap break-words leading-relaxed">
                    {message.content}
                  </div>
                </div>
              </Card>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start animate-fade-in">
              <Card className="max-w-[85%] p-5 bg-gradient-to-br from-card to-card/80 border-primary/10 shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="text-3xl animate-scale-in">🤖</div>
                  <div className="flex gap-2">
                    <span className="w-3 h-3 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-3 h-3 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-3 h-3 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </Card>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t bg-card/80 backdrop-blur-xl p-6 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3 mb-3">
            {isSupported && (
              <Button
                variant={isListening ? 'destructive' : 'outline'}
                size="icon"
                onClick={toggleVoiceInput}
                className={`h-14 w-14 transition-all ${isListening ? 'animate-pulse scale-110' : 'hover:scale-105'}`}
              >
                {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </Button>
            )}
            
            <Input
              placeholder={isListening ? 'Listening...' : 'Type your message...'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading || isListening}
              className="flex-1 h-14 text-lg bg-background/50 border-primary/20 focus:border-primary transition-all"
            />
            
            <Button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isLoading}
              className="h-14 w-14 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all hover:scale-105 disabled:opacity-50"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
          
          {isListening && (
            <p className="text-center text-sm text-muted-foreground animate-fade-in flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Listening... Speak now or click stop to send
            </p>
          )}
        </div>
      </div>
    </div>
  );
}