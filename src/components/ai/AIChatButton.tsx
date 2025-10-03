import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function AIChatButton() {
  const navigate = useNavigate();

  return (
    <Button variant="outline" size="sm" onClick={() => navigate("/chat")}>
      <Bot className="h-4 w-4 mr-2" />
      AI Chat
    </Button>
  );
}
