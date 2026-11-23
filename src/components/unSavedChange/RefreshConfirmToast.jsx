import React from "react";
import { AlertTriangle, RotateCw, X } from "lucide-react";

const RefreshConfirmToast = ({ open, onConfirm, onCancel }) => {
  return (
    <>
      <style>{`
        @keyframes rct-slide-down {
          0%   { opacity: 0; transform: translate(-50%, -120%); }
          60%  { opacity: 1; transform: translate(-50%, 4%); }
          100% { opacity: 1; transform: translate(-50%, 0); }
        }
        @keyframes rct-slide-up {
          0%   { opacity: 1; transform: translate(-50%, 0); }
          100% { opacity: 0; transform: translate(-50%, -120%); }
        }
        .rct-container {
          animation: rct-slide-down .42s cubic-bezier(.16,1,.3,1) both;
        }
        .rct-container.rct-leaving {
          animation: rct-slide-up .28s cubic-bezier(.4,0,1,1) both;
        }
        @media (prefers-reduced-motion: reduce) {
          .rct-container, .rct-container.rct-leaving { animation: none !important; }
        }
      `}</style>
      {open && (
        <div
          className="rct-container fixed left-1/2 top-4 z-[9999] w-[min(92vw,380px)] -translate-x-1/2"
          role="alertdialog"
          aria-labelledby="rct-title"
          aria-describedby="rct-desc"
        >
          <div className="overflow-hidden rounded-xl border border-amber-200/80 bg-white shadow-[0_18px_40px_-10px_rgba(15,23,42,0.28),0_0_0_1px_rgba(15,23,42,0.04)]">
            <div className="h-1 w-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500" />
            <div className="flex items-start gap-3 px-4 py-3.5">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-50 ring-1 ring-amber-200">
                <AlertTriangle size={16} strokeWidth={2.2} className="text-amber-600" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 id="rct-title" className="text-[13px] font-semibold text-slate-800">
                  Unsaved changes
                </h3>
                <p id="rct-desc" className="mt-0.5 text-[12px] leading-relaxed text-slate-500">
                  Refreshing now will discard everything you've entered. Continue?
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/70 px-4 py-2.5">
              <button
                type="button"
                onClick={onCancel}
                className="flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-[12px] font-medium text-slate-700 transition hover:bg-slate-50 active:scale-[.97]"
              >
                <X size={13} />
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="flex h-8 items-center gap-1.5 rounded-lg bg-slate-900 px-3 text-[12px] font-semibold text-white transition hover:bg-slate-800 active:scale-[.97]"
              >
                <RotateCw size={13} />
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RefreshConfirmToast;