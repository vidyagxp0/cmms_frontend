import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import useIdleTimeout from "../../../hooks/useIdleTimeout";
import SessionTimeoutModal from "./SessionTimeoutModal";

const IDLE_TIME = 5 * 60 * 1000; 
const WARNING_TIME = 60 * 1000; 

function SessionTimeout({ tokenKey, loginPath = "/login" }) {
  const navigate = useNavigate();

  const handleLogout = useCallback(
    async (auto = false) => {
      try {
        // TODO: call your logout API here if you have one, e.g.
        // await api.post("/logout");
      } catch (e) {
        // ignore - we still clear the session locally
      }

      // Adjust if you store the token in sessionStorage / context / redux
      localStorage.removeItem(tokenKey);

      if (auto) toast.warning("Session expired due to inactivity.");
      else toast.success("Logged out successfully.");

      navigate(loginPath, { replace: true });
    },
    [tokenKey, loginPath, navigate]
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