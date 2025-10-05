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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Avatar className="h-14 w-14 border-2 border-primary shadow-lg">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                {profile?.username?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Welcome, {profile?.username || 'User'}!
              </h1>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleLogout}
            className="hover:bg-red-50 hover:text-red-600 border-2"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card
            onClick={() => navigate('/ai-chat')}
            className="p-6 cursor-pointer hover:shadow-xl transition-all hover:scale-105 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-full shadow-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AI Assistant
                </h2>
                <p className="text-sm text-muted-foreground">
                  Chat with Gemini AI
                </p>
              </div>
            </div>
            <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-md">
              Start AI Chat
            </Button>
          </Card>

          <Card
            onClick={() => navigate('/chats')}
            className="p-6 cursor-pointer hover:shadow-xl transition-all hover:scale-105 bg-gradient-to-br from-teal-50 to-green-50 border-2 border-teal-200"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-gradient-to-r from-teal-500 to-green-500 p-3 rounded-full shadow-lg">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-teal-700">Messages</h2>
                <p className="text-sm text-muted-foreground">
                  Chat with friends
                </p>
              </div>
            </div>
            <Button className="w-full bg-gradient-to-r from-teal-500 to-green-500 hover:from-teal-600 hover:to-green-600 shadow-md">
              Open Chats
            </Button>
          </Card>

          <Card
            onClick={() => navigate('/status')}
            className="p-6 cursor-pointer hover:shadow-xl transition-all hover:scale-105 bg-gradient-to-br from-pink-50 to-orange-50 border-2 border-pink-200"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-gradient-to-r from-pink-500 to-orange-500 p-3 rounded-full shadow-lg">
                <ImageIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-pink-700">Status</h2>
                <p className="text-sm text-muted-foreground">
                  Share your moments
                </p>
              </div>
            </div>
            <Button className="w-full bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 shadow-md">
              View Status
            </Button>
          </Card>
        </div>

        <Card className="mt-6 p-6 bg-white/50 backdrop-blur">
          <h3 className="font-semibold text-gray-800 mb-3">Your Profile</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p><strong>Username:</strong> {profile?.username || 'Not set'}</p>
            <p><strong>Bio:</strong> {profile?.bio || 'No bio yet'}</p>
            <p><strong>Member since:</strong> {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'}</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Index;
