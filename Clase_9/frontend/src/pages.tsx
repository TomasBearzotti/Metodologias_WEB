import { useState, type FormEvent, type ReactNode } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./auth";
import type { UserRole } from "./types";

function AuthShell({ children, title, subtitle }: { children: ReactNode; title: string; subtitle: string }) {
  return (
    <main className="page-shell">
      <section className="auth-card">
        <div className="brand-mark">R</div>
        <p className="eyebrow">Clase 9 · React Router</p>
        <h1>{title}</h1>
        <p className="muted">{subtitle}</p>
        {children}
      </section>
    </main>
  );
}

export function HomePage() {
  const { user, loading } = useAuth();
  if (loading) return <main className="page-shell"><p>Verificando la sesión...</p></main>;
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
    <AuthShell title="Bienvenido de nuevo" subtitle="Ingresá para continuar con tu cuenta.">
      <form className="form-stack" onSubmit={handleSubmit}>
        <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
        <label>Contraseña<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button type="submit">Ingresar</button>
      </form>
      <p className="form-footer">¿No tenés cuenta? <Link to="/register">Registrate</Link></p>
    </AuthShell>
  );
}

export function RegisterPage() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("USER");
  const [error, setError] = useState("");

  if (user) return <Navigate to={user.role === "ADMIN" ? "/dashboard-admin" : "/dashboard"} replace />;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      await register(name, email, password, role);
      navigate("/");
    } catch (registerError) {
      setError(registerError instanceof Error ? registerError.message : "No se pudo crear la cuenta");
    }
  }

  return (
    <AuthShell title="Crear una cuenta" subtitle="Elegí un rol para probar las rutas protegidas.">
      <form className="form-stack" onSubmit={handleSubmit}>
        <label>Nombre<input value={name} onChange={(event) => setName(event.target.value)} required /></label>
        <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
        <label>Contraseña<input type="password" minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
        <label>Rol
          <select value={role} onChange={(event) => setRole(event.target.value as UserRole)}>
            <option value="USER">Usuario</option>
            <option value="ADMIN">Administrador</option>
          </select>
        </label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button type="submit">Crear cuenta</button>
      </form>
      <p className="form-footer">¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link></p>
    </AuthShell>
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
    <main className="dashboard-shell">
      <header className="topbar">
        <Link className="logo" to="/">Rutas<span>.</span></Link>
        <button className="button-ghost" type="button" onClick={handleLogout}>Cerrar sesión</button>
      </header>
      <section className="dashboard-content">
        <div className="welcome-row">
          <div>
            <p className="eyebrow">{admin ? "Panel administrativo" : "Área privada"}</p>
            <h1>Hola, {user?.name}</h1>
            <p className="muted">Esta página solo está disponible para usuarios autenticados.</p>
          </div>
          <span className={`role-badge ${admin ? "admin" : ""}`}>{user?.role}</span>
        </div>
        <div className="info-grid">
          <article className="info-card"><span className="card-icon">✓</span><h2>Sesión activa</h2><p>Tu sesión se valida mediante cookies seguras.</p></article>
          <article className="info-card"><span className="card-icon">↗</span><h2>{admin ? "Acceso total" : "Acceso de usuario"}</h2><p>{admin ? "Podés acceder a los recursos administrativos." : "Podés consultar los recursos privados."}</p></article>
        </div>
        {user?.role === "ADMIN" && !admin && <Link className="button-link" to="/dashboard-admin">Ir al panel de administración →</Link>}
      </section>
    </main>
  );
}

export function DashboardPage() {
  return <DashboardLayout admin={false} />;
}

export function AdminDashboardPage() {
  return <DashboardLayout admin />;
}
