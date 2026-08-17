import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Activity, Gauge, CheckCircle2, ShieldCheck } from "lucide-react";

import EquipmentScene from "./components/EquipmentScene";
import GlassCard from "./components/GlassCard";
import LoginBrand from "./components/LoginBrand";
import LoginForm from "./components/LoginForm";
import { login } from "../../../services/authApi";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

/* =========================================================
   GOOGLE FONTS
========================================================= */

const FONT_LINKS = [
  "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap",
];

function useGoogleFonts() {
  useEffect(() => {
    FONT_LINKS.forEach((href) => {
      if (![...document.styleSheets].some((sheet) => sheet.href === href)) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = href;
        document.head.appendChild(link);
      }
    });
  }, []);
}

/* =========================================================
   LOGIN
========================================================= */

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [focusField, setFocusField] = useState(null);
  const [loading, setLoading] = useState(false);

  useGoogleFonts();
  const navigate = useNavigate();

const handleLogin = async (event) => {
  event.preventDefault();

  const formData = new FormData(event.currentTarget);

  const payload = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  setLoading(true);

  try {
    const response = await login(payload);
    const { user, token } = response.data.data;

    localStorage.setItem("access_token", token);

    toast.success("Login successful");

    const roles = user?.roles || [];

    if (roles.includes("admin")) {
      navigate("/admin/dashboard");
    } else {
      navigate("/user/dashboard");
    }
  } catch (error) {
    toast.error(
      error.response?.data?.message || "Login failed. Please try again."
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <div
      className="flex min-h-screen w-full bg-white"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* =================================================
          LEFT SIDE
      ================================================= */}

      <div className="relative hidden w-[58%] overflow-hidden lg:block">
        {/* Background */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(160deg, #0B2A4A 0%, #0F3A63 45%, #0A2540 100%)",
          }}
        />

        {/* Pharmaceutical Equipment */}
        <EquipmentScene />

        {/* Main heading */}
        <div className="relative z-10 px-12 pt-12">
          <div
            className="max-w-lg text-[28px] font-bold leading-tight text-white"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Smart maintenance for pharmaceutical operations.
          </div>

          <div
            className="mt-3 max-w-lg text-[14px] leading-6 text-white/55"
          >
            A centralized system for managing equipment, maintenance,
            calibration, work orders and compliance.
          </div>
        </div>

        {/* =================================================
            FLOATING CARDS
        ================================================= */}

        <GlassCard
          icon={Activity}
          label="Equipment health"
          value="98%"
          tone="teal"
          className="right-[8%] top-[24%]"
          delay={0.65}
          floatDelay={0.6}
        />

        <GlassCard
          icon={Gauge}
          label="Preventive maintenance"
          value="92%"
          tone="sky"
          className="left-[10%] top-[58%]"
          delay={0.8}
          floatDelay={1.2}
        />

        <GlassCard
          icon={CheckCircle2}
          label="Next calibration"
          value="24 Aug 2026"
          tone="green"
          className="right-[6%] bottom-[16%]"
          delay={0.95}
          floatDelay={0.3}
        />

        <GlassCard
          icon={ShieldCheck}
          label="Compliance"
          value="100%"
          tone="teal"
          className="left-[24%] bottom-[8%]"
          delay={1.1}
          floatDelay={0.9}
        />

        {/* Bottom fade */}
        <div
          className="
            absolute inset-x-0 bottom-0 h-40
            bg-gradient-to-t from-[#0A2540] to-transparent
          "
        />
      </div>

      {/* =================================================
          RIGHT SIDE
      ================================================= */}

      <div
        className="
          flex w-full flex-col items-center justify-center
          bg-white px-6 py-12 lg:w-[42%]
        "
      >
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.7,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="w-full max-w-[380px]"
        >
          {/* =================================================
              BRAND
          ================================================= */}

          <LoginBrand />

          {/* =================================================
              LOGIN FORM
          ================================================= */}

          <LoginForm
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            remember={remember}
            setRemember={setRemember}
            focusField={focusField}
            setFocusField={setFocusField}
            handleLogin={handleLogin}
            loading={loading}
          />

        </motion.div>
      </div>
    </div>
  );
};

export default Login;