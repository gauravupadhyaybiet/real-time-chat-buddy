import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AIChat from "./pages/AIChat";
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import Chat from "./pages/Chat";
import Auth from "./pages/Auth";
import ChatRoom from "./pages/ChatRoom";
import Chats from "./pages/Chats";
import ChatConversation from "./pages/ChatConversation";
import Status from "./pages/Status";
import StatusView from "./pages/StatusView";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/app" element={<Index />} />
          <Route path="/ai-chat" element={<AIChat />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/chatroom/:conversationId" element={<ChatRoom />} />
          <Route path="/chats" element={<Chats />} />
          <Route path="/chat/:conversationId" element={<ChatConversation />} />
          <Route path="/status" element={<Status />} />
          <Route path="/status/:statusId" element={<StatusView />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
