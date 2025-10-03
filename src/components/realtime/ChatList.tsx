import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Conversation {
  id: string;
  participant_one: string;
  participant_two: string;
  profiles: {
    username: string;
    avatar_url?: string;
  };
}

interface ChatListProps {
  userId: string;
}

export function ChatList({ userId }: ChatListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadConversations();

    // Listen for new conversations
    const channel = supabase
      .channel('conversations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
        },
        () => loadConversations()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const loadConversations = async () => {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        profiles!conversations_participant_two_fkey(username, avatar_url)
      `)
      .or(`participant_one.eq.${userId},participant_two.eq.${userId}`);

    if (!error && data) {
      setConversations(data as any);
    }
    setLoading(false);
  };

  const openChat = (conversationId: string) => {
    navigate(`/chat/${conversationId}`);
  };

  if (loading) {
    return <div>Loading conversations...</div>;
  }

  if (conversations.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No conversations yet</p>
          <Button className="mt-4" onClick={() => navigate('/users')}>
            Start a conversation
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {conversations.map((conv) => (
        <Card
          key={conv.id}
          className="cursor-pointer hover:bg-accent transition-colors"
          onClick={() => openChat(conv.id)}
        >
          <CardContent className="flex items-center gap-4 p-4">
            <Avatar>
              <AvatarFallback>
                {conv.profiles.username[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium">{conv.profiles.username}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
