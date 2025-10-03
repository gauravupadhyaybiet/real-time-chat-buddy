import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Video } from "lucide-react";
import { VideoCall } from "./VideoCall";

export function VideoCallButton() {
  const [showCall, setShowCall] = useState(false);

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setShowCall(true)}>
        <Video className="h-4 w-4 mr-2" />
        Video Call
      </Button>

      <Dialog open={showCall} onOpenChange={setShowCall}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Video Call</DialogTitle>
          </DialogHeader>
          <VideoCall onEnd={() => setShowCall(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
