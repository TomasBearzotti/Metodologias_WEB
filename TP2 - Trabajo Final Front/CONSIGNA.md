# Consigna: Aplicación Full Stack

Armar una aplicación full stack propia, con backend y frontend, autenticación con Better Auth y desplegada en Render. Se toma como referencia el repositorio de la materia (`backend/` + `frontend/`), pero con una entidad elegida por cada alumno (Materias, Autos, blog, etc.).

## 1. Requisitos mínimos

### Repositorio

- Un repo en GitHub con la estructura `backend/` + `frontend/` (como el de la materia).
- `README.md` en la raíz con:
  - Descripción de la app y de la entidad elegida.
  - URL del frontend y del backend en Render.
  - Cómo correrlo en local (comandos y variables de entorno).
  - Tabla de endpoints de la API (método, ruta, rol requerido).
  - Dos usuarios de prueba para la corrección (email y contraseña): uno admin y uno común.
- `.env.example` en `backend/` con todas las variables, sin valores reales.
- Ningún secreto commiteado: ni `.env`, ni el `BETTER_AUTH_SECRET`, ni el secret de GitHub, ni la URI de Mongo con contraseña. Tampoco en commits viejos del historial.
- Commits chicos con mensajes descriptivos (`feat:`, `fix:`, `docs:`...), no un único commit final.

### Backend (Express + TypeScript + MongoDB)

- Una entidad propia, distinta de `students` y `subjects` (ej: libros, recetas, turnos, productos, películas). Mínimo 4 campos, usando al menos 3 tipos distintos (texto, número, fecha, booleano...).
- API RESTful con CRUD completo sobre un recurso en plural (ej: `/api/books`):

| Método          | Ruta                 |
| :-------------- | :------------------- |
| `GET`           | `/api/<recurso>`     |
| `GET`           | `/api/<recurso>/:id` |
| `POST`          | `/api/<recurso>`     |
| `PUT` / `PATCH` | `/api/<recurso>/:id` |
| `DELETE`        | `/api/<recurso>/:id` |

- Validación con Zod en crear y editar, con errores `400` claros.
- Códigos HTTP correctos: `201` al crear, `404` si no existe, `401` sin sesión, `403` sin permisos.
- Better Auth con email/contraseña y GitHub, guardando usuarios y sesiones en Mongo.
- Dos roles:
  - `user` (por defecto): todo usuario que se registra recibe este rol. Solo puede leer.
  - `admin`: puede crear, editar y eliminar.
- Las rutas de escritura (crear, editar, eliminar) protegidas con `authMiddleware` + `requireRole("admin")`. Las de lectura pueden ser públicas.

### Frontend (React + Vite + TypeScript)

- Listado y detalle de la entidad.
- Login (email y GitHub), registro y logout.
- Panel de admin con el ABM de la entidad, en una ruta protegida por rol: un usuario común no puede acceder (redirige o muestra "sin permisos").
- Formularios con React Hook Form + Zod, mostrando los errores de validación.
- Sesión con `useSession()`: al recargar la página la sesión se mantiene.

### Deploy (Render)

- Backend como **Web Service** y frontend como **Static Site**.
- El frontend llama a la API por `/api` (rewrite `/api/*` hacia el backend), no directo a la URL del backend.
- F5 en cualquier ruta del frontend funciona (rewrite `/*` → `/index.html`).
- Login con GitHub funcionando en producción (OAuth App de producción con su callback).

## 2. Opcionales (suman nota)

- Paginación, filtros o búsqueda en el listado.
- Que cada usuario vea / edite solo sus propios registros.
- Login con Google, además de GitHub.
- Página de admin para cambiar roles (`authClient.admin.setRole`).

## 3. Entrega obligatoria

1. Link al repositorio.
2. URL del frontend desplegado.
3. `README.md` explicando el proyecto.
4. Usuarios de prueba con su contraseña:

| Rol     | Email       | Contraseña |
| :------ | :---------- | :--------- |
| `admin` | `admin@...` | `...`      |
| `user`  | `user@...`  | `...`      |
