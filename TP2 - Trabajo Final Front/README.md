# Catálogo de Películas — Plataforma Web Full Stack

> Trabajo Práctico Final — Metodologías de Desarrollo Web  
> Arquitectura Monorepo: Express + TypeScript + MongoDB + Better Auth + React + Vite + TailwindCSS

---

## 📌 Descripción del Proyecto

Aplicación web integral para la exploración, calificación comunitaria y gestión de un catálogo de películas cinematográficas. Implementa autenticación múltiple (credenciales locales, GitHub OAuth y Google OAuth), autorización basada en roles (RBAC: `user` y `admin`), control estricto de propiedad sobre registros (Ownership de reseñas), formularios validados con Zod en cliente y servidor, y consumo de APIs desacoplado y desplegable en la nube (Render).

---

## 🎬 Modelo de Datos y Entidades

### Entidad Principal: `Movie` (Película)

| Campo | Tipo de Dato | Requerido | Descripción |
| :--- | :--- | :--- | :--- |
| `title` | `string` | Sí | Título de la película (máx. 150 chars) |
| `synopsis` | `string` | Sí | Sinopsis argumental o resumen (10 a 2000 chars) |
| `director` | `string` | Sí | Nombre del director o cineasta (máx. 100 chars) |
| `year` | `number` (int) | Sí | Año de estreno (rango: 1888 a 2100) |
| `genre` | `string` (enum) | Sí | Género (`Acción`, `Comedia`, `Drama`, `Ciencia Ficción`, `Terror`, etc.) |
| `posterUrl` | `string` (url) | Sí | URL pública de la imagen de póster |
| `isAvailable` | `boolean` | No (default: true) | Disponibilidad en cartelera / catálogo |
| `releaseDate` | `string` (date) | No | Fecha de estreno oficial |
| `reviews` | `Array<MovieReview>` | No (default: []) | Listado de reseñas y calificaciones comunitarias embebidas |

### Subdocumento: `MovieReview` (Reseña Embebida)

| Campo | Tipo de Dato | Descripción |
| :--- | :--- | :--- |
| `_id` | `ObjectId` (string) | Identificador único del subdocumento de la reseña |
| `userId` | `string` | ID del usuario de Better Auth que redactó la reseña (inmutable, inyectado por sesión) |
| `userName` | `string` | Nombre del autor visible al momento de publicar |
| `rating` | `number` (int) | Calificación otorgada (rango entero de 1 a 5 estrellas) |
| `comment` | `string` | Contenido de la opinión (3 a 500 caracteres) |
| `createdAt` | `Date` (ISO) | Fecha de publicación |
| `updatedAt` | `Date` (ISO) | Fecha de última edición |

---

## 🧱 Stack Tecnológico

