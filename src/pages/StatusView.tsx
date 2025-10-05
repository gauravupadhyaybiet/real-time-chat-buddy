import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Heart, Eye, Smile } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface StatusPost {
  id: string;
  user_id: string;
  content_type: 'text' | 'image';
  content: string;
  background_color: string;
  created_at: string;
  user_profiles: {
    username: string;
    avatar_url: string;
  };
}

interface StatusView {
  id: string;
  viewer_id: string;
  viewed_at: string;
  user_profiles: {
    username: string;
    avatar_url: string;
  };
}

interface StatusReaction {
  id: string;
  user_id: string;
  reaction: string;
  user_profiles: {
    username: string;
    avatar_url: string;
  };
}

export default function StatusView() {
  const { statusId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<StatusPost | null>(null);
  const [views, setViews] = useState<StatusView[]>([]);
  const [reactions, setReactions] = useState<StatusReaction[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isViewsOpen, setIsViewsOpen] = useState(false);
  const [isReactionsOpen, setIsReactionsOpen] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (statusId && currentUserId) {
      loadStatus();
      loadViews();
      loadReactions();
    }
  }, [statusId, currentUserId]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }
    setCurrentUserId(user.id);
  };

  const loadStatus = async () => {
    const { data } = await supabase
      .from('statuses')
      .select(`
        *,
        profiles(username, avatar_url)
      `)
      .eq('id', statusId)
      .maybeSingle();

    if (data) {
      setStatus({
        ...data,
        content_type: data.media_type ? 'image' : 'text',
        background_color: '#075E54',
        user_profiles: data.profiles
      } as any);
    }
  };

  const loadViews = async () => {
    const { data } = await supabase
      .from('status_views')
      .select(`
        *,
        profiles(username, avatar_url)
      `)
      .eq('status_id', statusId)
      .order('viewed_at', { ascending: false });

    if (data) {
      setViews(data.map(v => ({
        ...v,
        viewer_id: v.user_id,
        user_profiles: v.profiles
      })) as any);
    }
  };

  const loadReactions = async () => {
    const { data } = await supabase
      .from('status_reactions')
      .select(`
        *,
        profiles(username, avatar_url)
      `)
      .eq('status_id', statusId)
      .order('created_at', { ascending: false });

    if (data) {
      setReactions(data.map(r => ({
        ...r,
        user_profiles: r.profiles
      })) as any);
    }
  };

  const addReaction = async (reaction: string) => {
    if (!currentUserId || !statusId) return;

    const { data: existing } = await supabase
      .from('status_reactions')
      .select('id')
      .eq('status_id', statusId)
      .eq('user_id', currentUserId)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('status_reactions')
        .update({ reaction })
        .eq('id', existing.id);
    } else {
      await supabase.from('status_reactions').insert({
        status_id: statusId,
        user_id: currentUserId,
        reaction
      });
    }

    toast({
      title: 'Reaction added',
      description: `You reacted with ${reaction}`
    });

    loadReactions();
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  const reactionEmojis = ['❤️', '😂', '😮', '😢', '👍', '🔥', '🎉', '👏'];

  if (!status) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-green-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  const isOwner = status.user_id === currentUserId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="max-w-2xl mx-auto">
        <div className="p-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/status')}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={status.user_profiles.avatar_url} />
              <AvatarFallback>
                {status.user_profiles.username[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="text-white">
              <div className="font-semibold text-sm">
                {status.user_profiles.username}
              </div>
              <div className="text-xs opacity-75">
                {formatTime(status.created_at)}
              </div>
            </div>
          </div>
          <div className="w-10" />
        </div>

        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          {status.content_type === 'text' ? (
            <div
              className="w-full aspect-[9/16] max-h-[70vh] flex items-center justify-center p-8 rounded-lg"
              style={{ backgroundColor: status.background_color }}
            >
              <p className="text-white text-2xl text-center font-medium break-words">
                {status.content}
              </p>
            </div>
          ) : (
            <div className="w-full aspect-[9/16] max-h-[70vh] rounded-lg overflow-hidden bg-black">
              <img
                src={status.content}
                alt="Status"
                className="w-full h-full object-contain"
              />
            </div>
          )}
        </div>

        <div className="p-4 space-y-3">
          {!isOwner && (
            <div className="flex gap-2 justify-center flex-wrap">
              {reactionEmojis.map((emoji) => (
                <Button
                  key={emoji}
                  onClick={() => addReaction(emoji)}
                  variant="outline"
                  className="bg-white/10 border-white/20 hover:bg-white/20 text-2xl h-12 w-12 p-0"
                >
                  {emoji}
                </Button>
              ))}
            </div>
          )}

          {isOwner && (
            <div className="flex gap-2">
              <Dialog open={isViewsOpen} onOpenChange={setIsViewsOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex-1 bg-white/10 border-white/20 hover:bg-white/20 text-white"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {views.length} Views
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Views</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {views.map((view) => (
                      <div key={view.id} className="flex items-center gap-3 p-2">
                        <Avatar>
                          <AvatarImage src={view.user_profiles.avatar_url} />
                          <AvatarFallback>
                            {view.user_profiles.username[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="font-semibold">
                            {view.user_profiles.username}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatTime(view.viewed_at)}
                          </div>
                        </div>
                      </div>
                    ))}
                    {views.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No views yet
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isReactionsOpen} onOpenChange={setIsReactionsOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex-1 bg-white/10 border-white/20 hover:bg-white/20 text-white"
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    {reactions.length} Reactions
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Reactions</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {reactions.map((reaction) => (
                      <div key={reaction.id} className="flex items-center gap-3 p-2">
                        <Avatar>
                          <AvatarImage src={reaction.user_profiles.avatar_url} />
                          <AvatarFallback>
                            {reaction.user_profiles.username[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="font-semibold">
                            {reaction.user_profiles.username}
                          </div>
                        </div>
                        <div className="text-2xl">{reaction.reaction}</div>
                      </div>
                    ))}
                    {reactions.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No reactions yet
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
