import { useEffect, useRef, useState } from "react";

/* ------------------------------------------------------------------ */
/*  Config                                                             */
/* ------------------------------------------------------------------ */
const TICKS = 60;
const EXIT_MS = 220;

const TONES = {
  calm: { color: "#10B981", ink: "#047857" }, // emerald
  warn: { color: "#D4A017", ink: "#8F6A0C" }, // gold
  danger: { color: "#DC2626", ink: "#B91C1C" }, // red
};

const getTone = (seconds, total) => {
  if (seconds <= total / 6) return "danger"; // last 10s of 60
  if (seconds <= total / 2) return "warn"; // last 30s of 60
  return "calm";
};

// Pre-compute tick geometry once (viewBox 200 x 200)
const TICK_LIST = Array.from({ length: TICKS }, (_, i) => {
  const major = i % 5 === 0;
  const angle = ((i * 360) / TICKS - 90) * (Math.PI / 180);
  const outer = 96;
  const inner = major ? 78 : 85;
  return {
    i,
    major,
    x1: 100 + outer * Math.cos(angle),
    y1: 100 + outer * Math.sin(angle),
    x2: 100 + inner * Math.cos(angle),
    y2: 100 + inner * Math.sin(angle),
  };
});

/* ------------------------------------------------------------------ */
/*  Styles (pure CSS, no gradients, no extra libraries)                */
/* ------------------------------------------------------------------ */
const css = `
.stm-backdrop { animation: stm-fade-in .3s ease-out both; }
.stm-backdrop.is-closing { animation: stm-fade-out ${EXIT_MS}ms ease-in both; }

.stm-card { animation: stm-card-in .55s cubic-bezier(.16,1,.3,1) both; }
.stm-card.is-closing { animation: stm-card-out ${EXIT_MS}ms ease-in both; }

.stm-tick {
  transition: stroke .4s ease;
  animation: stm-tick-in .45s cubic-bezier(.2,.8,.2,1) backwards;
}

.stm-num { animation: stm-num .4s cubic-bezier(.2,.8,.2,1) both; }
.stm-beat { animation: stm-beat 1s ease-in-out infinite; }

.stm-bar-fill {
  transition: width 1s linear, background-color .5s ease;
}

.stm-btn { transition: background-color .2s ease, border-color .2s ease, transform .15s ease, box-shadow .2s ease; }
.stm-btn:active { transform: scale(.98); }

@keyframes stm-fade-in  { from { opacity: 0 } to { opacity: 1 } }
@keyframes stm-fade-out { to   { opacity: 0 } }
@keyframes stm-card-in  {
  from { opacity: 0; transform: translateY(22px) scale(.95); }
  to   { opacity: 1; transform: none; }
}
@keyframes stm-card-out { to { opacity: 0; transform: translateY(8px) scale(.98); } }
@keyframes stm-tick-in  { from { opacity: 0 } to { opacity: 1 } }
@keyframes stm-num {
  from { opacity: 0; transform: translateY(-12px) scale(.94); }
  to   { opacity: 1; transform: none; }
}
@keyframes stm-beat {
  0%, 100% { transform: scale(1); }
  50%      { transform: scale(1.07); }
}

@media (prefers-reduced-motion: reduce) {
  .stm-backdrop, .stm-card, .stm-tick, .stm-num, .stm-beat { animation: none !important; }
  .stm-tick, .stm-bar-fill, .stm-btn { transition: none !important; }
}
`;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
function SessionTimeoutModal({
  open,
  secondsLeft,
  totalSeconds = 60,
  onStay,
  onLogout,
}) {
  const [mounted, setMounted] = useState(open);
  const [closing, setClosing] = useState(false);

  const logoutBtnRef = useRef(null);
  const stayBtnRef = useRef(null);
  const lastSecondsRef = useRef(secondsLeft);

  // Keep the last visible value so the number doesn't flash "60" while closing
  if (open) lastSecondsRef.current = secondsLeft;
  const seconds = open ? secondsLeft : lastSecondsRef.current;

  // Mount / exit animation
  useEffect(() => {
    if (open) {
      setMounted(true);
      setClosing(false);
      return undefined;
    }
    if (mounted) {
      setClosing(true);
      const t = setTimeout(() => {
        setMounted(false);
        setClosing(false);
      }, EXIT_MS);
      return () => clearTimeout(t);
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Escape = stay, Tab trapped inside the dialog, page scroll locked
  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onStay?.();
        return;
      }
      if (e.key === "Tab") {
        const first = logoutBtnRef.current;
        const last = stayBtnRef.current;
        if (!first || !last) return;
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    stayBtnRef.current?.focus();

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onStay]);

  if (!mounted) return null;

  const tone = getTone(seconds, totalSeconds);
  const { color, ink } = TONES[tone];
  const isDanger = tone === "danger";

  const litCount = Math.max(
    0,
    Math.min(TICKS, Math.ceil((seconds / totalSeconds) * TICKS))
  );
  const firstLit = TICKS - litCount; // ticks are consumed clockwise from 12 o'clock

  // Bar eases toward the NEXT second over one second, so it glides continuously
  const barPercent = (Math.max(seconds - 1, 0) / totalSeconds) * 100;

  return (
    <>
      <style>{css}</style>

      <div
        className={`stm-backdrop fixed inset-0 z-[9999] flex items-center justify-center p-4 ${
          closing ? "is-closing" : ""
        }`}
        style={{
          backgroundColor: "rgba(15, 29, 23, 0.58)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="stm-title"
        aria-describedby="stm-desc"
      >
        <div
          className={`stm-card w-full max-w-[420px] overflow-hidden rounded-[28px] bg-white ${
            closing ? "is-closing" : ""
          }`}
          style={{
            boxShadow:
              "0 40px 90px -24px rgba(15,29,23,.55), 0 0 0 1px rgba(15,29,23,.06)",
          }}
        >
          {/* ---------- Countdown panel ---------- */}
          <div
            className="flex justify-center px-6 pb-5 pt-8"
            style={{ backgroundColor: "#E4F1EA" }}
          >
            <div className="relative h-[216px] w-[216px]">
              <svg
                viewBox="0 0 200 200"
                className="absolute inset-0 h-full w-full"
                aria-hidden="true"
              >
                {/* Number plate */}
                <circle
                  cx="100"
                  cy="100"
                  r="68"
                  fill="#FFFFFF"
                  style={{ filter: "drop-shadow(0 8px 16px rgba(15,29,23,.14))" }}
                />

                {/* 60 ticks: sweep in on open, then drain clockwise */}
                {TICK_LIST.map((t) => {
                  const lit = t.i >= firstLit;
                  const isLead = t.i === firstLit && litCount > 0;
                  return (
                    <line
                      key={t.i}
                      className="stm-tick"
                      x1={t.x1}
                      y1={t.y1}
                      x2={t.x2}
                      y2={t.y2}
                      strokeLinecap="round"
                      strokeWidth={t.major ? 3.6 : 2.4}
                      style={{
                        stroke: lit ? color : "rgba(15,29,23,0.13)",
                        animationDelay: `${150 + t.i * 11}ms`,
                        filter: isLead ? `drop-shadow(0 0 3px ${color})` : "none",
                      }}
                    />
                  );
                })}
              </svg>

              {/* Center readout */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ color: ink, transition: "color .5s ease" }}
                  aria-hidden="true"
                >
                  <rect x="4" y="10.5" width="16" height="10" rx="2.5" />
                  <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
                </svg>

                <span className={`mt-1 block ${isDanger ? "stm-beat" : ""}`}>
                  <span
                    key={seconds}
                    className="stm-num block text-[56px] font-semibold leading-none tabular-nums"
                    style={{
                      color: isDanger ? ink : "#0F1D17",
                      transition: "color .4s ease",
                      letterSpacing: "-0.03em",
                    }}
                  >
                    {seconds}
                  </span>
                </span>

                <span
                  className="mt-1.5 text-xs font-medium"
                  style={{ color: "#5B6B63" }}
                >
                  seconds left
                </span>
              </div>
            </div>
          </div>

          {/* ---------- Content ---------- */}
          <div className="px-7 pb-7 pt-6">
            <h2
              id="stm-title"
              className="text-center text-[22px] font-semibold leading-tight"
              style={{ color: "#0F1D17", letterSpacing: "-0.01em" }}
            >
              Are you still there?
            </h2>
            <p
              id="stm-desc"
              className="mx-auto mt-2 max-w-[320px] text-center text-sm leading-relaxed"
              style={{ color: "#5B6B63" }}
            >
              Your session has been idle. To keep your data secure, you will be
              logged out automatically when the timer ends. Unsaved changes
              will be lost.
            </p>

            {/* Progress bar */}
            <div
              className="mt-6 h-1.5 w-full overflow-hidden rounded-full"
              style={{ backgroundColor: "#E4F1EA" }}
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={totalSeconds}
              aria-valuenow={seconds}
              aria-label="Time remaining before automatic logout"
            >
              <div
                className="stm-bar-fill h-full rounded-full"
                style={{ width: `${barPercent}%`, backgroundColor: color }}
              />
            </div>

            {/* Buttons */}
            <div className="mt-6 flex gap-3">
              <button
                ref={logoutBtnRef}
                type="button"
                onClick={onLogout}
                className="stm-btn flex-1 rounded-xl border px-4 py-3 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                style={{
                  color: "#0F1D17",
                  borderColor: "rgba(15,29,23,.16)",
                  backgroundColor: "#FFFFFF",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#F3F8F5")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#FFFFFF")
                }
              >
                Log out
              </button>

              <button
                ref={stayBtnRef}
                type="button"
                onClick={onStay}
                className="stm-btn flex-[1.35] rounded-xl px-4 py-3 text-sm font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                style={{
                  backgroundColor: "#0F1D17",
                  boxShadow: "0 10px 22px -10px rgba(15,29,23,.7)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#173326";
                  e.currentTarget.style.boxShadow =
                    "0 14px 26px -10px rgba(16,185,129,.55)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#0F1D17";
                  e.currentTarget.style.boxShadow =
                    "0 10px 22px -10px rgba(15,29,23,.7)";
                }}
              >
                Stay logged in
              </button>
            </div>
          </div>
        </div>

        {/* Screen-reader announcement, every 10s and in the final 5s */}
        <span className="sr-only" aria-live="polite">
          {seconds % 10 === 0 || seconds <= 5
            ? `Logging out in ${seconds} seconds`
            : ""}
        </span>
      </div>
    </>
  );
}

export default SessionTimeoutModal;