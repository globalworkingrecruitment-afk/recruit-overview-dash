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
    // Set up auth state listener - CRITICAL: Do not use async/await here to prevent deadlocks
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (session?.user) {
          // Use setTimeout to defer async operations and prevent blocking
          setTimeout(() => {
            loadUserProfile(session.user);
          }, 0);
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
        loadUserProfile(session.user).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (authUser: User) => {
    try {
      // Optimized: Fetch profile and roles in parallel
      const [profileResult, rolesResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .maybeSingle(),
        supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', authUser.id)
      ]);

      const profile = profileResult.data;
      const hasAdminRole = rolesResult.data?.some(r => r.role === 'admin') || false;

      setUser({
        id: authUser.id,
        username: profile?.username || '',
        email: authUser.email || null,
        full_name: profile?.full_name || null,
        isAdmin: hasAdminRole,
      });
      setIsAdmin(hasAdminRole);

      // Log access asynchronously without waiting
      supabase.from('access_logs').insert({
        username: profile?.username || authUser.email || 'unknown',
        role: hasAdminRole ? 'admin' : 'user',
      }).then(({ error }) => {
        if (error) console.error('Error logging access:', error);
      });
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const login = async (identifier: string, password: string): Promise<boolean> => {
    try {
      // Llamar a la edge function que maneja login con username o email
      const { data, error } = await supabase.functions.invoke('login-with-username', {
        body: { identifier, password }
      });

      if (error || !data?.session) {
        toast.error('Invalid credentials');
        return false;
      }

      // Establecer la sesión manualmente
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      });

      if (sessionError) {
        toast.error('Login failed');
        return false;
      }

      // La sesión se cargará automáticamente por el listener onAuthStateChange
      toast.success('Login successful');
      return true;
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