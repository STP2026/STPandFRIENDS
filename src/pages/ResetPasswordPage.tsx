import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, CheckCircle, XCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import logo from '@/assets/logo-dark.png';

// Handles the password-reset callback from Supabase.
// Supabase sends the user here after clicking the reset link in their email:
//   https://help.save-the-paws.com/auth/reset-password?token_hash=XXX&type=recovery
//
// Flow:
//   1. Verify the token_hash via verifyOtp({ type: 'recovery' })
//      → this establishes a temporary session
//   2. Show the new-password form
//   3. Call supabase.auth.updateUser({ password }) to save it
//   4. Redirect to /auth

type PageState = 'verifying' | 'form' | 'saving' | 'success' | 'error';

export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [state, setState] = useState<PageState>('verifying');
  const [errorMessage, setErrorMessage] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');

  // Step 1 — verify the token from the URL
  useEffect(() => {
    const verify = async () => {
      const tokenHash = searchParams.get('token_hash');
      const type = searchParams.get('type');

      // Supabase may also deliver the session via URL hash (implicit flow fallback)
      if (!tokenHash && window.location.hash.includes('access_token')) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) { setState('form'); return; }
      }

      if (!tokenHash || type !== 'recovery') {
        setState('error');
        setErrorMessage(t('resetPassword.invalidLink', 'Ungültiger oder fehlender Reset-Link.'));
        return;
      }

      const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: 'recovery',
      });

      if (error) {
        setState('error');
        setErrorMessage(
          error.message.includes('expired')
            ? t('resetPassword.linkExpired', 'Der Link ist abgelaufen. Bitte fordere einen neuen an.')
            : error.message
        );
        return;
      }

      setState('form');
    };

    verify();
  }, [searchParams, t]);

  // Step 2 — save the new password
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (password.length < 6) {
      setFormError(t('auth.passwordMinLength', 'Passwort muss mindestens 6 Zeichen haben.'));
      return;
    }
    if (password !== passwordConfirm) {
      setFormError(t('resetPassword.passwordMismatch', 'Passwörter stimmen nicht überein.'));
      return;
    }

    setState('saving');

    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setState('form');
      setFormError(error.message);
      return;
    }

    setState('success');
    setTimeout(() => navigate('/auth'), 3000);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="glass-card rounded-xl p-8 animate-fade-in text-center">

          <img src={logo} alt="Save The Paws" className="h-12 w-auto mx-auto mb-6" />

          {/* Verifying token */}
          {state === 'verifying' && (
            <>
              <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
              <h2 className="font-display text-xl font-bold text-foreground mb-2">
                {t('resetPassword.verifying', 'Link wird überprüft…')}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t('common.pleaseWait', 'Bitte einen Moment warten.')}
              </p>
            </>
          )}

          {/* New password form */}
          {(state === 'form' || state === 'saving') && (
            <>
              <div className="bg-primary/10 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <Lock className="w-10 h-10 text-primary" />
              </div>
              <h2 className="font-display text-xl font-bold text-foreground mb-2">
                {t('resetPassword.title', 'Neues Passwort setzen')}
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                {t('resetPassword.subtitle', 'Wähle ein sicheres Passwort mit mindestens 6 Zeichen.')}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4 text-left">
                <div className="space-y-2">
                  <Label htmlFor="new-password" className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    {t('resetPassword.newPassword', 'Neues Passwort')}
                  </Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    {t('resetPassword.confirmPassword', 'Passwort bestätigen')}
                  </Label>
                  <Input
                    id="confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    required
                  />
                </div>

                {formError && (
                  <p className="text-sm text-destructive">{formError}</p>
                )}

                <Button type="submit" className="w-full" disabled={state === 'saving'}>
                  {state === 'saving'
                    ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />{t('auth.pleaseWait', 'Bitte warten…')}</>
                    : t('resetPassword.savePassword', 'Passwort speichern')}
                </Button>
              </form>
            </>
          )}

          {/* Success */}
          {state === 'success' && (
            <>
              <div className="bg-green-500/10 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="font-display text-xl font-bold text-foreground mb-2">
                {t('resetPassword.successTitle', 'Passwort geändert! 🎉')}
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                {t('resetPassword.successDesc', 'Dein Passwort wurde erfolgreich gesetzt. Du wirst gleich zur Anmeldung weitergeleitet…')}
              </p>
              <div className="w-full bg-secondary rounded-full h-1.5">
                <div className="bg-primary h-1.5 rounded-full" style={{ width: '100%', transition: 'width 3s ease-in-out' }} />
              </div>
            </>
          )}

          {/* Error */}
          {state === 'error' && (
            <>
              <div className="bg-destructive/10 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-10 h-10 text-destructive" />
              </div>
              <h2 className="font-display text-xl font-bold text-foreground mb-2">
                {t('resetPassword.errorTitle', 'Link ungültig')}
              </h2>
              {errorMessage && (
                <p className="text-sm text-muted-foreground mb-6">{errorMessage}</p>
              )}
              <div className="space-y-2">
                <Button className="w-full" onClick={() => navigate('/auth')}>
                  {t('auth.backToLogin', 'Zurück zur Anmeldung')}
                </Button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
