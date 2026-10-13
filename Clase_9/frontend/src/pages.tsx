import { FormEvent, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./auth";

export function HomePage() {
  const { user, loading } = useAuth();
  if (loading) return <p>Verificando la sesión...</p>;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === "ADMIN" ? "/dashboard-admin" : "/dashboard"} replace />;
}

export function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (user) return <Navigate to={user.role === "ADMIN" ? "/dashboard-admin" : "/dashboard"} replace />;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      await login(email, password);
      const from = (location.state as { from?: string } | null)?.from;
      navigate(from ?? "/");
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "No se pudo iniciar sesión");
    }
  }

  return (
    <main>
      <h1>Iniciar sesión</h1>
      <form onSubmit={handleSubmit}>
        <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
        <label>Contraseña<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
        {error && <p role="alert">{error}</p>}
        <button type="submit">Ingresar</button>
      </form>
    </main>
  );
}

function DashboardLayout({ admin }: { admin: boolean }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <main>
      <h1>{admin ? "Dashboard de administración" : "Dashboard de usuario"}</h1>
      <p>Sesión iniciada como {user?.name} ({user?.role}).</p>
      <nav>
        <Link to="/dashboard">Dashboard</Link>{" "}
        {user?.role === "ADMIN" && <Link to="/dashboard-admin">Administración</Link>}{" "}
        <button type="button" onClick={handleLogout}>Cerrar sesión</button>
      </nav>
    </main>
  );
}

export function DashboardPage() {
  return <DashboardLayout admin={false} />;
}

export function AdminDashboardPage() {
  return <DashboardLayout admin />;
}
