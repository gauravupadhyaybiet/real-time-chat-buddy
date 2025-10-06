import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MessageSquare, Image as ImageIcon, LogOut, Sparkles } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }
    setUser(user);
    loadProfile(user.id);
  };

  const loadProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (data) {
      setProfile(data);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8 bg-card rounded-lg p-6 shadow-md border">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-primary">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                {profile?.username?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Welcome, {profile?.username || 'User'}!
              </h1>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleLogout}
            className="hover:bg-destructive hover:text-destructive-foreground"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <Card
            onClick={() => navigate('/ai-chat')}
            className="p-6 cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] border-primary/20 bg-card"
          >
            <div className="flex flex-col items-center text-center gap-4">
              <div className="bg-primary p-4 rounded-full">
                <Sparkles className="h-8 w-8 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  AI Assistant
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Chat with Gemini AI using voice and text
                </p>
              </div>
              <Button className="w-full bg-primary hover:bg-primary/90">
                Start AI Chat
              </Button>
            </div>
          </Card>

          <Card
            onClick={() => navigate('/chats')}
            className="p-6 cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] bg-card"
          >
            <div className="flex flex-col items-center text-center gap-4">
              <div className="bg-secondary p-4 rounded-full">
                <MessageSquare className="h-8 w-8 text-secondary-foreground" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-2">Real-time Chat</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Message friends instantly
                </p>
              </div>
              <Button variant="secondary" className="w-full">
                Open Chats
              </Button>
            </div>
          </Card>

          <Card
            onClick={() => navigate('/status')}
            className="p-6 cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] bg-card"
          >
            <div className="flex flex-col items-center text-center gap-4">
              <div className="bg-accent p-4 rounded-full">
                <ImageIcon className="h-8 w-8 text-accent-foreground" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-2">Status Updates</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Share moments with reactions
                </p>
              </div>
              <Button variant="outline" className="w-full">
                View Status
              </Button>
            </div>
          </Card>
        </div>

        <Card className="p-6 bg-card border">
          <h3 className="font-semibold text-foreground mb-4 text-lg">Your Profile</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground min-w-[120px]">Username:</span>
              <span className="font-medium text-foreground">{profile?.username || 'Not set'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground min-w-[120px]">Bio:</span>
              <span className="text-foreground">{profile?.bio || 'No bio yet'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground min-w-[120px]">Member since:</span>
              <span className="text-foreground">{profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Index;
