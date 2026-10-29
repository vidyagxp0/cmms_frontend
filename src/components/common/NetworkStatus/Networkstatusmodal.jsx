import { useEffect, useRef, useState } from "react";
import useNetworkStatus from "./Usenetworkstatus";

/* ------------------------------------------------------------------ */
/*  Config                                                             */
/* ------------------------------------------------------------------ */
const EXIT_MS = 220;
const RESTORED_MS = 4500;

const THEME = {
  offline: { panel: "#FBF3DC", color: "#D4A017", ink: "#8F6A0C" }, // gold
  restored: { panel: "#E4F1EA", color: "#10B981", ink: "#047857" }, // emerald
};

const TIPS = [
  "Stay on this page. Refreshing or closing it can lose unsaved changes.",
  "Hold off on saving or submitting records until you are back online.",
  "Check your Wi-Fi, network cable or router, then tap Retry.",
];

const fmtClock = (s) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

const fmtWords = (s) => {
  if (s < 60) return `${s} second${s === 1 ? "" : "s"}`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  return r ? `${m} min ${r} sec` : `${m} minute${m === 1 ? "" : "s"}`;
};

/* ------------------------------------------------------------------ */
/*  Styles (pure CSS, solid colors only)                               */
/* ------------------------------------------------------------------ */
const css = `
.nsm-backdrop { animation: nsm-fade-in .3s ease-out both; }
.nsm-backdrop.is-closing { animation: nsm-fade-out ${EXIT_MS}ms ease-in both; }

.nsm-card { animation: nsm-card-in .55s cubic-bezier(.16,1,.3,1) both; }
.nsm-card.is-closing { animation: nsm-card-out ${EXIT_MS}ms ease-in both; }

.nsm-ring {
  position: absolute; inset: 0; border-radius: 9999px;
  border: 2px solid var(--nsm-color); opacity: 0;
  animation: nsm-ring 2.4s ease-out infinite;
}
.nsm-ring.is-once { animation: nsm-ring 1.6s ease-out 2 both; }

.nsm-arc-search { opacity: .22; animation: nsm-search 1.7s ease-in-out infinite; }
.nsm-arc-on { animation: nsm-arc-on .5s ease-out both; }

.nsm-slash {
  stroke-dasharray: 26; stroke-dashoffset: 26;
  animation: nsm-slash .55s cubic-bezier(.4,0,.2,1) .3s forwards;
}

.nsm-badge { animation: nsm-pop .5s cubic-bezier(.34,1.56,.64,1) .75s both; }
.nsm-check { stroke-dasharray: 22; stroke-dashoffset: 22; animation: nsm-check .4s ease-out 1.05s forwards; }

.nsm-drain { animation: nsm-drain ${RESTORED_MS}ms linear forwards; }

.nsm-dot { animation: nsm-dot 1.2s ease-in-out infinite; }
.nsm-spinner { animation: nsm-spin .7s linear infinite; }

.nsm-rise { animation: nsm-rise .5s cubic-bezier(.16,1,.3,1) both; }

.nsm-btn { transition: background-color .2s ease, box-shadow .2s ease, transform .15s ease, opacity .2s ease; }
.nsm-btn:active:not(:disabled) { transform: scale(.98); }

@keyframes nsm-fade-in  { from { opacity: 0 } to { opacity: 1 } }
@keyframes nsm-fade-out { to   { opacity: 0 } }
@keyframes nsm-card-in  { from { opacity: 0; transform: translateY(22px) scale(.95) } to { opacity: 1; transform: none } }
@keyframes nsm-card-out { to   { opacity: 0; transform: translateY(8px) scale(.98) } }
@keyframes nsm-ring     { from { transform: scale(1); opacity: .45 } to { transform: scale(1.9); opacity: 0 } }
@keyframes nsm-search   { 0%, 100% { opacity: .22 } 45%, 60% { opacity: 1 } }
@keyframes nsm-arc-on   { from { opacity: .12 } to { opacity: 1 } }
@keyframes nsm-slash    { to { stroke-dashoffset: 0 } }
@keyframes nsm-pop      { from { transform: scale(0) } to { transform: scale(1) } }
@keyframes nsm-check    { to { stroke-dashoffset: 0 } }
@keyframes nsm-drain    { from { width: 100% } to { width: 0% } }
@keyframes nsm-dot      { 0%, 80%, 100% { opacity: .25; transform: translateY(0) } 40% { opacity: 1; transform: translateY(-3px) } }
@keyframes nsm-spin     { to { transform: rotate(360deg) } }
@keyframes nsm-rise     { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: none } }

@media (prefers-reduced-motion: reduce) {
  .nsm-backdrop, .nsm-card, .nsm-ring, .nsm-arc-search, .nsm-arc-on, .nsm-badge,
  .nsm-dot, .nsm-rise { animation: none !important; }
  .nsm-arc-search { opacity: 1; }
  .nsm-slash, .nsm-check { animation: none !important; stroke-dashoffset: 0; }
  .nsm-drain { animation: none !important; width: 0%; }
  .nsm-btn { transition: none !important; }
}
`;

