import { useEffect, useState } from "react";

const LOGO_SRC = "/shilpaimage.png";
const COMPANY_NAME = "Shilpa Medicare Ltd";

const MESSAGES = ["Verifying access", "Preparing your workspace"];

const AuthLoader = () => {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const id = setInterval(
            () => setIndex((i) => (i + 1) % MESSAGES.length),
            2400
        );
        return () => clearInterval(id);
    }, []);

    const letters = COMPANY_NAME.split("");

    return (
        <div
            role="status"
            aria-live="polite"
            aria-label={`Loading ${COMPANY_NAME} workspace`}
            className="al-root fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-[#FCFBF9]"
            style={{ "--al-logo": `url(${LOGO_SRC})` }}
        >
            <style>{styles}</style>

            {/* Ambient background */}
            <div className="al-orb al-orb-1" aria-hidden="true" />
            <div className="al-orb al-orb-2" aria-hidden="true" />
            <div className="al-grid absolute inset-0" aria-hidden="true" />

            <div className="al-content relative flex flex-col items-center">
                {/* Logo with halo + light sweep */}
                <div className="relative mb-7">
                    <div className="al-halo" aria-hidden="true" />
                    <div className="al-logo-wrap relative">
                        <img
                            src={LOGO_SRC}
                            alt={COMPANY_NAME}
                            className="relative h-16 w-auto object-contain"
                            draggable={false}
                        />
                        <span className="al-sheen" aria-hidden="true" />
                    </div>
                </div>

                {/* Company name: letter reveal + shimmer */}
                <div className="relative mb-2">
                    <h1 className="al-name relative whitespace-nowrap text-[17px] font-semibold uppercase tracking-[0.32em] text-[#00666B]">
                        <span className="sr-only">{COMPANY_NAME}</span>
                        <span aria-hidden="true">
                            {letters.map((ch, i) => (
                                <span
                                    key={i}
                                    className="al-letter"
                                    style={{ animationDelay: `${0.35 + i * 0.045}s` }}
                                >
                                    {ch === " " ? " " : ch}
                                </span>
                            ))}
                        </span>
                        {/* Shimmer overlay, same text */}
                        <span className="al-name-shine" aria-hidden="true">
                            {COMPANY_NAME}
                        </span>
                    </h1>
                </div>

                {/* Hairline divider */}
                <div className="al-divider mb-8 flex items-center gap-2" aria-hidden="true">
                    <span className="h-px w-10 bg-gradient-to-r from-transparent to-[#00A6AC]/60" />
                    <span className="h-1 w-1 rotate-45 bg-[#00A6AC]" />
                    <span className="h-px w-10 bg-gradient-to-l from-transparent to-[#00A6AC]/60" />
                </div>

                {/* Progress track */}
                <div className="relative h-[2px] w-44 overflow-hidden rounded-full bg-slate-200/70">
                    <div className="al-bar" />
                </div>

                {/* Rotating status */}
                <div className="relative mt-5 flex h-4 w-72 items-center justify-center">
                    <p
                        key={index}
                        className="al-msg flex items-center text-[11px] font-medium uppercase tracking-[0.24em] text-slate-500"
                    >
                        {MESSAGES[index]}
                        <span className="ml-1 inline-flex items-center">
                            <span className="al-dot" />
                            <span className="al-dot" style={{ animationDelay: "0.15s" }} />
                            <span className="al-dot" style={{ animationDelay: "0.3s" }} />
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
};

