import React from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Wrench,
  Gauge,
  ShieldCheck,
  Cog,
} from "lucide-react";

const FloatingBubble = ({
  size = "h-2 w-2",
  position = "",
  duration = 6,
  delay = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{
        opacity: [0.15, 0.5, 0.15],
        y: [0, -18, 0],
        x: [0, 6, 0],
        scale: [1, 1.15, 1],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={`absolute ${position} ${size} rounded-full bg-cyan-300 shadow-[0_0_14px_rgba(103,232,249,0.45)]`}
    />
  );
};

const FloatingInfo = ({
  icon: Icon,
  text,
  position,
  delay = 0,
}) => {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 8,
      }}
      animate={{
        opacity: [0.35, 0.65, 0.35],
        y: [0, -6, 0],
      }}
      transition={{
        duration: 5,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={`absolute ${position} z-20 flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.035] px-3 py-2 backdrop-blur-md`}
    >
      <Icon className="h-3.5 w-3.5 text-cyan-300/70" />

      <span className="text-[10px] font-medium text-white/35">
        {text}
      </span>
    </motion.div>
  );
};

const EquipmentScene = () => {
  return (
    <div className="relative hidden h-screen w-1/2 overflow-hidden lg:block">
      {/* Background */}
      <div className="absolute inset-0 bg-[#061b2e]" />

      <div className="absolute inset-0 bg-gradient-to-br from-[#082a47] via-[#071f36] to-[#041321]" />

      <motion.div
        animate={{
          x: [0, 40, 0],
          y: [0, 30, 0],
          scale: [1, 1.15, 1],
          opacity: [0.16, 0.26, 0.16],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -left-[180px] -top-[180px] h-[520px] w-[520px] rounded-full bg-cyan-400/20 blur-[100px]"
      />

      <motion.div
        animate={{
          x: [0, -40, 0],
          y: [0, -30, 0],
          scale: [1, 1.12, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -bottom-[180px] -right-[150px] h-[500px] w-[500px] rounded-full bg-blue-500/20 blur-[110px]"
      />

      <div
        className="absolute inset-0 opacity-[0.045]"
        style={{
          backgroundImage: `
                linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
              `,
          backgroundSize: "55px 55px",
        }}
      />

      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: 45,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute left-1/2 top-[53%] h-[570px] w-[570px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/[0.06]"
      />

      <motion.div
        animate={{ rotate: -360 }}
        transition={{
          duration: 35,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute left-1/2 top-[53%] h-[430px] w-[430px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-300/[0.08]"
      />

      <motion.div
        animate={{
          rotate: 360,
          scale: [1, 1.03, 1],
        }}
        transition={{
          rotate: {
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          },
          scale: {
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          },
        }}
        className="absolute left-1/2 top-[53%] h-[310px] w-[310px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/[0.1]"
      />

      <FloatingBubble
        size="h-3 w-3"
        position="left-[18%] top-[22%]"
        duration={5}
        delay={0}
      />

      <FloatingBubble
        size="h-2 w-2"
        position="left-[28%] top-[72%]"
        duration={6}
        delay={1}
      />

      <FloatingBubble
        size="h-4 w-4"
        position="right-[20%] top-[24%]"
        duration={7}
        delay={0.5}
      />

      <FloatingBubble
        size="h-2.5 w-2.5"
        position="right-[13%] top-[65%]"
        duration={5.5}
        delay={1.5}
      />

      <FloatingBubble
        size="h-5 w-5"
        position="left-[13%] bottom-[18%]"
        duration={8}
        delay={0.8}
      />

      <FloatingBubble
        size="h-2 w-2"
        position="right-[32%] bottom-[15%]"
        duration={5}
        delay={2}
      />

      <FloatingBubble
        size="h-3 w-3"
        position="left-[40%] top-[12%]"
        duration={6}
        delay={1.2}
      />

      <FloatingBubble
        size="h-2 w-2"
        position="right-[8%] top-[42%]"
        duration={7}
        delay={0.4}
      />

      <div className="absolute left-[18%] top-[35%] h-px w-[120px] rotate-[25deg] bg-gradient-to-r from-transparent via-cyan-300/20 to-transparent" />

      <div className="absolute right-[15%] top-[38%] h-px w-[130px] rotate-[-25deg] bg-gradient-to-r from-transparent via-blue-300/20 to-transparent" />

      <div className="absolute bottom-[27%] left-[20%] h-px w-[150px] rotate-[-18deg] bg-gradient-to-r from-transparent via-cyan-300/15 to-transparent" />

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
        <motion.div
          whileHover={{
            scale: 1.08,
            rotate: 5,
          }}
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/20 bg-white/[0.07] shadow-[0_0_30px_rgba(34,211,238,0.08)] backdrop-blur-xl"
        >
          <Wrench className="h-5 w-5 text-cyan-300" />
        </motion.div>

        <div>
          <h1
            className="text-xl font-extrabold tracking-tight text-white"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            Maintenix
          </h1>

          <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-white/35">
            Maintenance Intelligence
          </p>
        </div>
      </motion.div>

      <div className="absolute left-1/2 top-[51%] z-20 w-full -translate-x-1/2 -translate-y-1/2 px-8 text-center">
        {/* Small badge */}

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
            delay: 0.2,
          }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-300/10 bg-cyan-300/[0.06] px-4 py-2 backdrop-blur-md"
        >
          <Activity className="h-3.5 w-3.5 text-cyan-300" />

          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-cyan-200/70">
            Intelligent Maintenance
          </span>
        </motion.div>

        {/* Heading */}

        <motion.h2
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.8,
            delay: 0.3,
          }}
          className="relative z-30 text-[34px] font-extrabold leading-tight tracking-[-1.2px] text-white xl:text-[40px]"
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          Smarter maintenance.
          <br />
          <span className="bg-gradient-to-r from-cyan-300 via-sky-300 to-blue-400 bg-clip-text text-transparent">
            Better operations.
          </span>
        </motion.h2>

        {/* Description */}

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
            delay: 0.45,
          }}
          className="mx-auto mt-4 max-w-[440px] text-[13px] leading-6 text-white/40"
        >
          A centralized workspace for managing equipment, preventive
          maintenance, calibration and compliance.
        </motion.p>

        <div className="relative mx-auto mt-8 h-[180px] w-[180px]">
          {/* Glow */}

          <motion.div
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.15, 0.28, 0.15],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute left-1/2 top-1/2 h-[210px] w-[210px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/10 blur-[50px]"
          />

          {/* Main circle */}

          <motion.div
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute left-1/2 top-1/2 flex h-[145px] w-[145px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-cyan-300/20 bg-[#0a2b46]/75 shadow-[0_0_80px_rgba(34,211,238,0.1)] backdrop-blur-xl"
          >
            {/* Inner ring */}

            <div className="absolute inset-3 rounded-full border border-white/[0.05]" />

            {/* Rotating gear */}

            <motion.div
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 18,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute"
            >
              <Cog className="h-[82px] w-[82px] text-cyan-300/[0.1]" />
            </motion.div>

            {/* Main icon */}

            <div className="relative flex h-[64px] w-[64px] items-center justify-center rounded-[20px] bg-gradient-to-br from-cyan-300/20 to-blue-400/10 shadow-[0_0_35px_rgba(34,211,238,0.12)]">
              <Wrench className="h-7 w-7 text-cyan-300" />
            </div>
          </motion.div>

          {/* Orbit dot */}

          <motion.div
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute inset-[-20px]"
          >
            <div className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-cyan-300 shadow-[0_0_15px_rgba(103,232,249,0.8)]" />
          </motion.div>

          {/* Second orbit */}

          <motion.div
            animate={{
              rotate: -360,
            }}
            transition={{
              duration: 11,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute inset-[-38px]"
          >
            <div className="absolute bottom-0 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-blue-300 shadow-[0_0_15px_rgba(147,197,253,0.8)]" />
          </motion.div>
        </div>
      </div>

      <FloatingInfo
        icon={Activity}
        text="Equipment"
        position="left-[11%] top-[47%]"
        delay={0.4}
      />

      <FloatingInfo
        icon={Gauge}
        text="Maintenance"
        position="right-[10%] top-[48%]"
        delay={0.8}
      />

      <FloatingInfo
        icon={ShieldCheck}
        text="Compliance"
        position="left-[18%] bottom-[21%]"
        delay={1.1}
      />

      <motion.div
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        transition={{
          delay: 1,
        }}
        className="absolute bottom-8 left-10 z-30 flex items-center gap-2 text-[10px] font-medium text-white/30"
      >
        <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(74,222,128,0.7)]" />
        System operational
      </motion.div>

      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#041321]/70 to-transparent" />
    </div>
  );
};

export default EquipmentScene;
