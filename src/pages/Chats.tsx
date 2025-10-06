import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, Search, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  username: string;
  avatar_url: string;
  bio: string;
}

interface Conversation {
  id: string;
  updated_at: string;
  other_user: UserProfile;
  last_message?: {
    content: string;
    created_at: string;
  };
}

export default function Chats() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }
    setCurrentUserId(user.id);
    await ensureUserProfile(user.id, user.email || 'User');
    loadConversations(user.id);
    loadAllUsers(user.id);
  };

  const ensureUserProfile = async (userId: string, email: string) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (!profile) {
      const username = email.split('@')[0];
      await supabase.from('profiles').insert({
        id: userId,
        username: username,
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
        bio: 'Hey there! I am using this app'
      });
    }
  };

  const loadConversations = async (userId: string) => {
    const { data: convData } = await supabase
      .from('conversations')
      .select('*')
      .or(`participant_one.eq.${userId},participant_two.eq.${userId}`);

    if (!convData) {
      setLoading(false);
      return;
    }

    const conversationsData: Conversation[] = [];

    for (const conv of convData) {
      const otherUserId = conv.participant_one === userId ? conv.participant_two : conv.participant_one;

      const { data: otherUserProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', otherUserId)
        .maybeSingle();

      if (otherUserProfile) {
        const { data: lastMessage } = await supabase
          .from('messages')
          .select('content, created_at')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        conversationsData.push({
          id: conv.id,
          updated_at: conv.created_at,
          other_user: otherUserProfile as unknown as UserProfile,
          last_message: lastMessage || undefined
        });
      }
    }

    conversationsData.sort((a, b) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );

    setConversations(conversationsData);
    setLoading(false);
  };

  const loadAllUsers = async (currentUserId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*');

    if (data) {
      setAllUsers(data);
    }
  };

  const startConversation = async (otherUserId: string) => {
    if (!currentUserId) return;

    const participant1 = currentUserId < otherUserId ? currentUserId : otherUserId;
    const participant2 = currentUserId < otherUserId ? otherUserId : currentUserId;

    const { data: existingConv } = await supabase
      .from('conversations')
      .select('*')
      .eq('participant_one', participant1)
      .eq('participant_two', participant2)
      .maybeSingle();

    if (existingConv) {
      navigate(`/chat/${existingConv.id}`);
      return;
    }

    const { data: newConv, error } = await supabase
      .from('conversations')
      .insert({
        participant_one: participant1,
        participant_two: participant2
      })
      .select()
      .single();

    if (error || !newConv) {
      toast({
        title: 'Error',
        description: 'Failed to create conversation',
        variant: 'destructive'
      });
      return;
    }

    navigate(`/chat/${newConv.id}`);
  };

  const filteredUsers = allUsers.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-card rounded-lg p-4 mb-6 shadow-md border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/app')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold text-foreground">Chats</h1>
            </div>
            <MessageSquare className="h-6 w-6 text-primary" />
          </div>
        </div>

        <Card className="mb-4 p-4 bg-card">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background"
            />
          </div>
        </Card>

        {searchQuery && (
          <Card className="mb-4 p-2 bg-card">
            <div className="text-sm font-semibold text-muted-foreground px-4 py-2">
              Search Results
            </div>
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                onClick={() => startConversation(user.id)}
                className="flex items-center gap-3 p-4 hover:bg-accent cursor-pointer transition-colors rounded-md"
              >
                <Avatar>
                  <AvatarImage src={user.avatar_url} />
                  <AvatarFallback className="bg-secondary text-secondary-foreground">
                    {user.username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-semibold text-foreground">{user.username}</div>
                  <div className="text-sm text-muted-foreground">{user.bio || 'Hey there!'}</div>
                </div>
              </div>
            ))}
            {filteredUsers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No users found
              </div>
            )}
          </Card>
        )}

        <Card className="p-2 bg-card">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No conversations yet. Search for users to start chatting!
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => navigate(`/chat/${conv.id}`)}
                className="flex items-center gap-3 p-4 hover:bg-accent cursor-pointer transition-colors rounded-md"
              >
                <Avatar>
                  <AvatarImage src={conv.other_user.avatar_url} />
                  <AvatarFallback className="bg-secondary text-secondary-foreground">
                    {conv.other_user.username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div className="font-semibold truncate text-foreground">
                      {conv.other_user.username}
                    </div>
                    {conv.last_message && (
                      <div className="text-xs text-muted-foreground ml-2">
                        {formatTime(conv.last_message.created_at)}
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground truncate">
                    {conv.last_message?.content || 'No messages yet'}
                  </div>
                </div>
              </div>
            ))
          )}
        </Card>
      </div>
    </div>
  );
}
