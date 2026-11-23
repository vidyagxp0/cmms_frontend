import React from "react";
import { Modal } from "antd";
import { AlertTriangle, Save, LogOut, ArrowLeft, Loader2 } from "lucide-react";

/**
 * UnsavedChangesModal
 * Premium confirmation dialog shown when the user tries to leave with unsaved work.
 *
 * Props (unchanged API + optional extras):
 *  - open, isSaving, onStay, onLeaveWithoutSaving, onSaveAndLeave
 *  - title?        custom heading
 *  - description?  custom body text
 */
const UnsavedChangesModal = ({
  open,
  isSaving = false,
  onStay,
  onLeaveWithoutSaving,
  onSaveAndLeave,
  title = "Unsaved changes",
  description = "You've made changes that haven't been saved yet. Save them now to keep your progress, or leave and discard everything entered on this page.",
}) => {
  return (
    <>
      <style>{`
        @keyframes ucm-pop {
          0%   { opacity: 0; transform: translateY(12px) scale(.96); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes ucm-fade-up {
          0%   { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes ucm-ring {
          0%   { transform: scale(1);   opacity: .55; }
          100% { transform: scale(1.75); opacity: 0; }
        }
        @keyframes ucm-shimmer {
          0%   { transform: translateX(-120%); }
          100% { transform: translateX(220%); }
        }
        .ucm-pop     { animation: ucm-pop .42s cubic-bezier(.16,1,.3,1) both; }
        .ucm-fade-up { animation: ucm-fade-up .5s cubic-bezier(.16,1,.3,1) both; }
        .ucm-ring    { animation: ucm-ring 2.2s cubic-bezier(.4,0,.2,1) infinite; }
        .ucm-ring-2  { animation-delay: 1.1s; }
        .ucm-shine::after {
          content: "";
          position: absolute; inset: 0;
          width: 40%;
          background: linear-gradient(110deg, transparent, rgba(255,255,255,.35), transparent);
          transform: translateX(-120%);
        }
        .ucm-shine:hover::after { animation: ucm-shimmer .9s ease; }
        @media (prefers-reduced-motion: reduce) {
          .ucm-pop, .ucm-fade-up, .ucm-ring, .ucm-shine:hover::after { animation: none !important; }
        }
      `}</style>

      <Modal
        open={open}
        closable={false}
        maskClosable={false}
        keyboard={!isSaving}          // Esc = safest action (stay)
        onCancel={isSaving ? undefined : onStay}
        footer={null}
        centered
        width={440}
        styles={{
          content: {
            padding: 0,
            borderRadius: 20,
            overflow: "hidden",
            boxShadow:
              "0 24px 64px -12px rgba(15,23,42,.28), 0 0 0 1px rgba(15,23,42,.06)",
          },
          mask: {
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            background: "rgba(15,23,42,.45)",
          },
        }}
      >
        <div
          className="ucm-pop relative"
          role="alertdialog"
          aria-labelledby="ucm-title"
          aria-describedby="ucm-desc"
        >
          {/* Accent bar + soft glow */}
          <div className="h-1 w-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500" />
          <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-72 -translate-x-1/2 rounded-full bg-amber-200/40 blur-3xl" />

          <div className="relative px-7 pb-6 pt-8">
            {/* Icon with pulse rings */}
            <div className="ucm-fade-up mx-auto mb-5 flex h-16 w-16 items-center justify-center">
              <span className="ucm-ring absolute h-16 w-16 rounded-full bg-amber-300/50" />
              <span className="ucm-ring ucm-ring-2 absolute h-16 w-16 rounded-full bg-amber-300/50" />
              <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-50 to-amber-100 ring-1 ring-amber-200 shadow-[0_8px_24px_-6px_rgba(245,158,11,.45)]">
                <AlertTriangle size={28} strokeWidth={2.2} className="text-amber-600" />
              </span>
            </div>

            {/* Copy */}
            <div className="ucm-fade-up text-center" style={{ animationDelay: "60ms" }}>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-amber-700 ring-1 ring-amber-200/70">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                Action required
              </span>
              <h2
                id="ucm-title"
                className="mt-3 text-xl font-semibold tracking-tight text-slate-900"
              >
                {title}
              </h2>
              <p
                id="ucm-desc"
                className="mx-auto mt-2 max-w-[340px] text-sm leading-relaxed text-slate-500"
              >
                {description}
              </p>
            </div>

            {/* Actions */}
            <div
              className="ucm-fade-up mt-7 flex flex-col gap-2.5"
              style={{ animationDelay: "120ms" }}
            >
              {/* Primary */}
              <button
                type="button"
                autoFocus
                onClick={onSaveAndLeave}
                disabled={isSaving}
                className="ucm-shine group relative flex h-11 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-b from-indigo-500 to-indigo-600 text-sm font-semibold text-white shadow-[0_8px_20px_-6px_rgba(79,70,229,.6),inset_0_1px_0_rgba(255,255,255,.2)] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_12px_28px_-8px_rgba(79,70,229,.7),inset_0_1px_0_rgba(255,255,255,.2)] active:translate-y-0 active:scale-[.99] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200 disabled:cursor-wait disabled:opacity-90"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving your changes…
                  </>
                ) : (
                  <>
                    <Save size={16} className="transition-transform duration-200 group-hover:scale-110" />
                    Save & Exit
                  </>
                )}
              </button>

              {/* Secondary row */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={onStay}
                  disabled={isSaving}
                  className="group flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 active:scale-[.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ArrowLeft size={16} className="transition-transform duration-200 group-hover:-translate-x-0.5" />
                  Keep Editing
                </button>

                <button
                  type="button"
                  onClick={onLeaveWithoutSaving}
                  disabled={isSaving}
                  className="group flex h-11 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50/60 text-sm font-medium text-rose-600 transition-all duration-200 hover:border-rose-300 hover:bg-rose-100/70 active:scale-[.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <LogOut size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                  Discard & Leave
                </button>
              </div>
            </div>
          </div>

          {/* Footer hint */}
          <div className="border-t border-slate-100 bg-slate-50/70 px-7 py-3 text-center text-xs text-slate-400">
            Discarded changes can't be recovered · Press{" "}
            <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 font-sans text-[10px] font-medium text-slate-500 shadow-sm">
              Esc
            </kbd>{" "}
            to keep editing
          </div>
        </div>
      </Modal>
    </>
  );
};

export default UnsavedChangesModal;