import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Languages } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Login = () => {
  const { login, signup, user, isAdmin, loading } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ 
    email: '', 
    password: '', 
    username: '', 
    fullName: '' 
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigate(isAdmin ? '/admin' : '/portal');
    }
  }, [user, isAdmin, loading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const success = await login(loginData.email, loginData.password);
    if (success) {
      navigate(isAdmin ? '/admin' : '/portal');
    }
    setSubmitting(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const success = await signup(
      signupData.email, 
      signupData.password, 
      signupData.username,
      signupData.fullName
    );
    if (success) {
      setSignupData({ email: '', password: '', username: '', fullName: '' });
    }
    setSubmitting(false);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary to-background p-4">
      <div className="absolute top-4 right-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setLanguage(language === 'en' ? 'no' : 'en')}
          className="gap-2"
        >
          <Languages className="h-4 w-4" />
          {language === 'en' ? 'NO' : 'EN'}
        </Button>
      </div>

      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            {t('candidatePortal')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">{t('login')}</TabsTrigger>
              <TabsTrigger value="signup">{t('signup')}</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">{t('email')}</Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="login-password">{t('password')}</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? '...' : t('login')}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-username">{t('username')}</Label>
                  <Input
                    id="signup-username"
                    type="text"
                    value={signupData.username}
                    onChange={(e) => setSignupData({ ...signupData, username: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-fullname">{t('fullName')}</Label>
                  <Input
                    id="signup-fullname"
                    type="text"
                    value={signupData.fullName}
                    onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">{t('email')}</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={signupData.email}
                    onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password">{t('password')}</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={signupData.password}
                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                    required
                    minLength={6}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? '...' : t('signup')}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;