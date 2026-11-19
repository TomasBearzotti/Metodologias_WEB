# Catálogo de Películas — Plataforma Web Full Stack

> Trabajo Práctico Final — Metodologías de Desarrollo Web  
> Arquitectura Monorepo: Express + TypeScript + MongoDB + Better Auth + React + Vite + TailwindCSS

---

## 📌 Descripción del Proyecto

Aplicación web integral para la gestión y exploración de un catálogo de películas cinematográficas. Implementa autenticación robusta (credenciales y GitHub OAuth), autorización basada en roles (RBAC: `user` y `admin`), formularios validados con esquemas Zod en cliente y servidor, y consumo de APIs mediante arquitectura desacoplada y desplegable en la nube (Render).

### Entidad Principal: `Movie` (Película)

| Campo         | Tipo de Dato    | Requerido          | Descripción                                                              |
| :------------ | :-------------- | :----------------- | :----------------------------------------------------------------------- |
| `title`       | `string`        | Sí                 | Título de la película                                                    |
| `synopsis`    | `string`        | Sí                 | Sinopsis argumental o resumen                                            |
| `director`    | `string`        | Sí                 | Nombre del director o cineasta                                           |
| `year`        | `number` (int)  | Sí                 | Año de estreno (rango: 1888 a 2100)                                      |
| `genre`       | `string` (enum) | Sí                 | Género (`Acción`, `Comedia`, `Drama`, `Ciencia Ficción`, `Terror`, etc.) |
| `posterUrl`   | `string` (url)  | Sí                 | URL pública de la imagen de póster                                       |
| `isAvailable` | `boolean`       | No (default: true) | Disponibilidad en cartelera / catálogo                                   |
| `releaseDate` | `string` (date) | No                 | Fecha de estreno oficial                                                 |
| `reviews`     | `Array<Review>` | No (default: [])   | Reseñas y calificaciones (preparado para Fase 2)                         |

---

## 🧱 Stack Tecnológico

### Backend (`/backend`)

