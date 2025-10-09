import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useImageGeneration() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const generateImage = async (prompt: string): Promise<string> => {
    setIsLoading(true);

    try {
      if (!supabase) {
        throw new Error("Supabase is not configured. Please check your environment variables.");
      }

      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: { prompt }
      });

      if (error) throw error;

      if (!data?.imageUrl) {
        throw new Error("No image generated");
      }

      return data.imageUrl;
    } catch (error) {
      console.error("Error generating image:", error);

      if (error instanceof Error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      } else {
        const errorMessage = "Failed to generate image. Please try again.";
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
    generateImage,
    isLoading,
  };
}
