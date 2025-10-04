import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Plus, Heart, ThumbsUp, Laugh, Frown, Eye, Flame, Image, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Status {
  id: string;
  user_id: string;
  content: string;
  media_url?: string;
  media_type?: string;
  created_at: string;
  profiles: {
    username: string;
  };
  reactions: Array<{
    reaction: string;
    user_id: string;
  }>;
  status_views: Array<{
    user_id: string;
  }>;
}

interface StatusFeedProps {
  userId: string;
}

const reactions = [
  { emoji: '❤️', icon: Heart },
  { emoji: '😂', icon: Laugh },
  { emoji: '😮', icon: Eye },
  { emoji: '😢', icon: Frown },
  { emoji: '👍', icon: ThumbsUp },
  { emoji: '🔥', icon: Flame },
];

export function StatusFeed({ userId }: StatusFeedProps) {
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [newStatus, setNewStatus] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadStatuses();

    // Listen for new statuses and reactions
    const channel = supabase
      .channel('status_feed')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'statuses',
        },
        () => loadStatuses()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'status_reactions',
        },
        () => loadStatuses()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'status_views',
        },
        () => loadStatuses()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadStatuses = async () => {
    const { data, error } = await supabase
      .from('statuses')
      .select(`
        *,
        profiles(username),
        status_reactions(reaction, user_id),
        status_views(user_id)
      `)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setStatuses(data as any);
      
      // Mark statuses as viewed
      data.forEach(status => {
        if (status.user_id !== userId && !status.status_views?.some(v => v.user_id === userId)) {
          recordView(status.id);
        }
      });
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Image must be less than 5MB",
          variant: "destructive",
        });
        return;
      }
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
  };

  const createStatus = async () => {
    if (!newStatus.trim() && !selectedImage) return;

    setUploading(true);
    let mediaUrl = null;
    let mediaType = null;

    try {
      // Upload image if selected
      if (selectedImage) {
        const fileExt = selectedImage.name.split('.').pop();
        const fileName = `${userId}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError, data } = await supabase.storage
          .from('status-media')
          .upload(fileName, selectedImage);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('status-media')
          .getPublicUrl(fileName);

        mediaUrl = publicUrl;
        mediaType = selectedImage.type;
      }

      // Create status
      const { error } = await supabase
        .from('statuses')
        .insert({
          user_id: userId,
          content: newStatus,
          media_url: mediaUrl,
          media_type: mediaType,
        });

      if (error) throw error;

      setNewStatus("");
      removeImage();
      setShowInput(false);
      toast({
        title: "Status posted!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const recordView = async (statusId: string) => {
    await supabase
      .from('status_views')
      .insert({
        status_id: statusId,
        user_id: userId,
      });
  };

  const addReaction = async (statusId: string, reaction: string) => {
    const { error } = await supabase
      .from('status_reactions')
      .insert({
        status_id: statusId,
        user_id: userId,
        reaction,
      });

    if (error && !error.message.includes('duplicate')) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Create Status */}
      <Card>
        <CardContent className="p-4">
          {!showInput ? (
            <Button
              className="w-full"
              variant="outline"
              onClick={() => setShowInput(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Status
            </Button>
          ) : (
            <div className="space-y-4">
              <Textarea
                placeholder="What's on your mind?"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              />
              
              {imagePreview && (
                <div className="relative">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="max-h-64 rounded-lg object-cover w-full"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={removeImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              <div className="flex gap-2 items-center">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="image-upload"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => document.getElementById('image-upload')?.click()}
                  disabled={uploading}
                >
                  <Image className="h-4 w-4" />
                </Button>
                <Button onClick={createStatus} disabled={uploading}>
                  {uploading ? "Posting..." : "Post"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowInput(false);
                    removeImage();
                  }}
                  disabled={uploading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Feed */}
      {statuses.map((status) => (
        <Card key={status.id}>
          <CardContent className="p-4 space-y-4">
            <div>
              <p className="font-semibold">{status.profiles.username}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(status.created_at).toLocaleString()}
              </p>
            </div>
            {status.content && <p>{status.content}</p>}
            
            {/* Display image if exists */}
            {status.media_url && status.media_type?.startsWith('image/') && (
              <img 
                src={status.media_url} 
                alt="Status media" 
                className="w-full rounded-lg object-cover max-h-96"
              />
            )}
            
            {/* View count */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Eye className="h-4 w-4" />
              <span>{status.status_views?.length || 0} {status.status_views?.length === 1 ? 'view' : 'views'}</span>
            </div>

            {/* Reactions */}
            <div className="flex flex-wrap gap-2">
              {reactions.map(({ emoji, icon: Icon }) => {
                const count = status.reactions.filter(r => r.reaction === emoji).length;
                const hasReacted = status.reactions.some(r => r.reaction === emoji && r.user_id === userId);
                
                return (
                  <Button
                    key={emoji}
                    variant={hasReacted ? "default" : "outline"}
                    size="sm"
                    onClick={() => addReaction(status.id, emoji)}
                  >
                    <Icon className="h-3 w-3 mr-1" />
                    {count > 0 && <span className="ml-1">{count}</span>}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