- **Runtime**: Node.js v20+ / TypeScript
- **Framework**: Express 5
- **Base de Datos**: MongoDB Atlas con Mongoose ODM
- **Autenticación**: [Better Auth](https://better-auth.com) con plugin de administración (`admin`)
- **Validación**: Zod v4 con mensajes de error explícitos y middleware genérico `validateBody`
- **Manejo de Errores**: Códigos HTTP semánticos (200, 201, 204, 400, 401, 403, 404, 500)

### Frontend (`/frontend`)

- **Framework & Bundler**: React 19 + Vite 6 + TypeScript
- **Gestión de Estado & Cache**: Redux Toolkit + RTK Query (`moviesApi` con invalidación de tags)
- **Formularios**: React Hook Form con resolver de Zod (`@hookform/resolvers/zod`)
- **Autenticación en Cliente**: `@better-auth/react` (`useSession`, `authClient.signIn`, `authClient.admin`)
- **Estilos**: TailwindCSS v4 + Lucide Icons + diseño responsivo

---

## 🔑 Credenciales de Prueba (Seed)

El script de inicialización (`npm run seed`) crea dos cuentas predeterminadas y 6 películas de prueba:

| Rol                  | Correo Electrónico | Contraseña  | Permisos                                                                                                                                                          |
| :------------------- | :----------------- | :---------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Administrador**    | `admin@movies.com` | `Admin123!` | Acceso completo a `/admin` (ABM de películas) y `/admin/sesiones` (gestión de roles y revocación de sesiones). CRUD completo en la API.                           |
| **Usuario Estándar** | `user@movies.com`  | `User123!`  | Solo lectura: navegación en catálogo, búsqueda, filtros, visualización de fichas técnicas y gestión de su propio perfil. Acceso denegado a rutas administrativas. |

---

## 📡 Endpoints de la API REST

Prefijo base: `/api/v1/movies`

| Método   | Endpoint             | Rol Requerido | Descripción                                                                             | Códigos HTTP                                                       |
| :------- | :------------------- | :------------ | :-------------------------------------------------------------------------------------- | :----------------------------------------------------------------- |
| `GET`    | `/api/v1/movies`     | Público       | Lista de películas con soporte de búsqueda (`?search=`) y filtro por género (`?genre=`) | `200`                                                              |
| `GET`    | `/api/v1/movies/:id` | Público       | Obtiene el detalle técnico completo de una película por su ID de MongoDB                | `200`, `400` (ID inválido), `404` (no encontrada)                  |
| `POST`   | `/api/v1/movies`     | `admin`       | Crea una nueva película validada con esquema Zod                                        | `201`, `400` (error Zod), `401` (no autenticado), `403` (no admin) |
| `PUT`    | `/api/v1/movies/:id` | `admin`       | Actualiza los datos de una película existente                                           | `200`, `400` (ID o payload inválido), `401`, `403`, `404`          |
| `DELETE` | `/api/v1/movies/:id` | `admin`       | Elimina una película permanentemente de la base de datos                                | `204`, `400` (ID inválido), `401`, `403`, `404`                    |

### Rutas de Autenticación (`/api/auth/*`)

Gestionadas automáticamente por Better Auth:

- `POST /api/auth/sign-in/email`: Inicio de sesión con correo y contraseña.
- `POST /api/auth/sign-up/email`: Registro de nuevos usuarios con rol por defecto `user`.
- `POST /api/auth/sign-out`: Cierre de sesión y revocación del token activo.
- `GET /api/auth/get-session`: Consulta y persistencia de sesión activa con cookies `httpOnly`.
- `GET /api/auth/sign-in/social`: Inicio de sesión / vinculación con GitHub OAuth.
- `/api/auth/admin/*`: Listado de usuarios, sesiones activas, cambio de rol (`setRole`) y revocación forzada (`revokeUserSession`).

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
```

#### Frontend (`frontend/.env`):

En desarrollo local, el frontend consume rutas relativas `/api/...` gracias al proxy configurado en `frontend/vite.config.ts`.

```env
# No requiere VITE_API_URL en desarrollo (usa el proxy hacia http://localhost:3000)
```

### 3. Instalar dependencias

```bash
# Instalar dependencias del backend
npm --prefix backend install

# Instalar dependencias del frontend
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

El despliegue está optimizado para la arquitectura desacoplada de Render recomendada por la cátedra:

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
   - `GITHUB_CLIENT_ID` y `GITHUB_CLIENT_SECRET`: Credenciales de la OAuth App de GitHub (con callback `https://mi-movies-backend.onrender.com/api/auth/callback/github`)

### 2. Sitio Estático para Frontend (Static Site)

1. Seleccionar **New +** > **Static Site**.
2. **Root Directory**: `frontend`
3. **Build Command**: `npm install && npm run build`
4. **Publish Directory**: `dist`
5. **Configuración de Rewrites & Redirects** (en la pestaña _Redirects/Rewrites_ de Render):
   - **Regla 1 (Proxy de API)**:
     - **Source**: `/api/*`
     - **Destination**: `https://mi-movies-backend.onrender.com/api/*`
     - **Action**: `Rewrite`
   - **Regla 2 (SPA Fallback)**:
     - **Source**: `/*`
     - **Destination**: `/index.html`
     - **Action**: `Rewrite`

> **Importante**: Con esta configuración de rewrites, el frontend en producción sigue consumiendo `/api/v1/movies` y `/api/auth/...` de forma relativa. Esto elimina problemas de CORS y centraliza el manejo de cookies de sesión sin hardcodear URLs absolutas en el código.

---

## 🧪 Verificación y Scripts Disponibles

| Comando         | Directorio  | Descripción                                                      |
| :-------------- | :---------- | :--------------------------------------------------------------- |
| `npm run dev`   | `backend/`  | Inicia el backend con recarga en caliente (`tsx watch`)          |
| `npm run build` | `backend/`  | Compila TypeScript a JavaScript en `backend/dist`                |
| `npm run seed`  | `backend/`  | Puebla MongoDB con cuentas y catálogo inicial                    |
| `npm run dev`   | `frontend/` | Inicia Vite en modo desarrollo con proxy `/api`                  |
| `npm run build` | `frontend/` | Compila TypeScript y genera bundle optimizado en `frontend/dist` |
| `npx oxlint`    | `frontend/` | Análisis estático y linter ultra-rápido de código React/TS       |

---

## 👥 Autores

- Proyecto desarrollado para la materia **Metodologías de Desarrollo Web** — Universidad Tecnológica Nacional.