const styles = `
.al-content { animation: al-enter 0.9s cubic-bezier(0.22, 1, 0.36, 1) both; }

/* Ambient orbs */
.al-orb { position: absolute; border-radius: 9999px; filter: blur(70px); pointer-events: none; }
.al-orb-1 {
    width: 560px; height: 560px; top: -200px; left: -160px;
    background: radial-gradient(circle, rgba(0,166,172,0.20), transparent 65%);
    animation: al-drift-1 16s ease-in-out infinite alternate;
}
.al-orb-2 {
    width: 500px; height: 500px; bottom: -200px; right: -140px;
    background: radial-gradient(circle, rgba(100,116,139,0.18), transparent 65%);
    animation: al-drift-2 18s ease-in-out infinite alternate;
}

/* Fine dot texture, faded at edges */
.al-grid {
    background-image: radial-gradient(rgba(15,23,42,0.07) 1px, transparent 1px);
    background-size: 22px 22px;
    -webkit-mask-image: radial-gradient(ellipse at center, #000 20%, transparent 65%);
            mask-image: radial-gradient(ellipse at center, #000 20%, transparent 65%);
}

/* Logo */
.al-halo {
    position: absolute; inset: -32px -48px; border-radius: 9999px;
    background: radial-gradient(closest-side, rgba(0,166,172,0.14), transparent);
    animation: al-breathe 3.6s ease-in-out infinite;
}
.al-logo-wrap { animation: al-float 5s ease-in-out infinite; }

/* Light sweep clipped to the logo's own shape */
.al-sheen {
    position: absolute; inset: 0; pointer-events: none;
    background: linear-gradient(110deg, transparent 38%, rgba(255,255,255,0.85) 50%, transparent 62%);
    background-size: 260% 100%;
    -webkit-mask: var(--al-logo) center / contain no-repeat;
            mask: var(--al-logo) center / contain no-repeat;
    animation: al-sweep 3.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

/* Company name */
.al-letter {
    display: inline-block;
    opacity: 0;
    animation: al-letter-in 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.al-name-shine {
    position: absolute; inset: 0; pointer-events: none;
    color: transparent;
    background: linear-gradient(100deg, transparent 40%, #00A6AC 48%, #9BEFF1 50%, #00A6AC 52%, transparent 60%);
    background-size: 300% 100%;
    -webkit-background-clip: text; background-clip: text;
    animation: al-name-shine 4s ease-in-out 1.6s infinite;
    background-position: 150% 0;
}
.al-divider { animation: al-divider-in 0.9s cubic-bezier(0.22, 1, 0.36, 1) 1.2s both; }

/* Progress bar */
.al-bar {
    position: absolute; top: 0; bottom: 0; width: 40%; border-radius: inherit;
    background: linear-gradient(90deg, transparent, #00848A 40%, #00C2C9 60%, transparent);
    box-shadow: 0 0 14px rgba(0,166,172,0.5);
    animation: al-slide 1.8s cubic-bezier(0.65, 0, 0.35, 1) infinite;
}

/* Status text */
.al-msg { animation: al-msg-in 0.6s cubic-bezier(0.22, 1, 0.36, 1) both; }
.al-dot {
    width: 3px; height: 3px; margin-left: 3px; border-radius: 9999px;
    background: #00A6AC; animation: al-dot 1.2s ease-in-out infinite;
}

@keyframes al-enter      { from { opacity: 0; transform: translateY(8px) scale(0.98); } to { opacity: 1; transform: none; } }
@keyframes al-drift-1    { to { transform: translate(80px, 60px) scale(1.08); } }
@keyframes al-drift-2    { to { transform: translate(-70px, -50px) scale(1.05); } }
@keyframes al-breathe    { 0%,100% { opacity: 0.6; transform: scale(0.96); } 50% { opacity: 1; transform: scale(1.04); } }
@keyframes al-float      { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
@keyframes al-sweep      { 0% { background-position: 130% 0; } 60%,100% { background-position: -30% 0; } }
@keyframes al-letter-in  { from { opacity: 0; transform: translateY(10px); filter: blur(6px); } to { opacity: 1; transform: none; filter: none; } }
@keyframes al-name-shine { 0% { background-position: 150% 0; } 55%,100% { background-position: -50% 0; } }
@keyframes al-divider-in { from { opacity: 0; transform: scaleX(0.3); } to { opacity: 1; transform: none; } }
@keyframes al-slide      { 0% { transform: translateX(-110%); } 100% { transform: translateX(260%); } }
@keyframes al-msg-in     { from { opacity: 0; transform: translateY(6px); filter: blur(4px); } to { opacity: 1; transform: none; filter: none; } }
@keyframes al-dot        { 0%,100% { opacity: 0.2; transform: translateY(0); } 50% { opacity: 1; transform: translateY(-2px); } }

@media (prefers-reduced-motion: reduce) {
    .al-orb, .al-halo, .al-logo-wrap, .al-sheen, .al-dot, .al-name-shine { animation: none !important; }
    .al-letter, .al-divider { animation: none !important; opacity: 1; }
    .al-bar { animation-duration: 3.5s; }
    .al-msg { animation: none; }
}
`;

export default AuthLoader;