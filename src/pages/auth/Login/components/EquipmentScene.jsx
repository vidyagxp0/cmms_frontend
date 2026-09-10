import React from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Wrench,
} from "lucide-react";

const EquipmentScene = () => {
  return (
    /*
      Outer wrapper: carries drop-shadow so the curved edge
      casts a shadow onto the right panel sitting behind it.
      clip-path is on the inner div so the shadow renders outside the clip.
    */
    <div
      className="relative hidden h-screen w-[54%] lg:block"
      style={{
        filter: "drop-shadow(12px 0px 22px rgba(0,0,0,0.42))",
      }}
    >
      {/* =====================================================
          SAME CURVE — UNCHANGED
      ===================================================== */}

      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <clipPath
            id="left-panel-clip"
            clipPathUnits="objectBoundingBox"
          >
            <path d="M 0,0 L 1,0 C 0.94,0.15 0.88,0.32 0.88,0.5 C 0.88,0.68 0.94,0.85 1,1 L 0,1 Z" />
          </clipPath>
        </defs>
      </svg>

      <div
        className="relative h-full w-full overflow-hidden bg-[#101820]"
        style={{
          clipPath: "url(#left-panel-clip)",
        }}
      >
        {/* =====================================================
            BACKGROUND IMAGE
        ===================================================== */}

        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/cmms_bg.jpg')",
            transform: "scale(1.015)",
          }}
        />

        {/* =====================================================
            NATURAL DARK PHOTO TREATMENT
        ===================================================== */}

        {/* Overall muted navy tone */}

        <div className="absolute inset-0 bg-[#142533]/58" />

        {/* Darker left side for text readability */}

        <div className="absolute inset-0 bg-gradient-to-r from-[#0b1721]/88 via-[#142633]/68 to-[#1a3443]/30" />

        {/* Slight top protection */}

        <div className="absolute inset-x-0 top-0 h-[34%] bg-gradient-to-b from-[#08131d]/65 to-transparent" />

        {/* Bottom photographic fade */}

        <div className="absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-t from-[#0b151d]/92 via-[#0d1c25]/48 to-transparent" />

        {/* =====================================================
            SUBTLE PHOTO DEPTH
        ===================================================== */}

        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-[#071117]/35" />

        {/* Very soft, non-neon light balancing */}

        <div className="absolute -left-24 -top-24 h-[420px] w-[420px] rounded-full bg-slate-300/[0.035] blur-[100px]" />

        <div className="absolute -bottom-40 left-[35%] h-[460px] w-[460px] rounded-full bg-slate-900/[0.18] blur-[110px]" />

        {/* =====================================================
            TOP BRAND AREA
        ===================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: -15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.7,
          }}
          className="absolute left-10 top-9 z-30 flex items-center gap-3"
        >
          {/* Brand mark */}

          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-[#13222c]/70 shadow-lg backdrop-blur-md">
            <Wrench className="h-5 w-5 text-[#9cc9cf]" />
          </div>

          <div>
            <h1
              className="text-xl font-extrabold tracking-tight text-white"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              CMMS
            </h1>

            <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-white/45">
              Maintenance Intelligence
            </p>
          </div>
        </motion.div>

        {/* =====================================================
            SMALL PHOTO LABEL
        ===================================================== */}

        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            duration: 0.8,
            delay: 0.2,
          }}
          className="absolute right-[13%] top-10 z-20 hidden items-center gap-2 xl:flex"
        >
          <div className="h-px w-8 bg-white/20" />

          <span className="text-[9px] font-medium uppercase tracking-[0.2em] text-white/35">
            Operations Platform
          </span>
        </motion.div>

        {/* =====================================================
            MAIN CONTENT
        ===================================================== */}

        <div className="absolute left-[13%] top-1/2 z-30 w-[68%] -translate-y-1/2">
          {/* =================================================
              GxP BADGE
          ================================================= */}

          <motion.div
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.7,
              delay: 0.15,
            }}
            className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/15 bg-[#172933]/72 px-4 py-2 shadow-md backdrop-blur-md"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-[#a9d1d5]" />

            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/70">
              GxP Compliant Environment
            </span>
          </motion.div>

          {/* =================================================
              HEADING
          ================================================= */}

          <motion.h2
            initial={{
              opacity: 0,
              x: -20,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.8,
              delay: 0.25,
            }}
            className="max-w-[620px] text-[40px] font-extrabold leading-[1.07] tracking-[-1.6px] text-white xl:text-[48px]"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            Smarter maintenance.
            <br />

            <span className="text-[#b5d5d9]">
              Better operations.
            </span>
          </motion.h2>

          {/* =================================================
              DESCRIPTION
          ================================================= */}

          <motion.p
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.7,
              delay: 0.4,
            }}
            className="mt-6 max-w-[590px] text-[16px] leading-7 text-white/65"
          >
            A centralized workspace for managing equipment, preventive
            maintenance, calibration and compliance.
          </motion.p>

          {/* =================================================
              TRUST LINE
          ================================================= */}

          <motion.div
            initial={{
              opacity: 0,
              width: 0,
            }}
            animate={{
              opacity: 1,
              width: "100%",
            }}
            transition={{
              duration: 0.8,
              delay: 0.6,
            }}
            className="mt-9"
          >
            {/* Divider */}

            <div className="mb-4 h-px max-w-[520px] bg-gradient-to-r from-white/20 via-white/10 to-transparent" />

            <div className="flex items-center gap-3">
              <div className="h-[2px] w-9 bg-[#9ebfc3]" />

              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45">
                Trusted maintenance operations
              </span>
            </div>
          </motion.div>
        </div>

        {/* =====================================================
            BOTTOM LEFT INFORMATION
        ===================================================== */}

        <div className="absolute bottom-9 left-10 z-20 flex items-center gap-3">
          <div className="h-[1px] w-7 bg-white/25" />

          <span className="text-[9px] font-medium uppercase tracking-[0.24em] text-white/30">
            Maintenance Intelligence
          </span>
        </div>

        {/* =====================================================
            VERY SUBTLE RIGHT EDGE SEPARATION
        ===================================================== */}

        <div className="absolute right-0 top-0 h-full w-16 bg-gradient-to-r from-transparent to-[#071117]/10" />

        <div className="absolute right-0 top-[18%] h-[64%] w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />
      </div>
    </div>
  );
};

export default EquipmentScene;