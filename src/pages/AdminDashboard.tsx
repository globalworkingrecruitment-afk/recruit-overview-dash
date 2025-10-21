import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { LogOut, Users, Search, Calendar } from 'lucide-react';
import UserStatsRow from '@/components/admin/UserStatsRow';
import UserDetailsDialog from '@/components/admin/UserDetailsDialog';
import logoGW from '@/assets/logo-globalworking.png';

interface UserStats {
  username: string;
  email: string;
  fullName: string;
  candidatesViewed: number;
  searches: number;
  interviews: number;
}

const AdminDashboard = () => {
  const { user, isAdmin, logout } = useAuth();
  const { setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  // Always use Spanish for Admin
  useEffect(() => {
    setLanguage('es');
  }, []);
  
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    fullName: '',
    email: ''
  });
  const [userStats, setUserStats] = useState<UserStats[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || !isAdmin) {
      navigate('/');
      return;
    }
    fetchUserStats();
  }, [user, isAdmin, navigate]);

  const fetchUserStats = async () => {
    try {
      setLoading(true);
      
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
      
      if (profilesError) throw profilesError;

      // Fetch candidate view logs
      const { data: viewLogs, error: viewError } = await supabase
        .from('candidate_view_logs')
        .select('*');
      
      if (viewError) throw viewError;

      // Fetch search logs
      const { data: searchLogs, error: searchError } = await supabase
        .from('employer_search_logs')
        .select('*');
      
      if (searchError) throw searchError;

      // Fetch interview schedules
      const { data: interviews, error: interviewError } = await supabase
        .from('schedule_requests')
        .select('*');
      
      if (interviewError) throw interviewError;

      // Combine stats
      const stats: UserStats[] = (profiles || []).map((profile: any) => ({
        username: profile.username,
        email: '',
        fullName: profile.full_name || '',
        candidatesViewed: (viewLogs || []).filter((log: any) => log.employer_username === profile.username).length,
        searches: (searchLogs || []).filter((log: any) => log.employer_username === profile.username).length,
        interviews: (interviews || []).filter((log: any) => log.employer_username === profile.username).length,
      }));

      setUserStats(stats);
    } catch (error) {
      console.error('Error fetching user stats:', error);
      toast.error(t('errorLoadingStats'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newUser.email || !newUser.password || !newUser.username) {
      toast.error(t('fillAllFields'));
      return;
    }

    setLoading(true);

    try {
      // Create auth user with Supabase Auth
      const { error } = await supabase.auth.signUp({
        email: newUser.email,
        password: newUser.password,
        options: {
          data: {
            username: newUser.username,
            full_name: newUser.fullName || null,
          }
        }
      });

      if (error) throw error;

      toast.success(t('userCreated'));
      setNewUser({ username: '', password: '', fullName: '', email: '' });
      
      // Wait a bit for the trigger to complete
      setTimeout(() => fetchUserStats(), 1000);
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast.error(error.message || t('errorCreatingUser'));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img 
              src={logoGW} 
              alt="GlobalWorking" 
              className="h-12 object-contain"
            />
            <h1 className="text-3xl font-bold text-primary">
              {t('adminPanel')}
            </h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              {t('logout')}
            </Button>
          </div>
        </div>

        {/* Create User Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t('createUser')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">{t('username')}</Label>
                <Input
                  id="username"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t('email')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t('password')}</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullName">{t('fullName')}</Label>
                <Input
                  id="fullName"
                  value={newUser.fullName}
                  onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                />
              </div>
              <div className="flex items-end">
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? '...' : t('createUser')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* User Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>{t('userStatistics')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="grid grid-cols-6 gap-4 px-4 py-2 bg-muted rounded-lg font-semibold text-sm">
                <div>{t('username')}</div>
                <div>{t('fullName')}</div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {t('candidatesViewed')}
                </div>
                <div className="flex items-center gap-1">
                  <Search className="h-4 w-4" />
                  {t('searches')}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {t('interviews')}
                </div>
                <div></div>
              </div>
              {userStats.map((stat) => (
                <UserStatsRow
                  key={stat.username}
                  stats={{
                    username: stat.username,
                    email: stat.email,
                    full_name: stat.fullName,
                    candidatesViewed: stat.candidatesViewed,
                    searches: stat.searches,
                    interviews: stat.interviews,
                  }}
                  onViewDetails={() => setSelectedUser(stat.username)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {selectedUser && (
        <UserDetailsDialog
          username={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;