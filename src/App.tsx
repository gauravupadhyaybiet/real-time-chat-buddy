import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Chat from "./pages/Chat";
import Auth from "./pages/Auth";
import AppPage from "./pages/App";
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
          <Route path="/chat" element={<Chat />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/app" element={<AppPage />} />
          <Route path="/chatroom/:conversationId" element={<ChatRoom />} />
          <Route path="/chats" element={<Chats />} />
          <Route path="/chat/:conversationId" element={<ChatConversation />} />
          <Route path="/status" element={<Status />} />
          <Route path="/status/:statusId" element={<StatusView />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
