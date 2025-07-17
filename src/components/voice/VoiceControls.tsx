import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, Settings } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface VoiceControlsProps {
  onSpeak: (text: string) => void;
  isPlaying: boolean;
  onStop: () => void;
}

const VOICES = [
  { id: "9BWtsMINqrJLrRacOk9x", name: "Aria" },
  { id: "CwhRBWXzGAHq8TQ4Fs17", name: "Roger" },
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah" },
  { id: "FGY2WhTYpPnrIDTdsKH5", name: "Laura" },
  { id: "IKne3meq5aSn9XLyUdCD", name: "Charlie" },
  { id: "JBFqnCBsd6RMkjVDRZzb", name: "George" },
  { id: "N2lVS1w4EtoT3dr4eOWO", name: "Callum" },
  { id: "SAz9YHcvj6GT2YYXdXww", name: "River" },
  { id: "TX3LPaxmHKxFdv7VOQHJ", name: "Liam" },
  { id: "XB0fDUnXU5powFXDhCwa", name: "Charlotte" },
];

export function VoiceControls({ onSpeak, isPlaying, onStop }: VoiceControlsProps) {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("elevenlabs-api-key") || "");
  const [voiceId, setVoiceId] = useState(() => localStorage.getItem("voice-id") || VOICES[0].id);
  const [open, setOpen] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(apiKey);
  const [tempVoiceId, setTempVoiceId] = useState(voiceId);
  const { toast } = useToast();

  const handleSave = () => {
    setApiKey(tempApiKey);
    setVoiceId(tempVoiceId);
    localStorage.setItem("elevenlabs-api-key", tempApiKey);
    localStorage.setItem("voice-id", tempVoiceId);
    setOpen(false);
    toast({
      title: "Voice Settings Updated",
      description: "Your ElevenLabs settings have been saved.",
    });
  };

  const handleTestVoice = () => {
    if (tempApiKey && tempVoiceId) {
      onSpeak("This is a test of the selected voice.");
    } else {
      toast({
        title: "Missing Settings",
        description: "Please enter your API key first.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center gap-2">
      {isPlaying && (
        <Button
          variant="outline"
          size="sm"
          onClick={onStop}
          className="text-destructive hover:text-destructive"
        >
          <VolumeX className="h-4 w-4" />
        </Button>
      )}
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Volume2 className="h-4 w-4 mr-2" />
            Voice
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Voice Settings</DialogTitle>
            <DialogDescription>
              Configure ElevenLabs text-to-speech settings. Get your API key from{" "}
              <a 
                href="https://elevenlabs.io/app/settings/api-keys" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                ElevenLabs
              </a>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apikey">ElevenLabs API Key</Label>
              <Input
                id="apikey"
                type="password"
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                placeholder="Your ElevenLabs API key"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="voice">Voice</Label>
              <Select value={tempVoiceId} onValueChange={setTempVoiceId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a voice" />
                </SelectTrigger>
                <SelectContent>
                  {VOICES.map((voice) => (
                    <SelectItem key={voice.id} value={voice.id}>
                      {voice.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-between gap-2">
              <Button variant="outline" onClick={handleTestVoice} disabled={!tempApiKey}>
                Test Voice
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  Save
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}