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
  status: string;
  last_seen: string;
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
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (!profile) {
      const username = email.split('@')[0];
      await supabase.from('user_profiles').insert({
        id: userId,
        username: username,
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
        status: 'Hey there! I am using this app'
      });
    }
  };

  const loadConversations = async (userId: string) => {
    const { data: participants } = await supabase
      .from('conversation_participants')
      .select(`
        conversation_id,
        conversations!inner(id, updated_at)
      `)
      .eq('user_id', userId);

    if (!participants) {
      setLoading(false);
      return;
    }

    const conversationIds = participants.map(p => p.conversation_id);

    const conversationsData: Conversation[] = [];

    for (const convId of conversationIds) {
      const { data: otherParticipants } = await supabase
        .from('conversation_participants')
        .select('user_id, user_profiles!inner(*)')
        .eq('conversation_id', convId)
        .neq('user_id', userId)
        .maybeSingle();

      if (otherParticipants) {
        const { data: lastMessage } = await supabase
          .from('messages')
          .select('content, created_at')
          .eq('conversation_id', convId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        const conv = participants.find(p => p.conversation_id === convId);

        conversationsData.push({
          id: convId,
          updated_at: conv?.conversations?.updated_at || new Date().toISOString(),
          other_user: otherParticipants.user_profiles as unknown as UserProfile,
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
      .from('user_profiles')
      .select('*')
      .neq('id', currentUserId);

    if (data) {
      setAllUsers(data);
    }
  };

  const startConversation = async (otherUserId: string) => {
    if (!currentUserId) return;

    const { data: existingConv } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', currentUserId);

    if (existingConv) {
      for (const conv of existingConv) {
        const { data: otherParticipant } = await supabase
          .from('conversation_participants')
          .select('user_id')
          .eq('conversation_id', conv.conversation_id)
          .eq('user_id', otherUserId)
          .maybeSingle();

        if (otherParticipant) {
          navigate(`/chat/${conv.conversation_id}`);
          return;
        }
      }
    }

    const { data: newConv, error } = await supabase
      .from('conversations')
      .insert({})
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

    await supabase.from('conversation_participants').insert([
      { conversation_id: newConv.id, user_id: currentUserId },
      { conversation_id: newConv.id, user_id: otherUserId }
    ]);

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
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-green-50">
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-gray-800">Chats</h1>
          </div>
          <MessageSquare className="h-6 w-6 text-teal-600" />
        </div>

        <Card className="mb-4 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </Card>

        {searchQuery && (
          <Card className="mb-4 p-2">
            <div className="text-sm font-semibold text-gray-600 px-4 py-2">
              Search Results
            </div>
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                onClick={() => startConversation(user.id)}
                className="flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <Avatar>
                  <AvatarImage src={user.avatar_url} />
                  <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-semibold">{user.username}</div>
                  <div className="text-sm text-gray-500">{user.status}</div>
                </div>
              </div>
            ))}
            {filteredUsers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No users found
              </div>
            )}
          </Card>
        )}

        <Card className="p-2">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No conversations yet. Search for users to start chatting!
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => navigate(`/chat/${conv.id}`)}
                className="flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <Avatar>
                  <AvatarImage src={conv.other_user.avatar_url} />
                  <AvatarFallback>
                    {conv.other_user.username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div className="font-semibold truncate">
                      {conv.other_user.username}
                    </div>
                    {conv.last_message && (
                      <div className="text-xs text-gray-500 ml-2">
                        {formatTime(conv.last_message.created_at)}
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 truncate">
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
