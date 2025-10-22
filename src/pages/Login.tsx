import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LanguageToggle from '@/components/LanguageToggle';
import logoGW from '@/assets/logo-globalworking.png';

const Login = () => {
  const { login, user, isAdmin, loading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigate(isAdmin ? '/admin' : '/portal');
    }
  }, [user, isAdmin, loading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const success = await login(identifier, password);
    if (success) {
      navigate(isAdmin ? '/admin' : '/portal');
    }
    setSubmitting(false);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div
      className="relative flex min-h-screen items-center justify-center p-4"
      style={{ backgroundColor: 'hsl(var(--gw-blue-medium) / 0.2)' }}
    >
      {/* Language Switch - Top Left */}
      <LanguageToggle className="absolute left-4 top-4" />

      <Card className="w-full max-w-md border border-primary/10 bg-white/95 shadow-lg">
        <CardHeader className="space-y-4 text-center border-b border-primary/10 bg-white">
          <div className="flex justify-center">
            <img
              src={logoGW}
              alt="GlobalWorking"
              className="h-20 object-contain"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-primary">
            {t('candidatePortal')}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="identifier">{t('usernameOrEmail')}</Label>
              <Input
                id="identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                className="border-primary/30 focus-visible:border-primary focus-visible:ring-primary focus-visible:ring-offset-2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t('password')}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-primary/30 focus-visible:border-primary focus-visible:ring-primary focus-visible:ring-offset-2"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={submitting}
            >
              {submitting ? '...' : t('login')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