/* ------------------------------------------------------------------ */
/*  Wi-Fi icon                                                         */
/* ------------------------------------------------------------------ */
function WifiIcon({ variant, ink, size = 54 }) {
  const offline = variant === "offline";
  const arcClass = offline ? "nsm-arc-search" : "nsm-arc-on";
  const delay = (i) => ({
    animationDelay: offline ? `${i * 0.18}s` : `${0.2 + i * 0.18}s`,
  });

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ color: ink }}
      aria-hidden="true"
    >
      <circle className={arcClass} style={delay(0)} cx="12" cy="20" r="1.3" fill="currentColor" stroke="none" />
      <path className={arcClass} style={delay(1)} d="M8.53 16.11a6 6 0 0 1 6.95 0" />
      <path className={arcClass} style={delay(2)} d="M5 12.55a11 11 0 0 1 14.08 0" />
      <path className={arcClass} style={delay(3)} d="M1.42 9a16 16 0 0 1 21.16 0" />

      {offline && (
        <>
          {/* white underlay so the slash cleanly cuts through the arcs */}
          <path className="nsm-slash" d="M3 3L21 21" stroke="#FFFFFF" strokeWidth="4.6" />
          <path className="nsm-slash" d="M3 3L21 21" strokeWidth="2" />
        </>
      )}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
