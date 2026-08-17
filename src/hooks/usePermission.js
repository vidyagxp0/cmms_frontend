import { useAuthStore } from "../store/authStore";

const usePermission = () => {
  const permissions = useAuthStore((state) => state.permissions);

  const can = (permission) => permissions.includes(permission);

  return { can };
};

export default usePermission;
