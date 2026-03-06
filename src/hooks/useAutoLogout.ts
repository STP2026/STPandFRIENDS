import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Automatically signs out the user after a period of inactivity.
 * Tracks mouse, touch, keyboard, scroll and visibility events.
 * Only active when a user is logged in.
 */
export function useAutoLogout(timeoutMs = INACTIVITY_TIMEOUT_MS) {
  const { user, signOut } = useAuth();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      signOut();
    }, timeoutMs);
  }, [signOut, timeoutMs]);

  useEffect(() => {
    if (!user) return;

    // Throttled events: mouse, keyboard, touch, scroll
    const throttledEvents: (keyof WindowEventMap)[] = [
      'mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll',
    ];

    let lastReset = Date.now();
    const throttledReset = () => {
      const now = Date.now();
      if (now - lastReset > 30_000) {
        lastReset = now;
        resetTimer();
      }
    };

    // visibilitychange resets immediately (no throttle) — important for PWA/mobile
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        lastReset = Date.now();
        resetTimer();
      }
    };

    throttledEvents.forEach((e) => window.addEventListener(e, throttledReset, { passive: true }));
    window.addEventListener('visibilitychange', handleVisibilityChange);
    resetTimer(); // Start initial timer

    return () => {
      throttledEvents.forEach((e) => window.removeEventListener(e, throttledReset));
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [user, resetTimer]);
}