function NetworkStatusModal({ checkUrls }) {
  const {
    status,
    offlineSeconds,
    lastOfflineSeconds,
    checking,
    retryFailed,
    retry,
    dismiss,
  } = useNetworkStatus({ checkUrls, restoredMs: RESTORED_MS });

  const open = status !== "online";
  const [mounted, setMounted] = useState(open);
  const [closing, setClosing] = useState(false);

  // Remember the last visible variant so the card keeps its content while closing
  const variantRef = useRef(status);
  if (open) variantRef.current = status;
  const variant = variantRef.current === "restored" ? "restored" : "offline";

  const primaryRef = useRef(null);

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

  // Focus, scroll lock, keyboard
  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (e) => {
      if (e.key === "Tab") {
        e.preventDefault();
        primaryRef.current?.focus();
      }
      if (e.key === "Escape" && status === "restored") {
        dismiss();
      }
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    primaryRef.current?.focus();

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, status, dismiss]);

  if (!mounted) return null;

  const isOffline = variant === "offline";
  const { panel, color, ink } = THEME[variant];

  return (
    <>
      <style>{css}</style>

      <div
        className={`nsm-backdrop fixed inset-0 z-[10000] flex items-center justify-center p-4 ${
          closing ? "is-closing" : ""
        }`}
        style={{
          backgroundColor: "rgba(15, 29, 23, 0.58)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="nsm-title"
        aria-describedby="nsm-desc"
      >
        {/* key => the card re-animates when it switches offline -> restored */}
        <div
          key={variant}
          className={`nsm-card w-full overflow-hidden bg-white ${
            isOffline ? "max-w-[340px] rounded-[20px]" : "max-w-[400px] rounded-[28px]"
          } ${closing ? "is-closing" : ""}`}
          style={{
            "--nsm-color": color,
            boxShadow:
              "0 40px 90px -24px rgba(15,29,23,.55), 0 0 0 1px rgba(15,29,23,.06)",
          }}
        >
          {/* ---------- Icon panel ---------- */}
          <div
            className={`flex items-center justify-center overflow-hidden px-6 ${
              isOffline ? "py-5" : "py-9"
            }`}
            style={{ backgroundColor: panel }}
          >
            <div className={`relative ${isOffline ? "h-[80px] w-[80px]" : "h-[112px] w-[112px]"}`}>
              <span className="nsm-ring" style={{ animationDelay: "0s" }} />
              <span
                className={`nsm-ring ${isOffline ? "" : "is-once"}`}
                style={{ animationDelay: isOffline ? "1.2s" : ".25s" }}
              />

              <div
                className="relative flex h-full w-full items-center justify-center rounded-full bg-white"
                style={{ boxShadow: "0 14px 30px -12px rgba(15,29,23,.32)" }}
              >
                <WifiIcon variant={variant} ink={ink} size={isOffline ? 38 : 54} />
              </div>

              {!isOffline && (
                <span
                  className="nsm-badge absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: color,
                    boxShadow: "0 0 0 4px #FFFFFF",
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path className="nsm-check" d="M5 12.5l4.2 4.2L19 7" />
                  </svg>
                </span>
              )}
            </div>
          </div>

          {/* ---------- Content ---------- */}
          <div className={`${isOffline ? "px-5 pb-5 pt-4" : "px-7 pb-7 pt-6"}`}>
            <h2
              id="nsm-title"
              className={`text-center font-semibold leading-tight ${
                isOffline ? "text-[18px]" : "text-[22px]"
              }`}
              style={{ color: "#0F1D17", letterSpacing: "-0.01em" }}
            >
              {isOffline ? "Internet connection lost" : "You're back online"}
            </h2>

            <p
              id="nsm-desc"
              className={`mx-auto mt-1.5 max-w-[340px] text-center leading-relaxed ${
                isOffline ? "text-[12.5px]" : "text-sm"
              }`}
              style={{ color: "#5B6B63" }}
            >
              {isOffline
                ? "We can't reach the server right now. We'll reconnect automatically as soon as your connection returns."
                : `Your connection has been restored after ${fmtWords(
                    lastOfflineSeconds
                  )}. You can carry on right where you left off.`}
            </p>

            {isOffline ? (
              <>
                {/* What to do */}
                <ul
                  className="nsm-rise mt-3.5 space-y-2 rounded-xl p-3.5"
                  style={{ backgroundColor: "#F6F8F6", animationDelay: ".15s" }}
                >
                  {TIPS.map((tip) => (
                    <li
                      key={tip}
                      className="flex items-start gap-2.5 text-[12px] leading-snug"
                      style={{ color: "#33443B" }}
                    >
                      <span
                        className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      {tip}
                    </li>
                  ))}
                </ul>

                {/* Live status */}
                <div
                  className="mt-3.5 flex items-center justify-between border-t pt-3 text-[12px]"
                  style={{ borderColor: "rgba(15,29,23,.08)", color: "#5B6B63" }}
                >
                  <span className="flex items-center gap-2">
                    <span className="flex items-center gap-1" aria-hidden="true">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="nsm-dot block h-1.5 w-1.5 rounded-full"
                          style={{
                            backgroundColor: color,
                            animationDelay: `${i * 0.15}s`,
                          }}
                        />
                      ))}
                    </span>
                    Reconnecting automatically
                  </span>
                  <span
                    className="font-medium tabular-nums"
                    style={{ color: "#0F1D17" }}
                    aria-label={`Offline for ${fmtWords(offlineSeconds)}`}
                  >
                    {fmtClock(offlineSeconds)}
                  </span>
                </div>

                <button
                  ref={primaryRef}
                  type="button"
                  onClick={retry}
                  disabled={checking}
                  className="nsm-btn mt-4 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[13px] font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                  style={{
                    backgroundColor: "#0F1D17",
                    boxShadow: "0 10px 22px -10px rgba(15,29,23,.7)",
                    opacity: checking ? 0.85 : 1,
                    cursor: checking ? "default" : "pointer",
                  }}
                >
                  {checking && (
                    <span
                      className="nsm-spinner block h-3.5 w-3.5 rounded-full border-2"
                      style={{
                        borderColor: "rgba(255,255,255,.3)",
                        borderTopColor: "#FFFFFF",
                      }}
                    />
                  )}
                  {checking ? "Checking connection" : "Retry now"}
                </button>

                {retryFailed && !checking && (
                  <p
                    className="nsm-rise mt-2 text-center text-[12px] font-medium"
                    style={{ color: ink }}
                    role="status"
                  >
                    Still no internet connection. We'll keep trying.
                  </p>
                )}
              </>
            ) : (
              <>
                {/* Auto-close timer */}
                <div
                  className="mt-6 h-1.5 w-full overflow-hidden rounded-full"
                  style={{ backgroundColor: "#E4F1EA" }}
                  aria-hidden="true"
                >
                  <div
                    className="nsm-drain h-full rounded-full"
                    style={{ backgroundColor: color }}
                  />
                </div>

                <button
                  ref={primaryRef}
                  type="button"
                  onClick={dismiss}
                  className="nsm-btn mt-6 w-full rounded-xl px-4 py-3 text-sm font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
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
                  Continue
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default NetworkStatusModal;