import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Heart, ThumbsUp, Laugh, Frown, Eye, Flame } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Status {
  id: string;
  user_id: string;
  content: string;
  media_url?: string;
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

  const createStatus = async () => {
    if (!newStatus.trim()) return;

    const { error } = await supabase
      .from('statuses')
      .insert({
        user_id: userId,
        content: newStatus,
      });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setNewStatus("");
      setShowInput(false);
      toast({
        title: "Status posted!",
      });
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
              <div className="flex gap-2">
                <Button onClick={createStatus}>Post</Button>
                <Button variant="outline" onClick={() => setShowInput(false)}>
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
            <p>{status.content}</p>
            
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
