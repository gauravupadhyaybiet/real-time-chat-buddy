import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export function useGeminiAI() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const sendMessage = async (
    message: string, 
    apiKey: string,
    files?: { data: string; mimeType: string }[]
  ): Promise<string> => {
    if (!apiKey) {
      throw new Error("API key is required");
    }

    setIsLoading(true);
    
    try {
      const parts: any[] = [{ text: message }];
      
      if (files && files.length > 0) {
        files.forEach(file => {
          parts.push({
            inline_data: {
              mime_type: file.mimeType,
              data: file.data
            }
          });
        });
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: parts
              }
            ],
            generationConfig: {
              temperature: 0.9,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 2048,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        if (response.status === 400 && errorData?.error?.message?.includes("API_KEY_INVALID")) {
          throw new Error("Invalid API key. Please check your Gemini API key.");
        }
        throw new Error(errorData?.error?.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error("Invalid response format from Gemini API");
      }

      const aiResponse = data.candidates[0].content.parts[0].text;
      return aiResponse;
      
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      
      if (error instanceof Error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      } else {
        const errorMessage = "Failed to get response from AI. Please try again.";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        throw new Error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendMessage,
    isLoading,
  };
}