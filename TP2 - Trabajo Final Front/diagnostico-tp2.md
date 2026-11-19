# Diagnóstico TP2 — Auditoría completa

## 1. Qué ya está implementado y funciona como base reutilizable

### Backend — completamente funcional como infraestructura

| Archivo                          | Estado   | Reutilizable    |
| -------------------------------- | -------- | --------------- |
| `server.ts`                      | ✅ Listo | Sí, sin cambios |
| `config/db.ts`                   | ✅ Listo | Sí, sin cambios |
| `lib/auth.ts`                    | ✅ Listo | Sí, sin cambios |
| `middlewares/auth.middleware.ts` | ✅ Listo | Sí, sin cambios |
| `middlewares/validate.ts`        | ✅ Listo | Sí, sin cambios |
| `types/auth.types.ts`            | ✅ Listo | Sí, sin cambios |
| `.env.example`                   | ✅ Listo | Sí, sin cambios |
| `tsconfig.json`                  | ✅ Listo | Sí, sin cambios |
| `package.json`                   | ✅ Listo | Sí, sin cambios |

**Lo que tenés gratis (no hay que tocar):**

- Express 5 + TypeScript + ESM
- Conexión a MongoDB con Mongoose (con logs de conexión/desconexión/error)
- Better Auth completo: email+contraseña, GitHub OAuth, plugin `admin()` que agrega `role` al usuario
- `authMiddleware` → lee cookie de sesión desde MongoDB
- `requireRole(...roles)` → devuelve 403 si el rol no alcanza
- `validateBody(schema)` → validación genérica con Zod, 400 con `fieldErrors`
- `UserRole = "admin" | "user"` declarado en types
- `req.user` tipado globalmente en Express

### Frontend — infraestructura completa y funcional

| Archivo                     | Estado | Reutilizable                                                    |
| --------------------------- | ------ | --------------------------------------------------------------- |
| `vite.config.ts`            | ✅     | Sí, proxy `/api` → `localhost:3000` configurado                 |
| `main.tsx`                  | ✅     | Sí, Provider Redux + RouterProvider                             |
| `lib/auth-client.ts`        | ✅     | Sí — `useSession`, `signIn`, `signUp`, `signOut`, `adminClient` |
| `lib/api.ts`                | ✅     | Sí — axios en `/api/v1`, `getErrorMessage`                      |
| `store/index.ts`            | ✅     | Sí — RTK Query store base                                       |
| `router/ProtectedRoute.tsx` | ✅     | Sí — soporta `roles` y `redirectTo`, usa `useSession()`         |
| `router/index.tsx`          | ✅     | Estructura correcta (pública / privada / privada-por-rol)       |
| `layouts/Layout.tsx`        | ✅     | Header con logout real (`signOut` + `window.location.replace`)  |
| `pages/Login.tsx`           | ✅     | RHF + Zod + email + GitHub + manejo `account_not_linked`        |
| `pages/Register.tsx`        | ✅     | Funciona, aunque sin RHF/Zod (solo `useState`)                  |
| `pages/Profile.tsx`         | ✅     | Muestra nombre, email, rol, link GitHub                         |
| `pages/Sessions.tsx`        | ✅     | Admin: listar usuarios, ver/revocar sesiones                    |
| `pages/NotFound.tsx`        | ✅     | Existe (detectada en árbol)                                     |
| `schemas/auth.schema.ts`    | ✅     | `loginSchema` con Zod                                           |
| `types/auth.ts`             | ✅     | `UserRole`                                                      |
| `package.json`              | ✅     | React 19 + Vite 8 + TailwindCSS 4 + RHF + RTK Query + Zod       |

---

## 2. Qué hay que adaptar o limpiar (entidades de ejemplo)

### Backend — 10 archivos de clase que hay que reemplazar o eliminar

Estos archivos pertenecen a las entidades de ejemplo `students` y `subjects`. **No sirven para el TP tal cual**, hay que reemplazarlos con tu entidad propia:

| Archivo                              | Acción                                                     |
| ------------------------------------ | ---------------------------------------------------------- |
| `models/Student.ts`                  | 🔄 Reemplazar por tu modelo                                |
| `models/Subject.ts`                  | 🗑️ Eliminar (no es necesario en el TP)                     |
| `schemas/student.schema.ts`          | 🔄 Reemplazar por tu schema Zod                            |
| `schemas/subject.schema.ts`          | 🗑️ Eliminar                                                |
| `controllers/students.controller.ts` | 🔄 Reemplazar por tu controller                            |
| `controllers/subjects.controller.ts` | 🗑️ Eliminar                                                |
| `routes/students.routes.ts`          | 🔄 Reemplazar por tus rutas                                |
| `routes/subjects.routes.ts`          | 🗑️ Eliminar                                                |
| `routes/index.ts`                    | 🔄 Actualizar: sacar students/subjects, agregar tu entidad |
| `src/demo.ts`                        | 🗑️ Eliminar (es un archivo de demostración de clase)       |

> [!IMPORTANT]
> `subjects.routes.ts` **no tiene** `authMiddleware` ni `requireRole` en sus rutas de escritura. Es un bug de la clase que no hay que copiar. Tu router debe seguir el patrón de `students.routes.ts` que sí los tiene.

### Frontend — 11 archivos que necesitan refactoring

