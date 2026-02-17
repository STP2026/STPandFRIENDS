import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo-dark.png';

// This page handles the email verification callback from Supabase.
//
// Supabase v2 with PKCE sends users here after clicking the confirmation link:
//   https://yourapp.com/auth/confirm?token_hash=XXX&type=signup
//
// The token_hash is exchanged for a session via verifyOtp().
// On success the user is logged in and redirected to the app.

type ConfirmState = 'loading' | 'success' | 'error' | 'already_confirmed';

export default function AuthConfirmPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [state, setState] = useState<ConfirmState>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const confirm = async () => {
      const tokenHash = searchParams.get('token_hash');
      const type = searchParams.get('type') as 'signup' | 'recovery' | 'email' | null;

      // Handle legacy hash-based tokens (Supabase v1 / implicit flow)
      // e.g. https://yourapp.com/auth/confirm#access_token=...&type=signup
      if (!tokenHash && window.location.hash.includes('access_token')) {
        // The Supabase client with detectSessionInUrl:true handles this automatically
        // Just wait for onAuthStateChange to fire
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setState('success');
          setTimeout(() => navigate('/'), 2000);
        } else {
          setState('error');
          setErrorMessage('Verification link could not be processed.');
        }
        return;
      }

      if (!tokenHash || !type) {
        // No token params — user may have navigated here directly
        setState('error');
        setErrorMessage('Invalid or missing verification link.');
        return;
      }

      try {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type,
        });

        if (error) {
          // Already confirmed is a common benign case
          if (
            error.message.includes('already confirmed') ||
            error.message.includes('expired') ||
            error.message.includes('Token has expired')
          ) {
            setState('already_confirmed');
          } else {
            setState('error');
            setErrorMessage(error.message);
          }
          return;
        }

        setState('success');
        // Redirect to home after 2 seconds
        setTimeout(() => navigate('/'), 2000);

      } catch (err) {
        setState('error');
        setErrorMessage('An unexpected error occurred.');
        console.error('Auth confirm error:', err);
      }
    };

    confirm();
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="glass-card rounded-xl p-8 animate-fade-in text-center">

          {/* Logo */}
          <img src={logo} alt="Save The Paws" className="h-12 w-auto mx-auto mb-6" />

          {/* Loading */}
          {state === 'loading' && (
            <>
              <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
              <h2 className="font-display text-xl font-bold text-foreground mb-2">
                E-Mail wird bestätigt…
              </h2>
              <p className="text-sm text-muted-foreground">
                Bitte einen Moment warten.
              </p>
            </>
          )}

          {/* Success */}
          {state === 'success' && (
            <>
              <div className="bg-green-500/10 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="font-display text-xl font-bold text-foreground mb-2">
                E-Mail bestätigt! 🎉
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Dein Konto wurde erfolgreich aktiviert. Du wirst gleich weitergeleitet…
              </p>
              <div className="w-full bg-secondary rounded-full h-1.5 mt-4">
                <div className="bg-primary h-1.5 rounded-full animate-[width_2s_ease-in-out]" style={{ width: '100%', transition: 'width 2s ease-in-out' }} />
              </div>
            </>
          )}

          {/* Already confirmed */}
          {state === 'already_confirmed' && (
            <>
              <div className="bg-primary/10 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-primary" />
              </div>
              <h2 className="font-display text-xl font-bold text-foreground mb-2">
                Bereits bestätigt
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                Deine E-Mail-Adresse wurde bereits verifiziert. Du kannst dich direkt anmelden.
              </p>
              <Button className="w-full" onClick={() => navigate('/auth')}>
                Zur Anmeldung
              </Button>
            </>
          )}

          {/* Error */}
          {state === 'error' && (
            <>
              <div className="bg-destructive/10 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-10 h-10 text-destructive" />
              </div>
              <h2 className="font-display text-xl font-bold text-foreground mb-2">
                Bestätigung fehlgeschlagen
              </h2>
              <p className="text-sm text-muted-foreground mb-2">
                Der Bestätigungslink ist ungültig oder abgelaufen.
              </p>
              {errorMessage && (
                <p className="text-xs text-destructive/80 mb-6 font-mono bg-destructive/5 p-2 rounded">
                  {errorMessage}
                </p>
              )}
              <div className="space-y-2">
                <Button className="w-full" onClick={() => navigate('/auth')}>
                  Neu registrieren
                </Button>
                <Button variant="outline" className="w-full" onClick={() => navigate('/')}>
                  Zur Startseite
                </Button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