### Backend (`/backend`)
- **Runtime**: Node.js v20+ / TypeScript
- **Framework**: Express 5
- **Base de Datos**: MongoDB Atlas con Mongoose ODM (colecciones `movies`, `user`, `session`, `account`)
- **Autenticación**: [Better Auth](https://better-auth.com) con plugins `admin` y proveedores sociales GitHub y Google
- **Validación**: Zod v4 con middleware genérico `validateBody` y esquemas estrictos
- **Manejo de Errores**: Códigos HTTP canónicos (200, 201, 204, 400, 401, 403, 404, 500)

### Frontend (`/frontend`)
- **Framework & Bundler**: React 19 + Vite 6 + TypeScript
- **Gestión de Estado & Cache**: Redux Toolkit + RTK Query (`moviesApi` con invalidación de tags `Movies` y `MyReviews`)
- **Formularios**: React Hook Form con resolver de Zod (`@hookform/resolvers/zod`)
- **Autenticación en Cliente**: `@better-auth/react` (`useSession`, `signIn.email`, `signIn.social`, `authClient.admin`)
- **Estilos**: TailwindCSS v4 + diseño responsivo + SVGs nativos

---

## 🔑 Credenciales de Prueba (Seed)

El script de inicialización (`npm run seed`) crea dos cuentas predeterminadas y 6 películas de prueba:

| Rol | Correo Electrónico | Contraseña | Permisos |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin@movies.com` | `Admin123!` | Acceso completo al panel `/admin` (ABM de películas) y `/admin/usuarios` (gestión de roles con `setRole` y revocación de sesiones). Moderación y eliminación de cualquier reseña (código 204). CRUD completo en la API. |
| **Usuario Estándar** | `user@movies.com` | `User123!` | Exploración del catálogo, búsqueda, filtros y detalle de películas. Publicación de reseñas (máx. 1 por película). Control exclusivo de autoría sobre sus propias reseñas (edición y borrado en `/mis-reseñas`). Acceso denegado a rutas administrativas. |

---

## 📡 Endpoints de la API REST

Prefijos base: `/api/v1/movies` y `/api/v1/reviews`

| Método | Endpoint | Rol / Acceso Requerido | Descripción | Códigos HTTP |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/movies` | Público | Lista de películas con soporte de búsqueda (`?search=`) y filtro por género (`?genre=`) | `200` |
| `GET` | `/api/v1/movies/:id` | Público | Detalle técnico de una película con su listado de reseñas embebidas | `200`, `400`, `404` |
| `POST` | `/api/v1/movies` | `admin` | Crea una nueva película validada con esquema Zod | `201`, `400`, `401`, `403` |
| `PUT` | `/api/v1/movies/:id` | `admin` | Actualiza una película existente | `200`, `400`, `401`, `403`, `404` |
| `DELETE` | `/api/v1/movies/:id` | `admin` | Elimina una película permanentemente de la base de datos | `204`, `400`, `401`, `403`, `404` |
| `POST` | `/api/v1/movies/:id/reviews` | Usuario autenticado | Publica una reseña (1 a 5 estrellas, 3 a 500 chars). Máximo 1 por usuario | `201`, `400` (ya opinó o Zod error), `401`, `404` |
| `PUT` | `/api/v1/movies/:id/reviews/:reviewId` | **Solo Autor** | Modifica calificación o comentario. Terceros reciben 403 | `200`, `400`, `401`, `403 Forbidden`, `404` |
| `DELETE` | `/api/v1/movies/:id/reviews/:reviewId` | **Autor O Admin** | Elimina la reseña. Terceros reciben 403 | `204`, `401`, `403 Forbidden`, `404` |
| `GET` | `/api/v1/reviews/me` | Usuario autenticado | Retorna todas las reseñas redactadas por el usuario autenticado con datos de la película | `200`, `401` |

### Matriz de Permisos y Control de Propiedad (Ownership)

| Operación | Anónimo | Usuario Común (`user`) | Autor de la Reseña | Administrador (`admin`) |
| :--- | :---: | :---: | :---: | :---: |
| **Ver reseñas y promedio** | Permitido | Permitido | Permitido | Permitido |
| **Publicar reseña** | `401` | Permitido (1 vez/película) | `400` (si ya opinó) | Permitido (1 vez/película) |
| **Editar reseña** | `401` | `403 Forbidden` | **Permitido** | `403 Forbidden` (salvo si es propia) |
| **Eliminar reseña** | `401` | `403 Forbidden` | **Permitido** | **Permitido** (moderación) |
| **Ver "Mis Reseñas"** | `401` | Permitido | Permitido | Permitido |
| **Cambiar roles (`setRole`)** | `401` | `403 Forbidden` | `403 Forbidden` | **Permitido** (`/admin/usuarios`) |

---

## 🚀 Instalación y Ejecución Local

### 1. Clonar el repositorio y navegar a la carpeta raíz
```bash
git clone <url-del-repositorio>
cd "TP2 - Trabajo Final Front"
```

### 2. Configurar variables de entorno

#### Backend (`backend/.env`):
Copiar la plantilla desde `backend/.env.example`:
```bash
cp backend/.env.example backend/.env
```
Completar las variables requeridas en `backend/.env`:
```env
PORT=3000
MONGODB_URI=mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/movies_db?retryWrites=true&w=majority
FRONTEND_URL=http://localhost:5173
BETTER_AUTH_SECRET=super_secret_session_key_min_32_characters_long
BETTER_AUTH_URL=http://localhost:3000

# Opcional para habilitar login con GitHub en local:
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Opcional para habilitar login con Google en local:
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

> **Nota sobre proveedores sociales**: Si `GOOGLE_CLIENT_ID` o `GITHUB_CLIENT_ID` se dejan vacíos en local, el servidor arranca normalmente permitiendo login y registro por email/contraseña. En cuanto se completan las variables en `.env`, los botones sociales quedan activos automáticamente.

### 3. Instalar dependencias
```bash
# Backend
npm --prefix backend install

# Frontend
npm --prefix frontend install
```

### 4. Sembrar la base de datos (Seed inicial)
Ejecutar el script idempotente que crea los usuarios de prueba y las 6 películas iniciales:
```bash
npm --prefix backend run seed
```

### 5. Iniciar ambos servidores en modo desarrollo
En terminales separadas:
```bash
# Terminal 1 - Backend (escucha en http://localhost:3000)
npm --prefix backend run dev

# Terminal 2 - Frontend (escucha en http://localhost:5173)
npm --prefix frontend run dev
```

Abrir [http://localhost:5173](http://localhost:5173) en el navegador.

---

## 🌐 Guía de Despliegue en Render

### 1. Servicio Web para Backend (Web Service)
1. Conectar el repositorio en Render y seleccionar **New +** > **Web Service**.
2. **Root Directory**: `backend`
3. **Environment**: `Node`
4. **Build Command**: `npm install && npm run build`
5. **Start Command**: `npm start`
6. **Environment Variables**:
   - `NODE_ENV`: `production`
   - `PORT`: `3000` (o el asignado automáticamente)
   - `MONGODB_URI`: Cadena de conexión de MongoDB Atlas
   - `BETTER_AUTH_SECRET`: Cadena aleatoria de 32+ caracteres
   - `BETTER_AUTH_URL`: URL pública asignada por Render al backend (ej: `https://mi-movies-backend.onrender.com`)
   - `FRONTEND_URL`: URL pública asignada por Render al frontend (ej: `https://mi-movies-frontend.onrender.com`)
   - `GITHUB_CLIENT_ID` y `GITHUB_CLIENT_SECRET`: Credenciales de GitHub OAuth (callback `https://<backend>.onrender.com/api/auth/callback/github`)
   - `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`: Credenciales de Google OAuth (callback `https://<backend>.onrender.com/api/auth/callback/google`)

### 2. Sitio Estático para Frontend (Static Site)
1. Seleccionar **New +** > **Static Site**.
2. **Root Directory**: `frontend`
3. **Build Command**: `npm install && npm run build`
4. **Publish Directory**: `dist`
5. **Configuración de Rewrites & Redirects** (en la pestaña *Redirects/Rewrites* de Render):
   - **Regla 1 (Proxy de API)**:
     - **Source**: `/api/*`
     - **Destination**: `https://<tu-backend-service>.onrender.com/api/*`
     - **Action**: `Rewrite`
   - **Regla 2 (SPA Fallback)**:
     - **Source**: `/*`
     - **Destination**: `/index.html`
     - **Action**: `Rewrite`

---

## 🧪 Verificación y Scripts Disponibles

| Comando | Directorio | Descripción |
| :--- | :--- | :--- |
| `npm run dev` | `backend/` | Inicia el backend con recarga en caliente (`tsx watch`) |
| `npm run build` | `backend/` | Compila TypeScript a JavaScript en `backend/dist` |
| `npm run seed` | `backend/` | Puebla MongoDB con cuentas y catálogo inicial |
| `npm run dev` | `frontend/` | Inicia Vite en modo desarrollo con proxy `/api` |
| `npm run build` | `frontend/` | Compila TypeScript y genera bundle optimizado en `frontend/dist` |
| `npx oxlint` | `frontend/` | Análisis estático y linter ultra-rápido de código React/TS |

---

## 👥 Autores
- Tomas Bearzotti
- Proyecto desarrollado para la materia **Metodologías de Desarrollo Web** — UAI.
