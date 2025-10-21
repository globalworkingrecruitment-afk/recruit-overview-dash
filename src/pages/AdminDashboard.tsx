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
import { LogOut, Languages, Users, Search, Calendar } from 'lucide-react';
import UserStatsRow from '@/components/admin/UserStatsRow';
import UserDetailsDialog from '@/components/admin/UserDetailsDialog';

interface UserStats {
  username: string;
  email: string | null;
  full_name: string | null;
  candidatesViewed: number;
  searches: number;
  interviews: number;
}

const AdminDashboard = () => {
  const { user, isAdmin, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
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
      // Fetch all users
      const { data: users, error: usersError } = await supabase.rpc('admin_list_app_users');
      if (usersError) throw usersError;

      // Fetch candidate views
      const { data: views, error: viewsError } = await supabase.rpc('admin_list_candidate_view_logs');
      if (viewsError) throw viewsError;

      // Fetch searches
      const { data: searches, error: searchesError } = await supabase.rpc('admin_list_employer_search_logs');
      if (searchesError) throw searchesError;

      // Fetch interviews
      const { data: interviews, error: interviewsError } = await supabase.rpc('admin_list_schedule_requests');
      if (interviewsError) throw interviewsError;

      // Combine stats
      const stats: UserStats[] = users
        .filter((u: any) => u.username !== 'admin')
        .map((u: any) => ({
          username: u.username,
          email: u.email,
          full_name: u.full_name,
          candidatesViewed: views?.filter((v: any) => v.employer_username === u.username).length || 0,
          searches: searches?.filter((s: any) => s.employer_username === u.username).length || 0,
          interviews: interviews?.filter((i: any) => i.employer_username === u.username).length || 0,
        }));

      setUserStats(stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to load statistics');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.rpc('admin_create_app_user', {
        p_username: newUsername,
        p_password: newPassword,
        p_full_name: newFullName || null,
        p_email: newEmail || null,
      });

      if (error) throw error;

      toast.success(t('userCreated'));
      setNewUsername('');
      setNewPassword('');
      setNewFullName('');
      setNewEmail('');
      fetchUserStats();
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            {t('adminPanel')}
          </h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLanguage(language === 'en' ? 'no' : 'en')}
            >
              <Languages className="h-4 w-4 mr-2" />
              {language === 'en' ? 'NO' : 'EN'}
            </Button>
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
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t('password')}</Label>
                <Input
                  id="password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullName">{t('fullName')}</Label>
                <Input
                  id="fullName"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t('email')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
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
                  stats={stat}
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