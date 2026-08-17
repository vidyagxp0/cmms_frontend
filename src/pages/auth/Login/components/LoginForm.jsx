import React from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";

const LoginForm = ({
  showPassword,
  setShowPassword,
  remember,
  setRemember,
  focusField,
  setFocusField,
  handleLogin,
  loading
}) => {
  return (
    <form onSubmit={handleLogin} className="space-y-5">
      {/* Heading */}
      <div>
        <h2
          className="text-[20px] font-bold text-slate-900"
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          Welcome back
        </h2>

        <p className="mt-1 text-[13px] text-slate-500">
          Sign in to continue to your maintenance workspace
        </p>
      </div>

      {/* Username / Email */}
      <div>
        <label
          htmlFor="email"
          className="mb-1.5 block text-[13px] font-medium text-slate-700"
        >
          Email
        </label>

        <div
          className={`flex items-center gap-2.5 rounded-xl border bg-slate-50/60 px-3.5 py-2.5 transition-all duration-200 ${
            focusField === "email"
              ? "border-[#12A594] ring-2 ring-[#12A594]/15 bg-white"
              : "border-slate-200"
          }`}
        >
          <Mail size={17} className="text-slate-400" />

          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            placeholder="Enter your email"
            onFocus={() => setFocusField("email")}
            onBlur={() => setFocusField(null)}
            className="w-full bg-transparent text-[14px] text-slate-800 outline-none placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Password */}
      <div>
        <label
          htmlFor="password"
          className="mb-1.5 block text-[13px] font-medium text-slate-700"
        >
          Password
        </label>

        <div
          className={`flex items-center gap-2.5 rounded-xl border bg-slate-50/60 px-3.5 py-2.5 transition-all duration-200 ${
            focusField === "password"
              ? "border-[#12A594] ring-2 ring-[#12A594]/15 bg-white"
              : "border-slate-200"
          }`}
        >
          <Lock size={17} className="text-slate-400" />

          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Enter your password"
            onFocus={() => setFocusField("password")}
            onBlur={() => setFocusField(null)}
            className="w-full bg-transparent text-[14px] text-slate-800 outline-none placeholder:text-slate-400"
          />

          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="text-slate-400 transition-colors hover:text-slate-600"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
      </div>

      {/* Remember / Forgot */}
      <div className="flex items-center justify-between pt-1">
        <label className="flex cursor-pointer items-center gap-2 text-[13px] text-slate-600">
          <input
            type="checkbox"
            checked={remember}
            onChange={() => setRemember((value) => !value)}
            className="h-3.5 w-3.5 rounded border-slate-300 text-[#12A594] focus:ring-[#12A594]/30"
          />

          Remember me
        </label>

        <button
          type="button"
          className="text-[13px] font-medium text-[#0F3A63] transition-colors hover:text-[#12A594]"
        >
          Forgot password?
        </button>
      </div>

      {/* Submit */}
        <motion.button
        type="submit"
        disabled={loading}
        whileHover={!loading ? { scale: 1.01 } : {}}
        whileTap={!loading ? { scale: 0.98 } : {}}
        className={`group flex w-full items-center justify-center gap-2 rounded-xl py-3 text-[14px] font-semibold text-white shadow-[0_8px_20px_rgba(15,58,99,0.25)] transition-all duration-200 ${
            loading
            ? "cursor-not-allowed opacity-80"
            : "hover:shadow-[0_10px_26px_rgba(18,165,148,0.35)]"
        }`}
        style={{
            background:
            "linear-gradient(135deg, #0F3A63 0%, #12A594 130%)",
        }}
        >
        {loading ? (
            <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Logging in...
            </>
        ) : (
            <>
            Log In

            <ArrowRight
                size={16}
                className="transition-transform duration-200 group-hover:translate-x-0.5"
            />
            </>
        )}
        </motion.button>
    </form>
  );
};

export default LoginForm;