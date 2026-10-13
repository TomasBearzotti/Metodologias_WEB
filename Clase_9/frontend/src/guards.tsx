import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./auth";
import type { UserRole } from "./types";

function LoadingSession() {
  return <p>Verificando la sesión...</p>;
}

export function RequireAuth() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingSession />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}

export function RequireRole({ role }: { role: UserRole }) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSession />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
