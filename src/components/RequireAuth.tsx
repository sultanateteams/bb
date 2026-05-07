import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/store/useAuthStore";

export default function RequireAuth() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }
  return <Outlet />;
}
