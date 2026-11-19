import { useState, useEffect } from "react";
import { Link } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authClient, useSession } from "../lib/auth-client";

const GoogleIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.27 21.41 7.33 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.27 2.59 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

const GithubIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
    />
  </svg>
);

interface UserAccount {
  id?: string;
  providerId: string;
}

const profileFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "El nombre debe contener al menos 2 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres"),
  image: z
    .string()
    .trim()
    .url("Debe ser una URL válida (ej: https://...)")
    .or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const passwordFormSchema = z
  .object({
    currentPassword: z.string().min(1, "Ingresá tu contraseña actual"),
    newPassword: z.string().min(8, "La nueva contraseña debe tener al menos 8 caracteres"),
    confirmPassword: z.string().min(1, "Confirmá tu nueva contraseña"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

type PasswordFormValues = z.infer<typeof passwordFormSchema>;

export const Profile = () => {
  const { data: session, refetch } = useSession();
  const [profileFeedback, setProfileFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [passwordFeedback, setPasswordFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await authClient.listAccounts();
        if (res?.data) {
          setAccounts(res.data);
        }
      } catch {
        // Ignorar o mantener vacio
      } finally {
        setLoadingAccounts(false);
      }
    };
    fetchAccounts();
  }, []);

  const user = session?.user;
  const isAdmin = user?.role === "admin";

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    reset: resetProfile,
    formState: { errors: profileErrors, isSubmitting: isSubmittingProfile },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.name ?? "",
      image: user?.image ?? "",
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors, isSubmitting: isSubmittingPassword },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (user) {
      resetProfile({
        name: user.name || "",
        image: user.image || "",
      });
    }
  }, [user, resetProfile]);

  if (!session || !user) return null;

  const handleProfileSubmit = async (values: ProfileFormValues) => {
    setProfileFeedback(null);
    try {
      const { error } = await authClient.updateUser({
        name: values.name,
        image: values.image ? values.image : undefined,
      });

      if (error) {
        setProfileFeedback({
          type: "error",
          message: error.message ?? "No se pudieron actualizar los datos del perfil.",
        });
        return;
      }

      await refetch();
      setProfileFeedback({
        type: "success",
        message: "¡Tus datos de perfil fueron actualizados exitosamente!",
      });
    } catch {
      setProfileFeedback({
        type: "error",
        message: "Ocurrió un error inesperado al actualizar el perfil.",
      });
    }
  };

  const handlePasswordSubmit = async (values: PasswordFormValues) => {
    setPasswordFeedback(null);
    try {
      const { error } = await authClient.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        revokeOtherSessions: false,
      });

      if (error) {
        let msg = error.message ?? "No se pudo actualizar la contraseña.";
        if (
          msg.toLowerCase().includes("credential") ||
          msg.toLowerCase().includes("password") ||
          msg.toLowerCase().includes("not found")
        ) {
          msg =
            "No se pudo cambiar la contraseña. Verificá que la contraseña actual sea correcta (si te registraste solo con Google o GitHub, tu cuenta no posee una contraseña local configurada).";
        }
        setPasswordFeedback({
          type: "error",
          message: msg,
        });
        return;
      }

      resetPassword();
      setPasswordFeedback({
        type: "success",
        message: "¡Tu contraseña fue actualizada correctamente!",
      });
    } catch {
      setPasswordFeedback({
        type: "error",
        message: "Ocurrió un error inesperado al cambiar la contraseña.",
      });
    }
  };

  const handleLinkSocial = async (provider: "github" | "google") => {
    setLinkError(null);
    const { error } = await authClient.linkSocial({
      provider,
      callbackURL: "/perfil",
    });
    if (error) {
      setLinkError(error.message ?? `No se pudo conectar la cuenta de ${provider === "github" ? "GitHub" : "Google"}`);
    }
  };

  const isGithubLinked =
    accounts.some((a) => a.providerId.toLowerCase() === "github") ||
    (Boolean(user.image?.includes("githubusercontent.com")) && accounts.length === 0);

  const isGoogleLinked =
    accounts.some((a) => a.providerId.toLowerCase() === "google") ||
    (Boolean(user.image?.includes("googleusercontent.com")) && accounts.length === 0);

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Perfil de Usuario</h1>
        <p className="mt-1 text-sm text-slate-500">
          Gestioná tu identidad personal, revisá tus permisos y modificá tu seguridad
        </p>
      </div>

      {/* Tarjeta de Identidad Resumida */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50/60 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name}
                  className="h-16 w-16 rounded-full border-2 border-white object-cover shadow"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-600 text-xl font-bold text-white shadow">
                  {initials}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                      isAdmin
                        ? "bg-amber-100 text-amber-800 border border-amber-300"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {user.role ?? "user"}
                  </span>
                </div>
                <p className="text-sm text-slate-500">{user.email}</p>
              </div>
            </div>

            {/* Accesos rápidos */}
            <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
              <Link
                to="/mis-reseñas"
                className="rounded-xl border border-indigo-200 bg-indigo-50 px-3.5 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition"
              >
                ⭐ Mis Reseñas
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition shadow-sm"
                >
                  Panel Admin
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Nivel de Acceso Informativo */}
        <div className="p-6 sm:p-8 space-y-4">
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Nivel de Acceso y Permisos
            </h3>
            <p className="mt-1 text-sm text-slate-700">
              {isAdmin
                ? "👑 Rol Administrador: Disponés de control total sobre el catálogo de películas (crear, editar, eliminar), moderación comunitaria de reseñas y administración de usuarios y roles."
                : "👤 Rol Usuario Estándar: Podés explorar el catálogo, calificar películas, publicar tus propias reseñas y gestionarlas desde la sección 'Mis Reseñas'."}
            </p>
          </div>
        </div>
      </section>

      {/* Formulario 1: Editar Datos Personales */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Datos del Perfil</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Actualizá tu nombre visible y la foto de avatar de tu cuenta
          </p>
        </div>

        {profileFeedback && (
          <div
            role="alert"
            className={`rounded-xl border p-4 text-xs font-medium flex items-center justify-between ${
              profileFeedback.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            <span>{profileFeedback.message}</span>
            <button
              type="button"
              onClick={() => setProfileFeedback(null)}
              className="text-xs font-bold hover:underline"
            >
              ✕ Cerrar
            </button>
          </div>
        )}

        <form onSubmit={handleSubmitProfile(handleProfileSubmit)} noValidate className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Nombre Completo (Editable) */}
            <div>
              <label
                htmlFor="profile-name"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
              >
                Nombre Completo <span className="text-red-500">*</span>
              </label>
              <input
                id="profile-name"
                type="text"
                autoComplete="name"
                aria-invalid={Boolean(profileErrors.name)}
                {...registerProfile("name")}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition aria-invalid:border-red-500"
              />
              {profileErrors.name && (
                <p className="mt-1 text-xs text-red-600">{profileErrors.name.message}</p>
              )}
            </div>

            {/* URL de Avatar (Editable) */}
            <div>
              <label
                htmlFor="profile-image"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
              >
                URL de Avatar (Opcional)
              </label>
              <input
                id="profile-image"
                type="url"
                placeholder="https://ejemplo.com/mi-avatar.jpg"
                aria-invalid={Boolean(profileErrors.image)}
                {...registerProfile("image")}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition aria-invalid:border-red-500"
              />
              {profileErrors.image && (
                <p className="mt-1 text-xs text-red-600">{profileErrors.image.message}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 pt-1">
            {/* Correo Electrónico (Solo Lectura) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="profile-email"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-500"
                >
                  Correo Electrónico
                </label>
                <span className="text-[10px] font-semibold text-slate-400">Solo lectura</span>
              </div>
              <input
                id="profile-email"
                type="email"
                value={user.email}
                disabled
                className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2.5 text-sm text-slate-500 cursor-not-allowed select-none"
              />
              <p className="mt-1 text-[11px] text-slate-400">
                El correo está vinculado a la cuenta y no puede modificarse directamente.
              </p>
            </div>

            {/* Rol de Usuario (Solo Lectura) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="profile-role"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-500"
                >
                  Rol Asignado
                </label>
                <span className="text-[10px] font-semibold text-slate-400">Solo lectura</span>
              </div>
              <div className="flex items-center h-[42px] px-3.5 rounded-xl border border-slate-200 bg-slate-100">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                    isAdmin
                      ? "bg-amber-100 text-amber-800 border border-amber-300"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {user.role ?? "user"}
                </span>
                <span className="ml-2 text-xs text-slate-400">
                  {isAdmin ? "(Administrador)" : "(Solo lectura de catálogo)"}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                La asignación de permisos es administrada por un administrador del sistema.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              disabled={isSubmittingProfile}
              className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow transition hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSubmittingProfile ? "Guardando..." : "Guardar Cambios de Perfil"}
            </button>
          </div>
        </form>
      </section>

      {/* Formulario 2: Seguridad y Cambio de Contraseña */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Seguridad y Contraseña</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cambiá tu contraseña de acceso local. Si ingresás únicamente mediante Google o GitHub, tu cuenta no requiere contraseña tradicional.
          </p>
        </div>

        {passwordFeedback && (
          <div
            role="alert"
            className={`rounded-xl border p-4 text-xs font-medium flex items-center justify-between ${
              passwordFeedback.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            <span>{passwordFeedback.message}</span>
            <button
              type="button"
              onClick={() => setPasswordFeedback(null)}
              className="text-xs font-bold hover:underline"
            >
              ✕ Cerrar
            </button>
          </div>
        )}

        <form onSubmit={handleSubmitPassword(handlePasswordSubmit)} noValidate className="space-y-4">
          <div>
            <label
              htmlFor="current-password"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
            >
              Contraseña Actual
            </label>
            <input
              id="current-password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              aria-invalid={Boolean(passwordErrors.currentPassword)}
              {...registerPassword("currentPassword")}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition aria-invalid:border-red-500"
            />
            {passwordErrors.currentPassword && (
              <p className="mt-1 text-xs text-red-600">{passwordErrors.currentPassword.message}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="new-password"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
              >
                Nueva Contraseña (mín. 8 caracteres)
              </label>
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                aria-invalid={Boolean(passwordErrors.newPassword)}
                {...registerPassword("newPassword")}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition aria-invalid:border-red-500"
              />
              {passwordErrors.newPassword && (
                <p className="mt-1 text-xs text-red-600">{passwordErrors.newPassword.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
              >
                Confirmar Nueva Contraseña
              </label>
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                aria-invalid={Boolean(passwordErrors.confirmPassword)}
                {...registerPassword("confirmPassword")}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition aria-invalid:border-red-500"
              />
              {passwordErrors.confirmPassword && (
                <p className="mt-1 text-xs text-red-600">{passwordErrors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              disabled={isSubmittingPassword}
              className="rounded-xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow transition hover:bg-slate-800 disabled:opacity-50"
            >
              {isSubmittingPassword ? "Actualizando..." : "Actualizar Contraseña"}
            </button>
          </div>
        </form>
      </section>

      {/* Vinculación Social (GitHub y Google) */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Cuentas Sociales Vinculadas</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Conectá tu cuenta de GitHub o Google para iniciar sesión con un solo clic
          </p>
        </div>

        {linkError && (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            {linkError}
          </div>
        )}

        {/* Notificación informativa cuando ya existe un proveedor vinculado */}
        {(isGithubLinked || isGoogleLinked) && (
          <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-xs text-amber-900 leading-relaxed">
            <span className="font-bold">Estado de vinculación:</span> Tu cuenta ya está vinculada a{" "}
            <span className="font-bold text-amber-950">{isGithubLinked ? "GitHub" : "Google"}</span>.{" "}
            <strong className="font-extrabold text-amber-950">
              No podés tener múltiples cuentas vinculadas
            </strong>
            , por lo que <strong className="font-extrabold text-amber-950">{isGithubLinked ? "Google" : "GitHub"}</strong> se encuentra inhabilitado.
          </div>
        )}

        <div className="space-y-3">
          {/* Opción GitHub */}
          <div
            className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border p-4 transition ${
              isGithubLinked
                ? "border-emerald-200 bg-emerald-50/50"
                : isGoogleLinked
                ? "border-slate-200 bg-slate-50/80 opacity-85"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center gap-3">
              <GithubIcon className="h-6 w-6 text-slate-900 flex-shrink-0" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-900">GitHub</span>
                  {isGithubLinked && (
                    <span className="rounded-full bg-emerald-100 border border-emerald-300 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                      ✓ Vinculada
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isGithubLinked ? (
                    <span className="text-emerald-700 font-medium">
                      Tu cuenta está vinculada exitosamente con tu usuario de GitHub.
                    </span>
                  ) : isGoogleLinked ? (
                    <strong className="font-bold text-amber-900">
                      GitHub no disponible: no podés tener múltiples cuentas vinculadas a la vez.
                    </strong>
                  ) : (
                    "Vinculá tu cuenta con GitHub para iniciar sesión rápidamente."
                  )}
                </p>
              </div>
            </div>

            <div className="sm:text-right">
              {isGithubLinked ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Conectado
                </span>
              ) : isGoogleLinked ? (
                <span className="inline-block rounded-lg border border-slate-300 bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-500 cursor-not-allowed select-none">
                  Inhabilitado
                </span>
              ) : (
                <button
                  type="button"
                  disabled={loadingAccounts}
                  onClick={() => handleLinkSocial("github")}
                  className="rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition disabled:opacity-50"
                >
                  Conectar GitHub
                </button>
              )}
            </div>
          </div>

          {/* Opción Google */}
          <div
            className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border p-4 transition ${
              isGoogleLinked
                ? "border-emerald-200 bg-emerald-50/50"
                : isGithubLinked
                ? "border-slate-200 bg-slate-50/80 opacity-85"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center gap-3">
              <GoogleIcon className="h-6 w-6 flex-shrink-0" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-900">Google</span>
                  {isGoogleLinked && (
                    <span className="rounded-full bg-emerald-100 border border-emerald-300 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                      ✓ Vinculada
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isGoogleLinked ? (
                    <span className="text-emerald-700 font-medium">
                      Tu cuenta está vinculada exitosamente con tu usuario de Google.
                    </span>
                  ) : isGithubLinked ? (
                    <strong className="font-bold text-amber-900">
                      Google no disponible: no podés tener múltiples cuentas vinculadas a la vez.
                    </strong>
                  ) : (
                    "Vinculá tu cuenta con Google para iniciar sesión rápidamente."
                  )}
                </p>
              </div>
            </div>

            <div className="sm:text-right">
              {isGoogleLinked ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Conectado
                </span>
              ) : isGithubLinked ? (
                <span className="inline-block rounded-lg border border-slate-300 bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-500 cursor-not-allowed select-none">
                  Inhabilitado
                </span>
              ) : (
                <button
                  type="button"
                  disabled={loadingAccounts}
                  onClick={() => handleLinkSocial("google")}
                  className="rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition disabled:opacity-50"
                >
                  Conectar Google
                </button>
              )}
            </div>
          </div>
        </div>

        {!isGithubLinked && !isGoogleLinked && (
          <p className="text-[11px] text-slate-500">
            <strong>Nota:</strong> Solo es posible vincular una cuenta social a tu perfil. <strong>No podés tener múltiples cuentas vinculadas a la vez.</strong>
          </p>
        )}
      </section>
    </div>
  );
};
