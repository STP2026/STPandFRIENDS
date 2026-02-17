import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dog, Mail, Lock, User, AlertCircle, MapPin, CheckCircle } from 'lucide-react';
import { z } from 'zod';

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { user, isLoading, signIn, signUp, signInWithGoogle } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const redirectMessage = (location.state as { message?: string })?.message;
  const redirectTo = (location.state as { from?: string })?.from || '/';

  const emailSchema = z.string().email(t('auth.invalidEmail'));
  const passwordSchema = z.string().min(6, t('auth.passwordMinLength'));

  useEffect(() => {
    if (user && !isLoading) {
      navigate(redirectTo);
    }
  }, [user, isLoading, navigate, redirectTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
        return;
      }
    }

    setIsSubmitting(true);
    
    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            setError(t('auth.invalidCredentials'));
          } else if (error.message.includes('Email not confirmed')) {
            setError(t('auth.emailNotConfirmed'));
          } else {
            setError(error.message);
          }
        }
      } else {
        const { error } = await signUp(email, password, displayName);
        if (error) {
          if (error.message.includes('already registered')) {
            setError(t('auth.emailAlreadyRegistered'));
          } else {
            setError(error.message);
          }
        } else {
          // Success — Supabase sent a confirmation email
          setEmailSent(true);
        }
      }
    } catch (err) {
      setError(t('auth.unexpectedError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">{t('auth.loading')}</div>
      </div>
    );
  }

  // Show "check your email" screen after successful signup
  if (emailSent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="glass-card rounded-xl p-8 animate-fade-in text-center">
            <div className="bg-primary/10 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <Mail className="w-10 h-10 text-primary" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-3">
              {t('auth.checkYourEmail')}
            </h2>
            <p className="text-muted-foreground mb-2">
              {t('auth.verificationSent')} <strong>{email}</strong>
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              {t('auth.clickLinkToVerify')}
            </p>
            <div className="bg-secondary/50 rounded-lg p-4 text-left space-y-2 mb-6">
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span>{t('auth.checkSpamFolder')}</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span>{t('auth.linkExpiresIn')}</span>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setEmailSent(false);
                setIsLogin(true);
                setPassword('');
              }}
            >
              {t('auth.backToLogin')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="glass-card rounded-xl p-8 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="bg-primary/10 p-3 rounded-full">
              <Dog className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              {t('appName')}
            </h1>
          </div>

          <h2 className="text-xl font-semibold text-center mb-6">
            {isLogin ? t('auth.login') : t('auth.signup')}
          </h2>

          {redirectMessage === 'map' && (
            <div className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded-lg flex items-center gap-2 text-primary">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{t('auth.loginToViewMap')}</span>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2 text-destructive">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="displayName" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {t('auth.name')}
                </Label>
                <Input
                  id="displayName"
                  type="text"
                  placeholder={t('auth.namePlaceholder')}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {t('auth.email')}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={t('auth.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                {t('auth.password')}
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? t('auth.pleaseWait') : (isLogin ? t('auth.login') : t('auth.signup'))}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">{t('auth.or')}</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
            onClick={async () => {
              setError('');
              const { error } = await signInWithGoogle();
              if (error) {
                setError(error.message);
              }
            }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {t('auth.signInWithGoogle')}
          </Button>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-sm text-primary hover:underline"
            >
              {isLogin ? t('auth.noAccount') : t('auth.alreadyRegistered')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
