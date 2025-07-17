import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

export function useElevenLabs() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  const speak = async (text: string, apiKey?: string, voiceId?: string) => {
    const savedApiKey = apiKey || localStorage.getItem("elevenlabs-api-key");
    const savedVoiceId = voiceId || localStorage.getItem("voice-id") || "9BWtsMINqrJLrRacOk9x";

    if (!savedApiKey) {
      toast({
        title: "API Key Required",
        description: "Please set your ElevenLabs API key in voice settings.",
        variant: "destructive",
      });
      return;
    }

    if (!text.trim()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${savedVoiceId}`,
        {
          method: "POST",
          headers: {
            "Accept": "audio/mpeg",
            "Content-Type": "application/json",
            "xi-api-key": savedApiKey,
          },
          body: JSON.stringify({
            text: text.trim(),
            model_id: "eleven_multilingual_v2",
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
              style: 0.0,
              use_speaker_boost: true
            }
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Invalid API key. Please check your ElevenLabs API key.");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onloadstart = () => setIsPlaying(true);
      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
      };
      audio.onerror = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
        toast({
          title: "Playback Error",
          description: "Failed to play the audio.",
          variant: "destructive",
        });
      };

      await audio.play();
      
    } catch (error) {
      console.error("Error with ElevenLabs TTS:", error);
      
      if (error instanceof Error) {
        toast({
          title: "Voice Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Voice Error",
          description: "Failed to generate speech. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlaying(false);
    }
  };

  return {
    speak,
    stop,
    isPlaying,
    isLoading,
  };
}