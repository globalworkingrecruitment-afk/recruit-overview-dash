import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  username: string;
  email: string | null;
  full_name: string | null;
  isAdmin: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  session: Session | null;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        if (session?.user) {
          await loadUserProfile(session.user);
        } else {
          setUser(null);
          setIsAdmin(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        loadUserProfile(session.user).then(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (authUser: User) => {
    try {
      // Get profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      // Check if user is admin
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', authUser.id);

      const hasAdminRole = roles?.some(r => r.role === 'admin') || false;

      setUser({
        id: authUser.id,
        username: profile?.username || '',
        email: authUser.email || null,
        full_name: profile?.full_name || null,
        isAdmin: hasAdminRole,
      });
      setIsAdmin(hasAdminRole);

      // Log access
      await supabase.from('access_logs').insert({
        username: profile?.username || authUser.email || 'unknown',
        role: hasAdminRole ? 'admin' : 'user',
      });
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const login = async (identifier: string, password: string): Promise<boolean> => {
    try {
      let emailToUse = identifier;

      // Si no parece un email, buscar el email por username
      if (!identifier.includes('@')) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', identifier)
          .single();

        if (profileError || !profile) {
          toast.error('Invalid credentials');
          return false;
        }

        // Obtener el email del usuario desde auth.users usando una función RPC
        const { data: authUser, error: authError } = await supabase
          .rpc('get_user_email_by_id', { user_id: profile.id });

        if (authError || !authUser) {
          toast.error('Invalid credentials');
          return false;
        }

        emailToUse = authUser;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailToUse,
        password,
      });

      if (error) {
        toast.error(error.message || 'Invalid credentials');
        return false;
      }

      if (data.user) {
        await loadUserProfile(data.user);
        toast.success('Login successful');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed');
      return false;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsAdmin(false);
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ user, session, isAdmin, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};