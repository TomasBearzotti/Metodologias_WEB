import { useEffect, useState } from "react";
import { Link } from "react-router";
import { authClient, useSession } from "../lib/auth-client";

type AdminUser = { id: string; name: string; email: string; role?: string | null };
type UserSession = { token: string; userAgent?: string | null; ipAddress?: string | null; createdAt: Date };

export const Sessions = () => {
  const { data: current } = useSession();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [sessions, setSessions] = useState<Record<string, UserSession[]>>({});
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchUsers = async () => {
    try {
      const { data, error } = await authClient.admin.listUsers({ query: { limit: 50 } });
      if (error) {
        setFeedback({ type: "error", message: error.message ?? "No se pudieron cargar los usuarios" });
      } else if (data) {
        setUsers(data.users);
      }
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    void fetchUsers();
  }, []);

  const loadSessions = async (userId: string) => {
    setActionLoading(`sessions-${userId}`);
    const { data, error } = await authClient.admin.listUserSessions({ userId });
    setActionLoading(null);
    if (error) {
      setFeedback({ type: "error", message: error.message ?? "No se pudieron cargar las sesiones" });
      return;
    }
    setSessions((prev) => ({ ...prev, [userId]: data.sessions }));
  };

  const handleRevokeSession = async (userId: string, sessionToken: string) => {
    if (!window.confirm("¿Estás seguro de que deseás revocar esta sesión?")) return;

    setActionLoading(`revoke-${sessionToken}`);
    const { error } = await authClient.admin.revokeUserSession({ sessionToken });
    setActionLoading(null);

    if (error) {
      setFeedback({ type: "error", message: error.message ?? "No se pudo revocar la sesión" });
      return;
    }

    setFeedback({ type: "success", message: "Sesión revocada exitosamente de la base de datos." });
    await loadSessions(userId);
  };

  const handleToggleRole = async (user: AdminUser) => {
    const isDemotingSelf = user.id === current?.user?.id;
    const targetRole = user.role === "admin" ? "user" : "admin";

    if (isDemotingSelf && targetRole === "user") {
      if (
        !window.confirm(
          "⚠️ Advertencia: Estás a punto de quitarte los permisos de administrador a vos mismo. ¿Deseás continuar?"
        )
      ) {
        return;
      }
    } else {
      if (
        !window.confirm(
          `¿Cambiar el rol de "${user.name}" de "${user.role ?? "user"}" a "${targetRole}"?`
        )
      ) {
        return;
      }
    }

    setActionLoading(`role-${user.id}`);
    const { error } = await authClient.admin.setRole({
      userId: user.id,
      role: targetRole,
    });
    setActionLoading(null);

    if (error) {
      setFeedback({ type: "error", message: error.message ?? "No se pudo actualizar el rol del usuario" });
      return;
    }

    setFeedback({
      type: "success",
      message: `El rol de "${user.name}" fue actualizado a "${targetRole}".`,
    });

    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, role: targetRole } : u))
    );
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Gestión de Usuarios y Sesiones
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Auditoría de cuentas registradas, asignación de roles y control de sesiones activas en MongoDB
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition"
          >
            ← Volver a Películas
          </Link>
          <button
            type="button"
            onClick={fetchUsers}
            disabled={loadingUsers}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loadingUsers ? "Cargando..." : "Actualizar"}
          </button>
        </div>
      </div>

      {/* Banner de Feedback */}
      {feedback && (
        <div
          role="alert"
          className={`rounded-xl border p-4 text-sm font-medium flex items-center justify-between ${
            feedback.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          <span>{feedback.message}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs font-bold hover:underline"
          >
            ✕ Cerrar
          </button>
        </div>
      )}

      {/* Lista de Usuarios */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            Usuarios Registrados ({users.length})
          </h2>
          <span className="text-xs text-slate-500">Better Auth Admin Plugin</span>
        </div>

        {loadingUsers ? (
          <div className="p-8 text-center text-sm text-slate-500">
            Consultando usuarios desde MongoDB...
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No se encontraron usuarios registrados.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {users.map((user) => {
              const isAdmin = user.role === "admin";
              const isCurrentUser = user.id === current?.user?.id;
              const userSessions = sessions[user.id];
              const isLoadingSessions = actionLoading === `sessions-${user.id}`;
              const isChangingRole = actionLoading === `role-${user.id}`;

              return (
                <li key={user.id} className="p-6 transition hover:bg-slate-50/50">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    {/* Info Usuario */}
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="font-bold text-slate-900 text-base">{user.name}</span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                            isAdmin
                              ? "bg-amber-100 text-amber-800 border border-amber-300"
                              : "bg-slate-100 text-slate-700 border border-slate-200"
                          }`}
                        >
                          {user.role ?? "user"}
                        </span>
                        {isCurrentUser && (
                          <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
                            (Tu cuenta)
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500">{user.email}</p>
                    </div>

                    {/* Acciones */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Botón para alternar Rol */}
                      <button
                        type="button"
                        onClick={() => handleToggleRole(user)}
                        disabled={isChangingRole}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold shadow-sm transition disabled:opacity-50 ${
                          isAdmin
                            ? "border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100"
                            : "border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                        }`}
                      >
                        {isChangingRole
                          ? "Actualizando..."
                          : isAdmin
                          ? "Degradar a User"
                          : "Promover a Admin"}
                      </button>

                      {/* Botón ver sesiones */}
                      <button
                        type="button"
                        onClick={() => loadSessions(user.id)}
                        disabled={isLoadingSessions}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
                      >
                        {isLoadingSessions
                          ? "Cargando..."
                          : userSessions !== undefined
                          ? `Actualizar sesiones (${userSessions.length})`
                          : "Ver sesiones"}
                      </button>
                    </div>
                  </div>

                  {/* Detalle de Sesiones Activas */}
                  {userSessions !== undefined && (
                    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
                        Sesiones Activas ({userSessions.length})
                      </h3>

                      {userSessions.length === 0 ? (
                        <p className="text-xs text-slate-500 italic">No hay sesiones activas para este usuario.</p>
                      ) : (
                        <ul className="space-y-2">
                          {userSessions.map((s) => {
                            const isCurrentSession = s.token === current?.session.token;
                            const isRevoking = actionLoading === `revoke-${s.token}`;

                            return (
                              <li
                                key={s.token}
                                className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-3 text-xs sm:flex-row sm:items-center sm:justify-between shadow-xs"
                              >
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-slate-800">
                                      {s.userAgent ?? "Navegador no identificado"}
                                    </span>
                                    {isCurrentSession && (
                                      <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold text-indigo-800">
                                        Esta sesión
                                      </span>
                                    )}
                                  </div>
                                  <p className="mt-0.5 text-slate-400 text-[11px]">
                                    Iniciada: {new Date(s.createdAt).toLocaleString("es-AR")}
                                    {s.ipAddress && ` · IP: ${s.ipAddress}`}
                                  </p>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleRevokeSession(user.id, s.token)}
                                  disabled={isRevoking}
                                  className="self-start sm:self-center rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-100 transition disabled:opacity-50"
                                >
                                  {isRevoking ? "Revocando..." : "Revocar sesión"}
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
};
