import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import logoGW from '@/assets/logo-globalworking.png';

const Login = () => {
  const { login, user, isAdmin, loading } = useAuth();
  const { language, setLanguage, t } = useLanguage();
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary to-background p-4">
      {/* Language Switch - Top Right */}
      <div className="absolute top-4 right-4">
        <div className="relative flex items-center bg-gradient-to-r from-primary to-orange-500 rounded-full p-1 shadow-lg">
          <span className={`absolute left-1 top-1/2 -translate-y-1/2 w-12 h-8 bg-white rounded-full transition-transform duration-300 ${language === 'no' ? 'translate-x-12' : 'translate-x-0'}`} />
          <button
            onClick={() => setLanguage('en')}
            className={`relative z-10 px-4 py-2 text-sm font-semibold transition-colors duration-300 ${language === 'en' ? 'text-primary' : 'text-white'}`}
          >
            EN
          </button>
          <button
            onClick={() => setLanguage('no')}
            className={`relative z-10 px-4 py-2 text-sm font-semibold transition-colors duration-300 ${language === 'no' ? 'text-primary' : 'text-white'}`}
          >
            NO
          </button>
        </div>
      </div>

      <Card className="w-full max-w-md shadow-lg border-2 border-primary/10">
        <CardHeader className="space-y-4 text-center bg-gradient-to-br from-primary/5 to-orange-500/5">
          <div className="flex justify-center">
            <img 
              src={logoGW} 
              alt="GlobalWorking" 
              className="h-20 object-contain"
            />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
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
                className="border-2 focus:border-orange-500"
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
                className="border-2 focus:border-orange-500"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90" 
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