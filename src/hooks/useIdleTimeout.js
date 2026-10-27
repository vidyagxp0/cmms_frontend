import { useCallback, useEffect, useRef, useState } from "react";

const ACTIVITY_EVENTS = [
  "mousemove",
  "mousedown",
  "keydown",
  "scroll",
  "touchstart",
  "click",
];

export default function useIdleTimeout({
  idleTime = 5 * 60 * 1000, // 5 minutes
  warningTime = 60 * 1000, // 60 seconds countdown
  onTimeout,
  enabled = true,
}) {
  const [isWarning, setIsWarning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(warningTime / 1000);

  const idleTimerRef = useRef(null);
  const countdownRef = useRef(null);
  const warningRef = useRef(false);
  const lastActivityRef = useRef(Date.now());
  const onTimeoutRef = useRef(onTimeout);

  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  const clearTimers = useCallback(() => {
    clearTimeout(idleTimerRef.current);
    clearInterval(countdownRef.current);
  }, []);

  const startWarning = useCallback(() => {
    warningRef.current = true;
    setIsWarning(true);

    // Use a deadline (not a decrementing counter) so the countdown stays
    // accurate even if the browser throttles timers in a background tab.
    const deadline = Date.now() + warningTime;
    setSecondsLeft(Math.ceil(warningTime / 1000));

    countdownRef.current = setInterval(() => {
      const remaining = Math.ceil((deadline - Date.now()) / 1000);
      if (remaining <= 0) {
        clearInterval(countdownRef.current);
        setSecondsLeft(0);
        warningRef.current = false;
        setIsWarning(false);
        onTimeoutRef.current?.();
      } else {
        setSecondsLeft(remaining);
      }
    }, 250);
  }, [warningTime]);

  const startIdleTimer = useCallback(() => {
    clearTimers();
    warningRef.current = false;
    setIsWarning(false);
    setSecondsLeft(warningTime / 1000);
    idleTimerRef.current = setTimeout(startWarning, idleTime);
  }, [clearTimers, idleTime, warningTime, startWarning]);

  // "Stay logged in" button
  const stayLoggedIn = useCallback(() => {
    startIdleTimer();
  }, [startIdleTimer]);

  useEffect(() => {
    if (!enabled) return;

    const handleActivity = () => {
      // While the warning modal is open, only the button can extend the session
      if (warningRef.current) return;

      // Throttle: reset at most once per second
      const now = Date.now();
      if (now - lastActivityRef.current < 1000) return;
      lastActivityRef.current = now;

      startIdleTimer();
    };

    ACTIVITY_EVENTS.forEach((evt) =>
      window.addEventListener(evt, handleActivity, { passive: true })
    );
    startIdleTimer();

    return () => {
      ACTIVITY_EVENTS.forEach((evt) =>
        window.removeEventListener(evt, handleActivity)
      );
      clearTimers();
    };
  }, [enabled, startIdleTimer, clearTimers]);

  return { isWarning, secondsLeft, stayLoggedIn };
}