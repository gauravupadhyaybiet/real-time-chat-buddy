import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

export function useElevenLabs() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  const speak = async (text: string) => {
    if (!text.trim()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Use Web Speech API for text-to-speech
      if ('speechSynthesis' in window) {
        // Stop any currently playing speech
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
        
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text.trim());
        
        // Configure voice settings
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;
        
        // Try to use a more natural voice if available
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(voice => 
          voice.name.includes('Google') || 
          voice.name.includes('Microsoft') ||
          voice.lang.startsWith('en')
        );
        
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }
        
        utterance.onstart = () => setIsPlaying(true);
        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => {
          setIsPlaying(false);
          toast({
            title: "Speech Error",
            description: "Failed to play speech. Please try again.",
            variant: "destructive",
          });
        };

        window.speechSynthesis.speak(utterance);
      } else {
        throw new Error("Speech synthesis not supported in this browser");
      }
      
    } catch (error) {
      console.error("Error with speech synthesis:", error);
      
      toast({
        title: "Speech Error",
        description: "Speech synthesis is not available in your browser.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const stop = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
  };

  return {
    speak,
    stop,
    isPlaying,
    isLoading,
  };
}