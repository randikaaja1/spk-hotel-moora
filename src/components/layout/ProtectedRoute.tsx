import { Navigate, Outlet, useLocation } from "react-router-dom";
import type { Role } from "../../types/api";
import { useAuth } from "../../context/AuthContext";
import { LoadingState } from "../ui/LoadingState";

// ProtectedRoute membatasi halaman berdasarkan status login dan role.
export function ProtectedRoute({ roles }: { roles?: Role[] }) {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingState label="Memuat sesi" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to={user.role === "admin" ? "/admin/dashboard" : "/hotels"} replace />;
  }

  return <Outlet />;
}
