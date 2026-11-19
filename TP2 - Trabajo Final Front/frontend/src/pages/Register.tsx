import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, Navigate, useNavigate } from "react-router";
import { registerSchema, type RegisterFormValues } from "../schemas/auth.schema";
import { signUp, useSession } from "../lib/auth-client";

export const Register = () => {
  const { data: session } = useSession();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  if (session && !isSubmitting) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (values: RegisterFormValues) => {
    const { error } = await signUp.email({
      name: values.name,
      email: values.email,
      password: values.password,
    });

    if (error) {
      setError("root.server", {
        message: error.message ?? "No se pudo registrar la cuenta. Verificá los datos ingresados.",
      });
      return;
    }

    navigate("/", { replace: true });
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
            <h1 className="mt-2 text-2xl font-bold text-slate-900">Crear Cuenta</h1>
            <p className="mt-1 text-xs text-slate-500">Registrate para explorar y guardar tus preferencias</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Nombre Completo
              </label>
              <input
                type="text"
                autoComplete="name"
                placeholder="Juan Pérez"
                aria-invalid={Boolean(errors.name)}
                {...register("name")}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 aria-invalid:border-red-500"
              />
              {errors.name && <span className="mt-1 block text-xs text-red-600">{errors.name.message}</span>}
            </div>

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
                Contraseña (mínimo 8 caracteres)
              </label>
              <input
                type="password"
                autoComplete="new-password"
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
              {isSubmitting ? "Creando cuenta..." : "Registrarme"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-500">
            ¿Ya tenés una cuenta?{" "}
            <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-800 transition">
              Iniciar Sesión
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
};
