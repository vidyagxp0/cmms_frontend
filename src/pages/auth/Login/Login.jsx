import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  Mail,
  LockKeyhole,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

import { login } from "../../../services/authApi";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import EquipmentScene from "./components/EquipmentScene";
import { useAuthStore } from "../../../store/authStore";

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

const Login = () => {
  const [loginErrors, setLoginErrors] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [focusField, setFocusField] = useState(null);
  const [loading, setLoading] = useState(false);

  const setUser = useAuthStore((state) => state.setUser);

  useGoogleFonts();

  const navigate = useNavigate();

  /* =========================================================
     LOGIN FUNCTIONALITY
     UNCHANGED
  ========================================================= */

  const handleLogin = async (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const payload = {
      email: formData.get("email"),
      password: formData.get("password"),
    };

    setLoginErrors(false);
    setLoading(true);

    try {
      const response = await login(payload);

      // STOP HERE if backend did not authenticate
      if (response.status !== 200 || !response.data?.data?.token) {
        setLoginErrors(true);
        setLoading(false);
        return;
      }

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
      } else {
        sessionStorage.setItem("user_token", token);
        sessionStorage.removeItem("admin_token");
      }

      sessionStorage.setItem("auth_type", apiUser.role_type);

      setUser(user);

      toast.success("Login successful");

      navigate(isAdmin ? "/admin/dashboard" : "/user/engineering-dashboard", {
        replace: true,
      });
    } catch (error) {
      setLoginErrors(true);

      toast.error(
        error.response?.data?.message || "User or Password Incorrect",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden bg-[#e9e6dc]"
      style={{
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* =====================================================
          PAGE BACKGROUND GRID
      ===================================================== */}

      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.12]"
        style={{
          backgroundImage: `
            linear-gradient(
              rgba(74, 83, 86, 0.18) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(74, 83, 86, 0.18) 1px,
              transparent 1px
            )
          `,
          backgroundSize: "46px 46px",
        }}
      />

      {/* =====================================================
          SOFT PAGE DEPTH
      ===================================================== */}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/35 via-transparent to-[#d8d4c9]/45" />

      {/* =====================================================
          MAIN LAYOUT
      ===================================================== */}

      <div className="relative z-10 flex min-h-screen w-full flex-col lg:flex-row">
        {/* =====================================================
            LEFT SIDE
        ===================================================== */}

        <EquipmentScene />

        {/* =====================================================
            RIGHT SIDE - LOGIN AREA
        ===================================================== */}

        <div
          className="
            relative
            flex
            min-h-screen
            w-full
            items-center
            justify-center
            overflow-hidden
            px-4
            py-6
            sm:px-6
            sm:py-8
            lg:min-h-screen
            lg:w-[46%]
            lg:px-8
            lg:py-6
          "
        >
          {/* =================================================
              MOBILE-ONLY BACKGROUND PHOTO
              (desktop keeps the plain bg color; EquipmentScene
              carries the photo there instead)
          ================================================= */}

          <div
            className="absolute inset-0 z-0 lg:hidden"
            style={{
              backgroundImage:
                "linear-gradient(180deg, rgba(11,23,33,0.80) 0%, rgba(20,38,51,0.55) 45%, rgba(13,28,37,0.90) 100%), url('/cmms_bg.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              backgroundColor: "#142533",
            }}
          />

          {/* =================================================
              SOFT BACKGROUND SHAPES
          ================================================= */}

          <div className="pointer-events-none absolute -right-32 -top-32 h-[360px] w-[360px] rounded-full bg-white/30 blur-[110px]" />

          <div className="pointer-events-none absolute -bottom-40 -left-40 h-[360px] w-[360px] rounded-full bg-[#d5d1c5]/35 blur-[110px]" />

          {/* =================================================
              LOGIN CARD
          ================================================= */}

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
            className="
              relative
              z-20
              w-full
              max-w-[470px]
              overflow-hidden
              rounded-[28px]
              border
              border-[#d8dde0]
              bg-white/95
              shadow-[0_24px_65px_rgba(32,45,52,0.12)]
              backdrop-blur-xl
            "
          >
            {/* =================================================
                CARD TOP BRAND AREA
            ================================================= */}

            <div
              className="
                relative
                flex
                flex-wrap
                items-start
                justify-between
                gap-3
                px-5
                pb-2
                pt-5
                sm:px-7
                sm:pt-6
              "
            >
              {/* TOP LEFT - SHILPA */}

              <div className="flex min-h-[56px] items-center sm:min-h-[68px]">
                <img
                  src="/shilpaimage.png"
                  alt="Shilpa"
                  className="
                    h-auto
                    w-[78px]
                    object-contain
                    sm:w-[100px]
                    lg:w-[108px]
                  "
                  draggable="false"
                />
              </div>

              {/* TOP RIGHT - VIDYAGXP */}

              <div className="flex min-h-[56px] items-center justify-end sm:min-h-[68px]">
                <img
                  src="/vidyagxp_logo.png"
                  alt="VidyaGxP"
                  className="
                    h-auto
                    w-[108px]
                    object-contain
                    sm:w-[140px]
                    lg:w-[150px]
                  "
                  draggable="false"
                />
              </div>
            </div>

            {/* =================================================
                SUBTLE HEADER DIVIDER
            ================================================= */}

            <div className="mx-5 h-px bg-gradient-to-r from-transparent via-[#dde2e2] to-transparent sm:mx-7" />

            {/* =================================================
                LOGIN CONTENT
            ================================================= */}

            <div className="px-5 pb-6 pt-6 sm:px-7 sm:pb-7 sm:pt-6">
              {/* =================================================
                  LOGIN HEADER
              ================================================= */}

              <div className="mb-6 text-center">
                <div className="mb-3 inline-flex items-center rounded-full border border-[#d9e1e2] bg-[#f5f7f6] px-3 py-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#71959a]" />

                  <span className="ml-2 text-[9px] font-bold uppercase tracking-[0.18em] text-[#6d7d80]">
                    Maintenance Workspace
                  </span>
                </div>

                <h2
                  className="
                    text-[24px]
                    font-extrabold
                    leading-tight
                    tracking-[-1px]
                    text-[#132735]
                    sm:text-[28px]
                    lg:text-[30px]
                  "
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  Sign in to CMMS
                </h2>

                <p className="mx-auto mt-2 max-w-[350px] text-[13px] leading-5 text-[#7a8589]">
                  Enter your credentials to continue.
                </p>
              </div>

              {/* =================================================
                  LOGIN FORM
              ================================================= */}

              <form onSubmit={handleLogin} className="space-y-3.5">
                {/* =================================================
                    EMAIL
                ================================================= */}

                <div>
                  <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.09em] text-[#59676c]">
                    Email address
                  </label>

                  <div
                    className={`
                      group
                      flex
                      h-[52px]
                      items-center
                      rounded-[14px]
                      border
                      bg-[#f7f8f7]
                      transition-all
                      duration-200
                      ${
                        focusField === "email"
                          ? "border-[#8daeb2] bg-white shadow-[0_0_0_4px_rgba(141,174,178,0.10)]"
                          : "border-[#dde1df] hover:border-[#c8cfcc] hover:bg-white"
                      }
                    `}
                  >
                    <Mail
                      className={`
                        ml-4
                        h-[17px]
                        w-[17px]
                        shrink-0
                        transition-colors
                        duration-200
                        ${
                          focusField === "email"
                            ? "text-[#668e93]"
                            : "text-[#9ba5a8]"
                        }
                      `}
                    />

                    <input
                      type="email"
                      name="email"
                      required
                      autoComplete="username"
                      placeholder="Enter your email"
                      onFocus={() => setFocusField("email")}
                      onBlur={() => setFocusField(null)}
                      className="
                        h-full
                        w-full
                        min-w-0
                        bg-transparent
                        px-3
                        text-[16px]
                        font-medium
                        text-[#26363e]
                        outline-none
                        placeholder:text-[#a6adb0]
                        sm:text-[14px]
                      "
                    />
                  </div>
                </div>

                {/* =================================================
                    PASSWORD
                ================================================= */}

                <div>
                  <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.09em] text-[#59676c]">
                    Password
                  </label>

                  <div
                    className={`
                      group
                      flex
                      h-[52px]
                      items-center
                      rounded-[14px]
                      border
                      bg-[#f7f8f7]
                      transition-all
                      duration-200
                      ${
                        focusField === "password"
                          ? "border-[#8daeb2] bg-white shadow-[0_0_0_4px_rgba(141,174,178,0.10)]"
                          : "border-[#dde1df] hover:border-[#c8cfcc] hover:bg-white"
                      }
                    `}
                  >
                    <LockKeyhole
                      className={`
                        ml-4
                        h-[17px]
                        w-[17px]
                        shrink-0
                        transition-colors
                        duration-200
                        ${
                          focusField === "password"
                            ? "text-[#668e93]"
                            : "text-[#9ba5a8]"
                        }
                      `}
                    />

                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      required
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      onFocus={() => setFocusField("password")}
                      onBlur={() => setFocusField(null)}
                      className="
                        h-full
                        w-full
                        min-w-0
                        bg-transparent
                        px-3
                        text-[16px]
                        font-medium
                        text-[#26363e]
                        outline-none
                        placeholder:text-[#a6adb0]
                        sm:text-[14px]
                      "
                    />

                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowPassword(!showPassword)}
                      className="
                        mr-2.5
                        shrink-0
                        rounded-xl
                        p-2
                        text-[#98a2a5]
                        transition-all
                        hover:bg-[#eef1ef]
                        hover:text-[#526267]
                      "
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-[17px] w-[17px]" />
                      ) : (
                        <Eye className="h-[17px] w-[17px]" />
                      )}
                    </motion.button>
                  </div>
                </div>

                {/* =================================================
                    LOGIN ERROR
                ================================================= */}

                {loginErrors && (
                  <div className="rounded-xl border border-red-100 bg-red-50 px-3.5 py-2.5">
                    <p className="text-[11px] font-medium text-red-500">
                      User or Password Incorrect
                    </p>
                  </div>
                )}

                {/* =================================================
                    OPTIONS
                ================================================= */}

                <div className="flex flex-wrap items-center justify-between gap-y-2 pt-0.5">
                  {/* Remember Me */}

                  {/* <label className="group flex cursor-pointer items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) =>
                        setRemember(e.target.checked)
                      }
                      className="sr-only"
                    />

                    <motion.span
                      animate={{
                        scale: remember ? 1 : 0.96,
                      }}
                      className={`
                        flex
                        h-[18px]
                        w-[18px]
                        shrink-0
                        items-center
                        justify-center
                        rounded-md
                        border
                        transition-all
                        duration-200
                        ${
                          remember
                            ? "border-[#78999d] bg-[#78999d]"
                            : "border-[#cdd3d1] bg-white group-hover:border-[#aab4b1]"
                        }
                      `}
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

                    <span className="text-[12px] font-medium text-[#737f82]">
                      Remember me
                    </span>
                  </label> */}

                  {/* Secure Login */}

                  <div className="flex w-full items-center justify-end gap-1.5 text-[10px] font-semibold uppercase tracking-[0.05em] text-[#9aa3a4]">
                    <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-[#76969a]" />
                    <span>Secure login</span>
                  </div>
                </div>

                {/* =================================================
                    LOGIN BUTTON
                ================================================= */}

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
                          scale: 0.985,
                        }
                      : {}
                  }
                  disabled={loading}
                  type="submit"
                  className="
                    group
                    relative
                    mt-1.5
                    flex
                    h-[54px]
                    w-full
                    items-center
                    justify-center
                    overflow-hidden
                    rounded-[14px]
                    bg-[#143344]
                    text-[14px]
                    font-bold
                    text-white
                    shadow-[0_10px_24px_rgba(20,51,68,0.16)]
                    transition-all
                    duration-300
                    hover:bg-[#193d51]
                    hover:shadow-[0_14px_28px_rgba(20,51,68,0.20)]
                    disabled:cursor-not-allowed
                    disabled:opacity-70
                  "
                >
                  {/* Button highlight */}

                  <span className="absolute inset-x-0 top-0 h-px bg-white/20" />

                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.08] to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                  {loading ? (
                    <div className="relative flex items-center gap-3">
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/25 border-t-white" />

                      <span>Log in...</span>
                    </div>
                  ) : (
                    <div className="relative flex items-center gap-2">
                      <span>Log In</span>

                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  )}
                </motion.button>
              </form>

              {/* =================================================
                  CARD FOOTER
              ================================================= */}

              <div className="mt-5 flex items-center justify-center gap-2">
                <div className="h-px w-5 bg-[#e1e5e3]" />

                <span className="text-[9px] font-medium uppercase tracking-[0.18em] text-[#a2aaab]">
                  Maintenance Intelligence
                </span>

                <div className="h-px w-5 bg-[#e1e5e3]" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;
