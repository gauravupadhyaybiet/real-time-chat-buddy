import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MessageSquare, Image as ImageIcon, LogOut } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-green-50">
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback>
                {profile?.username?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Welcome, {profile?.username || 'User'}!
              </h1>
              <p className="text-sm text-gray-600">{user?.email}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleLogout}
            className="hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Card
            onClick={() => navigate('/chats')}
            className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-teal-100 p-3 rounded-full">
                <MessageSquare className="h-6 w-6 text-teal-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Chats</h2>
                <p className="text-sm text-gray-600">
                  Start conversations with friends
                </p>
              </div>
            </div>
            <Button className="w-full bg-teal-600 hover:bg-teal-700">
              Open Chats
            </Button>
          </Card>

          <Card
            onClick={() => navigate('/status')}
            className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-green-100 p-3 rounded-full">
                <ImageIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Status</h2>
                <p className="text-sm text-gray-600">
                  Share your moments
                </p>
              </div>
            </div>
            <Button className="w-full bg-green-600 hover:bg-green-700">
              View Status
            </Button>
          </Card>
        </div>

        <Card className="mt-6 p-6">
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
