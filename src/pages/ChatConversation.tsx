import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
}

interface UserProfile {
  id: string;
  username: string;
  avatar_url: string;
}

export default function ChatConversation() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [otherUser, setOtherUser] = useState<UserProfile | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (conversationId && currentUserId) {
      loadMessages();
      loadOtherUser();

      const channel = supabase
        .channel(`conversation-${conversationId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${conversationId}`
          },
          (payload) => {
            setMessages(prev => [...prev, payload.new as Message]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [conversationId, currentUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }
    setCurrentUserId(user.id);
  };

  const loadMessages = async () => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (data) {
      setMessages(data);
    }
  };

  const loadOtherUser = async () => {
    if (!currentUserId) return;

    const { data } = await supabase
      .from('conversation_participants')
      .select('user_id, user_profiles!inner(*)')
      .eq('conversation_id', conversationId)
      .neq('user_id', currentUserId)
      .maybeSingle();

    if (data) {
      setOtherUser(data.user_profiles as unknown as UserProfile);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUserId || !conversationId) return;

    const { error } = await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: currentUserId,
      content: newMessage.trim()
    });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive'
      });
      return;
    }

    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-green-50 flex flex-col">
      <div className="bg-white border-b shadow-sm p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/chats')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          {otherUser && (
            <>
              <Avatar>
                <AvatarImage src={otherUser.avatar_url} />
                <AvatarFallback>
                  {otherUser.username[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold">{otherUser.username}</div>
                <div className="text-xs text-gray-500">Online</div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message) => {
            const isOwnMessage = message.sender_id === currentUserId;
            return (
              <div
                key={message.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    isOwnMessage
                      ? 'bg-teal-500 text-white'
                      : 'bg-white text-gray-800 border'
                  }`}
                >
                  <div className="break-words">{message.content}</div>
                  <div
                    className={`text-xs mt-1 ${
                      isOwnMessage ? 'text-teal-100' : 'text-gray-500'
                    }`}
                  >
                    {formatTime(message.created_at)}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="bg-white border-t p-4">
        <div className="max-w-4xl mx-auto flex gap-2">
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className="bg-teal-600 hover:bg-teal-700"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
