import React from "react";

const LoginBrand = () => {
  return (
    <div
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

    </div>
  );
};

export default LoginBrand;