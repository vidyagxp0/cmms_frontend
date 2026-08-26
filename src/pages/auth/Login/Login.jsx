import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Eye,
  EyeOff,
  Mail,
  LockKeyhole,
  ArrowRight,
  ShieldCheck,
  Wrench,
  Gauge,
  Cog,
  Zap,
} from "lucide-react";

import { login } from "../../../services/authApi";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

/* =========================================================
   GOOGLE FONTS
========================================================= */
import EquipmentScene from "./components/EquipmentScene";
import { useAuthStore } from "../../../store/authStore";

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

const Login = () => {
  const [loginErrors,setLoginErrors]=useState(true)
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [focusField, setFocusField] = useState(null);
  const [loading, setLoading] = useState(false);
  const setUser = useAuthStore((state) => state.setUser);

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

    const { user: apiUser, token } = response.data.data;

    const user = {
        id: apiUser.id,
        name: apiUser.name,
        email: apiUser.email,
        roleType: apiUser.role_type,
        roles: apiUser.roles || [],
        permissions: apiUser.permissions || [],
    };

    const isAdmin = apiUser.role_type === "Admin";

    if (isAdmin) {
        sessionStorage.setItem("admin_token", token);
        sessionStorage.removeItem("user_token");
         setLoginErrors(false)
    } else {
        sessionStorage.setItem("user_token", token);
        sessionStorage.removeItem("admin_token");
    }

    sessionStorage.setItem("auth_type", apiUser.role_type);

    setUser(user);

    toast.success("Login successful");
  
   
 
       navigate(
        isAdmin
            ? "/admin/dashboard"
            : "/user/equipment-dashboard",
        { replace: true }
    );
    
     
} catch (error) {
    setLoginErrors(true) 
    toast.error(
        error.response?.data?.message ||
        "Login failed. Please try again."
    );
} finally {
    setLoading(false);
}
};

  return (
    <div
      className="h-screen w-full overflow-hidden bg-[#f8fafc]"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      <div className="flex h-screen w-full">
        <EquipmentScene/>

        {/* =====================================================
            RIGHT SIDE - EXACT 50%
        ===================================================== */}

        <div className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-white px-6 lg:w-1/2">
          {/* Mobile glow */}

          <div className="pointer-events-none absolute -right-40 -top-40 h-[400px] w-[400px] rounded-full bg-cyan-100/60 blur-[100px] lg:hidden" />

          <div className="pointer-events-none absolute -bottom-40 -left-40 h-[350px] w-[350px] rounded-full bg-blue-50 blur-[100px] lg:hidden" />

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="relative z-10 w-full max-w-[400px]"
          >
            {/* =================================================
                MOBILE BRAND
            ================================================= */}

            <div className="mb-9 flex items-center gap-3 lg:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#082943] shadow-lg">
                <Wrench className="h-5 w-5 text-cyan-300" />
              </div>

              <div>
                <h1
                  className="text-xl font-extrabold tracking-tight text-[#082943]"
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  Maintenix
                </h1>

                <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-gray-400">
                  Maintenance Intelligence
                </p>
              </div>
            </div>

            {/* =================================================
                LOGIN HEADER
            ================================================= */}

            <div className="mb-8 flex flex-col items-center text-center">
              {/* Logo */}
              <div className="mb-2 flex w-full items-center justify-center">
                <img
                  src="/vidyagxp_logo.png"
                  alt="VidyaGxP Logo"
                  className="block h-auto w-[175px] object-contain"
                  draggable="false"
                />
              </div>

              {/* Heading */}
              <h2
                className="text-[30px] font-extrabold leading-tight tracking-[-1px] text-[#091f33]"
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                Welcome back
              </h2>

              {/* Description */}
              <p className="mt-2.5 max-w-[360px] text-[13px] leading-5 text-gray-500">
                Sign in to access your maintenance workspace.
              </p>

            </div>

            {/* =================================================
                LOGIN FORM
            ================================================= */}

            <form onSubmit={handleLogin} className="space-y-4">
              {/* EMAIL */}

              <div>
                <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.08em] text-gray-600">
                  Email address
                </label>

                <div
                  className={`group flex h-[54px] items-center rounded-2xl border bg-[#f8fafc] transition-all duration-300 ${
                    focusField === "email"
                      ? "border-cyan-400 bg-white shadow-[0_0_0_4px_rgba(34,211,238,0.08)]"
                      : "border-gray-200 hover:border-gray-300 hover:bg-white"
                  }`}
                >
                  <Mail
                    className={`ml-4 h-[18px] w-[18px] transition-colors duration-300 ${
                      focusField === "email" ? "text-cyan-500" : "text-gray-400"
                    }`}
                  />

                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="Enter your email"
                    onFocus={() => setFocusField("email")}
                    onBlur={() => setFocusField(null)}
                    className="h-full w-full bg-transparent px-3 text-[14px] font-medium text-gray-800 outline-none placeholder:text-gray-400"
                  />
                </div>
              </div>
              {/* PASSWORD */}

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-[0.08em] text-gray-600">
                    Password
                  </label>

                  <button
                    type="button"
                    className="text-[11px] font-semibold text-cyan-600 transition-colors hover:text-cyan-700"
                  >
                    Forgot password?
                  </button>
                </div>
            


                <div
                  className={`group flex h-[54px] items-center rounded-2xl border bg-[#f8fafc] transition-all duration-300 ${
                    focusField === "password"
                      ? "border-cyan-400 bg-white shadow-[0_0_0_4px_rgba(34,211,238,0.08)]"
                      : "border-gray-200 hover:border-gray-300 hover:bg-white"
                  }`}
                >
                  <LockKeyhole
                    className={`ml-4 h-[18px] w-[18px] transition-colors duration-300 ${
                      focusField === "password"
                        ? "text-cyan-500"
                        : "text-gray-400"
                    }`}
                  />

                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    placeholder="Enter your password"
                    onFocus={() => setFocusField("password")}
                    onBlur={() => setFocusField(null)}
                    className="h-full w-full bg-transparent px-3 text-[14px] font-medium text-gray-800 outline-none placeholder:text-gray-400"
                  />

                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowPassword(!showPassword)}
                    className="mr-3 rounded-xl p-2 text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <EyeOff className="h-[18px] w-[18px]" />
                    ) : (
                      <Eye className="h-[18px] w-[18px]" />
                    )}
                  </motion.button>
                </div>
              </div>
                 {loginErrors && (
    <p className="mt-1.5 text-[11px] font-medium text-red-500">
        User or Password Incorrect
    </p>
)}
              {/* OPTIONS */}

              <div className="flex items-center justify-between pt-1">
                <label className="group flex cursor-pointer items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="sr-only"
                  />

                  <motion.span
                    animate={{
                      scale: remember ? 1 : 0.96,
                    }}
                    className={`flex h-[18px] w-[18px] items-center justify-center rounded-md border transition-all duration-200 ${
                      remember
                        ? "border-cyan-500 bg-cyan-500"
                        : "border-gray-300 bg-white group-hover:border-gray-400"
                    }`}
                  >
                    {remember && (
                      <svg
                        viewBox="0 0 20 20"
                        fill="none"
                        className="h-3.5 w-3.5 text-white"
                      >
                        <path
                          d="M5 10.5L8.5 14L15.5 6.5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </motion.span>

                  <span className="text-[12px] font-medium text-gray-500">
                    Remember me
                  </span>
                </label>

                <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-400">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  Secure login
                </div>
              </div>

              {/* LOGIN BUTTON */}

              <motion.button
                whileHover={
                  !loading
                    ? {
                        scale: 1.01,
                        y: -1,
                      }
                    : {}
                }
                whileTap={
                  !loading
                    ? {
                        scale: 0.98,
                      }
                    : {}
                }
                disabled={loading}
                type="submit"
                className="group relative mt-2 flex h-[56px] w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-r from-[#082943] via-[#0b3858] to-[#0b4969] text-[14px] font-bold text-white shadow-lg shadow-[#082943]/20 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-900/20 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {/* Shine */}

                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.12] to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                {loading ? (
                  <div className="relative flex items-center gap-3">
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                    <span>Log in...</span>
                  </div>
                ) : (
                  <div className="relative flex items-center gap-2">
                    <span>Log In </span>

                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                )}
              </motion.button>
            </form>

            {/* =================================================
                FOOTER
            ================================================= */}

            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              transition={{
                delay: 0.8,
              }}
              className="mt-7"
            >
              <div className="h-px w-full bg-gray-100" />

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold text-gray-500">
                      Protected
                    </p>

                    <p className="text-[9px] text-gray-400">
                      Secure authentication
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-50">
                    <Zap className="h-4 w-4 text-cyan-500" />
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold text-gray-500">
                      Maintenix
                    </p>

                    <p className="text-[9px] text-gray-400">
                      Maintenance platform
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};  
export default Login;
