import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, Navigate, useLocation, useNavigate, type Location } from "react-router";
import { loginSchema, type LoginFormValues } from "../schemas/auth.schema";
import { authClient, signIn, useSession } from "../lib/auth-client";

export const Login = () => {
  const { data: session } = useSession();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const from = (location.state as { from?: Location } | null)?.from?.pathname ?? "/";
  const oauthError = new URLSearchParams(location.search).get("error");
  const mustLinkGithub = oauthError === "account_not_linked";

  if (session && !isSubmitting) {
    return <Navigate to={from} replace />;
  }

  const onSubmit = async (credentials: LoginFormValues) => {
    const { error } = await signIn.email(credentials);
    if (error) {
      setError("root.server", { message: error.message ?? "Credenciales inválidas" });
      return;
    }
    if (mustLinkGithub) {
      const { error: linkError } = await authClient.linkSocial({ provider: "github", callbackURL: from });
      if (linkError) {
        setError("root.server", { message: linkError.message ?? "No se pudo vincular la cuenta de GitHub" });
        return;
      }
    }
    navigate(from, { replace: true });
  };

  const handleGithub = () => {
    signIn.social({ provider: "github", callbackURL: from, errorCallbackURL: "/login" });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4 font-sans sm:p-6">
      <div className="w-full max-w-md">
        {/* Enlace de regreso */}
        <div className="mb-4 text-center">
          <Link to="/" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition">
            ← Volver al catálogo de películas
          </Link>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-6 text-center">
            <span className="text-3xl">🎬</span>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">Iniciar Sesión</h1>
            <p className="mt-1 text-xs text-slate-500">Ingresá a tu cuenta para acceder a la plataforma</p>
          </div>

          {oauthError && (
            <div role="alert" className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
              {mustLinkGithub
                ? "Ya existe una cuenta con ese correo electrónico. Ingresá tu contraseña para vincular tu cuenta de GitHub."
                : "No se pudo iniciar sesión con GitHub. Por favor intentá nuevamente."}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                autoComplete="email"
                placeholder="ejemplo@correo.com"
                aria-invalid={Boolean(errors.email)}
                {...register("email")}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 aria-invalid:border-red-500"
              />
              {errors.email && <span className="mt-1 block text-xs text-red-600">{errors.email.message}</span>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Contraseña
              </label>
              <input
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                aria-invalid={Boolean(errors.password)}
                {...register("password")}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 aria-invalid:border-red-500"
              />
              {errors.password && <span className="mt-1 block text-xs text-red-600">{errors.password.message}</span>}
            </div>

            {errors.root?.server && (
              <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                {errors.root.server.message}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSubmitting ? "Iniciando sesión..." : mustLinkGithub ? "Ingresar y vincular GitHub" : "Iniciar Sesión"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            <span>o continuar con</span>
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <button
            type="button"
            onClick={handleGithub}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              />
            </svg>
            GitHub
          </button>

          <p className="mt-6 text-center text-xs text-slate-500">
            ¿No tenés una cuenta?{" "}
            <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-800 transition">
              Crear cuenta
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
};
