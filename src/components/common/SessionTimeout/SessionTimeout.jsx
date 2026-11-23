import { useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import useIdleTimeout from "../../../hooks/useIdleTimeout";
import SessionTimeoutModal from "./SessionTimeoutModal";
import { logout } from "../../../services/authApi";
import { useAuthStore } from "../../../store/authStore";

const IDLE_TIME = 5 * 60 * 1000;
const WARNING_TIME = 60 * 1000;

// `tokenKey` is kept for API compatibility with AppRoutes; clearAuth() removes
// both admin_token and user_token, so the active one is always cleared.
// eslint-disable-next-line no-unused-vars
function SessionTimeout({ tokenKey, loginPath = "/login" }) {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const loggingOutRef = useRef(false);

  const handleLogout = useCallback(
    async (auto = false) => {
      if (loggingOutRef.current) return;
      loggingOutRef.current = true;

      try {
        // Same flow as the header's Logout button: tell the server first.
        await logout();
      } catch {
        // ignore - we still clear the session locally
      }

      // Tokens live in sessionStorage. clearAuth() removes admin_token,
      // user_token, auth_type, session timers and the cached API lookups.
      clearAuth();

      if (auto) toast.warning("Session expired due to inactivity.");
      else toast.success("Logged out successfully.");

      navigate(loginPath, { replace: true });
      loggingOutRef.current = false;
    },
    [clearAuth, loginPath, navigate]
  );

  const { isWarning, secondsLeft, stayLoggedIn } = useIdleTimeout({
    idleTime: IDLE_TIME,
    warningTime: WARNING_TIME,
    onTimeout: () => handleLogout(true),
  });

  return (
    <SessionTimeoutModal
      open={isWarning}
      secondsLeft={secondsLeft}
      totalSeconds={WARNING_TIME / 1000}
      onStay={stayLoggedIn}
      onLogout={() => handleLogout(false)}
    />
  );
}

export default SessionTimeout;