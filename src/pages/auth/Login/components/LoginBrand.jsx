import React from "react";
import { motion } from "framer-motion";

const LoginBrand = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.6,
        delay: 0.1,
      }}
      className="mb-4 flex flex-col items-center text-center"
    >
      {/* VidyaGxp Actual Logo */}
      <img
        src="/vidyagxp_logo.png"
        alt="VidyaGxp"
        className="h-14 w-auto object-contain"
      />

      {/* CMMS */}
      <h1
        className="mt-4 text-[22px] font-bold tracking-tight text-[#0B2A4A]"
        style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        CMMS
      </h1>

      {/* Full Form */}
      <p className="mt-0.5 text-[13px] font-medium text-slate-500">
        Computerized Maintenance Management System
      </p>

      {/* Description */}
      <p className="mt-2 max-w-[330px] text-[12px] leading-5 text-slate-400">
        Smart maintenance. Reliable equipment. Compliant operations.
      </p>
    </motion.div>
  );
};

export default LoginBrand;