| Archivo                            | Acción                                                                |
| ---------------------------------- | --------------------------------------------------------------------- |
| `store/api.ts`                     | 🔄 Reemplazar `studentsApi` por tu `<entidad>Api` con los 5 endpoints |
| `store/index.ts`                   | 🔄 Cambiar `studentsApi` por tu nuevo API slice                       |
| `pages/Home.tsx`                   | 🔄 Listar tu entidad en vez de estudiantes                            |
| `pages/Admin.tsx`                  | 🔄 ABM sobre tu entidad                                               |
| `pages/StudentDetail.tsx`          | 🔄 Reemplazar por `<EntidadDetail.tsx>` para tu entidad               |
| `components/StudentCard.tsx`       | 🔄 Reemplazar por card de tu entidad                                  |
| `components/admin/StudentForm.tsx` | 🔄 Reemplazar por formulario de tu entidad                            |
| `schemas/student.schema.ts`        | 🔄 Reemplazar con schema Zod de tu entidad                            |
| `types/student.ts`                 | 🔄 Reemplazar con interface de tu entidad                             |
| `router/index.tsx`                 | 🔄 Cambiar rutas `students/:id` por tu entidad                        |
| `layouts/Layout.tsx`               | 🔄 Cambiar el título "Estudiantes" por el nombre de tu app            |

---

## 3. Qué falta construir desde cero

### Backend

| Qué                               | Por qué falta                                                       | Obligatorio |
| --------------------------------- | ------------------------------------------------------------------- | ----------- |
| **Modelo Mongoose de tu entidad** | Mínimo 4 campos, 3 tipos distintos (string, number, boolean, Date…) | ✅ Sí       |
| **Schema Zod de tu entidad**      | `createSchema`, `updateSchema` (`.partial()`), `listSchema`         | ✅ Sí       |
| **Controller CRUD de tu entidad** | 5 handlers: `list`, `getById`, `create`, `update`, `delete`         | ✅ Sí       |
| **Router de tu entidad**          | GET público, POST/PUT/DELETE con `onlyAdmin`                        | ✅ Sí       |

### Frontend

| Qué                                | Por qué falta                                          | Obligatorio    |
| ---------------------------------- | ------------------------------------------------------ | -------------- |
| **`types/<entidad>.ts`**           | Interface que espeja el modelo del backend             | ✅ Sí          |
| **`schemas/<entidad>.schema.ts`**  | Zod + `emptyValues` + `toFormValues()`                 | ✅ Sí          |
| **`store/api.ts` para tu entidad** | 5 endpoints RTK Query + hooks                          | ✅ Sí          |
| **`<EntidadCard>.tsx`**            | Card presentacional del listado                        | ✅ Sí          |
| **`<EntidadForm>.tsx`**            | Formulario en Admin con RHF + Zod                      | ✅ Sí          |
| **`<EntidadDetail>.tsx`**          | Vista de detalle (`/entidad/:id`)                      | ✅ Sí          |
| **`pages/Home.tsx` adaptada**      | Listado con tu entidad                                 | ✅ Sí          |
| **`pages/Admin.tsx` adaptada**     | ABM con tu entidad                                     | ✅ Sí          |
| **`router/index.tsx` adaptado**    | Rutas con tu entidad                                   | ✅ Sí          |
| **`Register.tsx` mejorado**        | Agregar RHF + Zod (único form sin validación frontend) | ⚠️ Recomendado |

### Deploy (Render) — nada todavía

| Qué                                                                     | Obligatorio |
| ----------------------------------------------------------------------- | ----------- |
| Web Service en Render para backend (con env vars)                       | ✅ Sí       |
| Static Site en Render para frontend                                     | ✅ Sí       |
| Rewrite `/api/*` → backend en Static Site                               | ✅ Sí       |
| Rewrite `/*` → `/index.html` en Static Site (para F5)                   | ✅ Sí       |
| OAuth App de GitHub para **producción** (callback distinto al de local) | ✅ Sí       |
| `README.md` con URLs, endpoints, usuarios de prueba                     | ✅ Sí       |

---

## 4. Opcionales que conviene sumar

| Opcional                                                     | Dificultad                                                                  | Conviene                                                             |
| ------------------------------------------------------------ | --------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| **Paginación + búsqueda en el listado**                      | Baja — el backend ya tiene `listSchema` con `page`, `limit`, `search`       | ✅ Sí, el 90% ya está hecho en el patrón de `students.controller.ts` |
| **Cambio de roles desde admin** (`authClient.admin.setRole`) | Baja — un botón en `Sessions.tsx` que ya existe                             | ✅ Sí, se agrega a la página que ya tenés                            |
| **Que cada usuario vea/edite solo sus propios registros**    | Media — guardar `createdBy: userId` en el modelo y filtrar en el controller | 🟡 Solo si el dominio lo justifica                                   |
| **Login con Google**                                         | Media — una entrada más en `socialProviders` del backend + botón en Login   | 🟡 Si llegás con tiempo                                              |

---

## 5. Resumen ejecutivo

```
BACKEND
  ✅ Infraestructura completa (server, db, auth, middlewares, types) → no tocar
  🔄 Reemplazar: model + schema + controller + routes (1 entidad, ~4 archivos)
  🗑️ Eliminar:   subjects (3 archivos) + demo.ts

FRONTEND
  ✅ Infraestructura completa (auth, router, RTK Query, páginas auth/perfil/sesiones)
  🔄 Adaptar: ~11 archivos que referencian "student" → tu entidad
  ➕ No falta ningún paquete: RHF, Zod, RTK Query, TailwindCSS ya instalados

DEPLOY
  ❌ Todo por hacer (Render Web Service, Static Site, OAuth prod, README)
```

> [!TIP]
> El trabajo real es menor al que parece: la mayoría de los archivos son **renombrar y ajustar campos**, no escribir desde cero. Los patrones (controller, RTK Query slice, form con RHF+Zod) ya están hechos y probados en clase.
