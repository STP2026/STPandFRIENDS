import { useEffect, useRef, useCallback, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const WARN_BEFORE_MS = 60 * 1000; // Warn 60 seconds before logout

/**
 * Automatically signs out the user after a period of inactivity.
 * Shows a warning 60 seconds before logout.
 * Tracks mouse, touch, keyboard, scroll and visibility events.
 * Only active when a user is logged in.
 */
export function useAutoLogout(timeoutMs = INACTIVITY_TIMEOUT_MS) {
  const { user, signOut } = useAuth();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearCountdown = useCallback(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    setShowWarning(false);
    setSecondsLeft(60);
  }, []);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (warnTimerRef.current) clearTimeout(warnTimerRef.current);
    clearCountdown();

    // Warn timer: fires WARN_BEFORE_MS before logout
    warnTimerRef.current = setTimeout(() => {
      setShowWarning(true);
      setSecondsLeft(Math.round(WARN_BEFORE_MS / 1000));
      countdownRef.current = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            clearInterval(countdownRef.current!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, timeoutMs - WARN_BEFORE_MS);

    // Logout timer
    timerRef.current = setTimeout(() => {
      signOut();
    }, timeoutMs);
  }, [signOut, timeoutMs, clearCountdown]);

  // Called when user dismisses the warning — resets the full timer
  const dismissWarning = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  useEffect(() => {
    if (!user) {
      clearCountdown();
      return;
    }

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

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        lastReset = Date.now();
        resetTimer();
      }
    };

    throttledEvents.forEach((e) => window.addEventListener(e, throttledReset, { passive: true }));
    window.addEventListener('visibilitychange', handleVisibilityChange);
    resetTimer();

    return () => {
      throttledEvents.forEach((e) => window.removeEventListener(e, throttledReset));
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      if (timerRef.current) clearTimeout(timerRef.current);
      if (warnTimerRef.current) clearTimeout(warnTimerRef.current);
      clearCountdown();
    };
  }, [user, resetTimer, clearCountdown]);

  return { showWarning, secondsLeft, dismissWarning };
}
