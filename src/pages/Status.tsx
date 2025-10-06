import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Plus, Image as ImageIcon, Type, Eye, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface StatusPost {
  id: string;
  user_id: string;
  content: string;
  media_url?: string | null;
  media_type?: string | null;
  created_at: string;
  expires_at: string;
  user_profiles: {
    username: string;
    avatar_url: string;
  };
  view_count?: number;
  reaction_count?: number;
  has_viewed?: boolean;
}

export default function Status() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [statuses, setStatuses] = useState<StatusPost[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [contentType, setContentType] = useState<'text' | 'image'>('text');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [bgColor, setBgColor] = useState('#075E54');

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (currentUserId) {
      loadStatuses();

      const channel = supabase
        .channel('status-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'statuses'
          },
          () => {
            loadStatuses();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [currentUserId]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }
    setCurrentUserId(user.id);
  };

  const loadStatuses = async () => {
    if (!currentUserId) return;

    const { data: statusData } = await supabase
      .from('statuses')
      .select(`
        *,
        profiles(username, avatar_url)
      `)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (statusData) {
      const statusesWithCounts = await Promise.all(
        statusData.map(async (status: any) => {
          const { count: viewCount } = await supabase
            .from('status_views')
            .select('*', { count: 'exact', head: true })
            .eq('status_id', status.id);

          const { count: reactionCount } = await supabase
            .from('status_reactions')
            .select('*', { count: 'exact', head: true })
            .eq('status_id', status.id);

          const { data: hasViewed } = await supabase
            .from('status_views')
            .select('id')
            .eq('status_id', status.id)
            .eq('user_id', currentUserId)
            .maybeSingle();

          return {
            id: status.id,
            user_id: status.user_id,
            content: status.content,
            media_url: status.media_url,
            media_type: status.media_type,
            created_at: status.created_at,
            expires_at: status.expires_at,
            view_count: viewCount || 0,
            reaction_count: reactionCount || 0,
            has_viewed: !!hasViewed,
            user_profiles: status.profiles
          } as StatusPost;
        })
      );

      setStatuses(statusesWithCounts);
    }
  };

  const createStatus = async () => {
    if (!currentUserId) return;

    if (contentType === 'text' && !content.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter some text',
        variant: 'destructive'
      });
      return;
    }

    if (contentType === 'image' && !imageUrl.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter an image URL',
        variant: 'destructive'
      });
      return;
    }

    const { error } = await supabase.from('statuses').insert({
      user_id: currentUserId,
      content: contentType === 'text' ? content : imageUrl,
      media_url: contentType === 'image' ? imageUrl : null,
      media_type: contentType === 'image' ? 'image' : null
    });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to create status',
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'Success',
      description: 'Status posted successfully'
    });

    setContent('');
    setImageUrl('');
    setIsCreateOpen(false);
    loadStatuses();
  };

  const viewStatus = async (statusId: string) => {
    if (!currentUserId) return;

    await supabase.from('status_views').insert({
      status_id: statusId,
      user_id: currentUserId
    });

    navigate(`/status/${statusId}`);
  };

  const bgColors = [
    '#075E54', '#128C7E', '#25D366', '#34B7F1',
    '#DC4E41', '#8B4513', '#4A148C', '#E91E63'
  ];

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
              <h1 className="text-2xl font-bold text-foreground">Status</h1>
            </div>

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Status
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card">
                <DialogHeader>
                  <DialogTitle className="text-foreground">Create Status</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Button
                      variant={contentType === 'text' ? 'default' : 'outline'}
                      onClick={() => setContentType('text')}
                      className="flex-1"
                    >
                      <Type className="h-4 w-4 mr-2" />
                      Text
                    </Button>
                    <Button
                      variant={contentType === 'image' ? 'default' : 'outline'}
                      onClick={() => setContentType('image')}
                      className="flex-1"
                    >
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Image
                    </Button>
                  </div>

                  {contentType === 'text' ? (
                    <>
                      <Textarea
                        placeholder="What's on your mind?"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={4}
                        className="bg-background"
                      />
                      <div>
                        <label className="text-sm font-medium mb-2 block text-foreground">
                          Background Color
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                          {bgColors.map((color) => (
                            <button
                              key={color}
                              onClick={() => setBgColor(color)}
                              className={`h-10 rounded-lg border-2 ${
                                bgColor === color ? 'border-primary' : 'border-border'
                              }`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <Input
                      placeholder="Enter image URL (e.g., from Pexels)"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="bg-background"
                    />
                  )}

                  <Button
                    onClick={createStatus}
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    Post Status
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {statuses.map((status) => (
            <Card
              key={status.id}
              onClick={() => viewStatus(status.id)}
              className="cursor-pointer hover:shadow-lg transition-shadow overflow-hidden bg-card"
            >
              {status.media_url ? (
                <div className="aspect-[9/16] relative bg-muted">
                  <img
                    src={status.media_url}
                    alt="Status"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div
                  className="aspect-[9/16] flex items-center justify-center p-4 relative"
                  style={{ backgroundColor: bgColor }}
                >
                  <p className="text-white text-center font-medium break-words">
                    {status.content}
                  </p>
                </div>
              )}
              <div className="p-3 bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={status.user_profiles.avatar_url} />
                    <AvatarFallback className="bg-secondary text-secondary-foreground">
                      {status.user_profiles.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate text-foreground">
                      {status.user_profiles.username}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {status.view_count}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    {status.reaction_count}
                  </span>
                  {!status.has_viewed && (
                    <span className="text-primary font-semibold">New</span>
                  )}
                </div>
              </div>
            </Card>
          ))}

          {statuses.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              No active status updates. Be the first to post!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
