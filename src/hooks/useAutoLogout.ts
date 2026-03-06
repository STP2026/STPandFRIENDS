import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Automatically signs out the user after a period of inactivity.
 * Tracks mouse, touch, keyboard, and scroll events as "activity".
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

    const events: (keyof WindowEventMap)[] = [
      'mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll',
      'visibilitychange',
    ];

    // Throttle: only reset timer at most once per 30 seconds
    let lastReset = Date.now();
    const throttledReset = () => {
      const now = Date.now();
      if (now - lastReset > 30_000) {
        lastReset = now;
        resetTimer();
      }
    };

    events.forEach((e) => window.addEventListener(e, throttledReset, { passive: true }));
    resetTimer(); // Start initial timer

    return () => {
      events.forEach((e) => window.removeEventListener(e, throttledReset));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [user, resetTimer]);
}
