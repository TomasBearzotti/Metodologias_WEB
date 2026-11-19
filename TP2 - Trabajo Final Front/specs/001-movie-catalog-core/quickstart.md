# Quickstart & Verification Guide: Movie Catalog Core (Fase 1)

**Feature**: `001-movie-catalog-core` | **Phase**: 1 | **Date**: 2026-11-19

Esta guía detalla los pasos para levantar el entorno local, ejecutar el seeding de usuarios y datos de prueba, validar de extremo a extremo las funcionalidades de la Fase 1 y verificar la configuración de despliegue en Render.

---

## 1. Requisitos Previos

- **Node.js**: v20+ o v22+
- **MongoDB**: Instancia local corriendo o URI de MongoDB Atlas
- **Cuenta de GitHub**: OAuth App configurada para desarrollo local (Callback: `http://localhost:3000/api/auth/callback/github`)

---

## 2. Configuración de Variables de Entorno

### Backend (`backend/.env`)
Crear el archivo `backend/.env` basado en `backend/.env.example`:
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/movie-catalog
BETTER_AUTH_SECRET=un_secreto_aleatorio_de_al_menos_32_caracteres
BETTER_AUTH_URL=http://localhost:5173
GITHUB_CLIENT_ID=tu_client_id_local
GITHUB_CLIENT_SECRET=tu_client_secret_local
```

### Frontend (`frontend/.env`)
No requiere variables de entorno en el cliente: el frontend consume siempre `/api` de manera relativa, resolviéndose vía Vite proxy en desarrollo y Render rewrite en producción.

---

## 3. Instalación e Inicialización de Datos (Seeding)

### 3.1 Instalar Dependencias
```bash
# Terminal 1 - Backend
cd backend
npm install

# Terminal 2 - Frontend
cd ../frontend
npm install
```

### 3.2 Ejecutar Script de Seeding
El script de seed (`backend/src/scripts/seed.ts`) crea los dos usuarios de prueba requeridos por consigna utilizando `auth.api.signUpEmail` (asegurando la creación de credenciales y hashes en la colección `account`, y asignando el rol `admin` directamente en Mongo para el administrador) junto con un catálogo inicial de 6 películas:
```bash
cd backend
npm run seed
```
**Credenciales Creadas**:
| Rol | Email | Contraseña | Permisos |
|---|---|---|---|
| `admin` | `admin@movies.com` | `Admin123!` | CRUD completo de películas, administración de usuarios y sesiones |
| `user` | `user@movies.com` | `User123!` | Solo lectura en catálogo y ficha de detalle |

---

## 4. Ejecución en Modo Desarrollo

```bash
# Terminal 1: Iniciar Backend en http://localhost:3000
cd backend
npm run dev

# Terminal 2: Iniciar Frontend en http://localhost:5173
cd frontend
npm run dev
```

---

## 5. Escenarios de Validación End-to-End

### Escenario 1: Catálogo Público y Filtros (Usuario Anónimo)
1. Abrir `http://localhost:5173/` en el navegador.
2. Comprobar que se muestra la cuadrícula de películas iniciales (póster, título, año, género).
3. Escribir un término en el buscador (ej. "Inception"): verificar filtrado inmediato.
4. Seleccionar un género en el selector (ej. "Ciencia Ficción"): verificar que la lista se filtre.
5. Hacer clic en una tarjeta de película: comprobar redirección a `/movies/:id` con la ficha completa y botón de retorno.

### Escenario 2: Restricción de Permisos para Rol `user` (403 Forbidden)
1. Iniciar sesión con el usuario común: `user@movies.com` / `User123!`.
2. Verificar que en el encabezado aparezca el nombre del usuario y el rol `user`.
3. Intentar acceder manualmente por URL a `http://localhost:5173/admin`:
   - **Resultado esperado**: `ProtectedRoute` intercepta la navegación y redirige a `/perfil` o muestra "Acceso Denegado".
4. Simular petición de escritura (`POST /api/v1/movies`) con la cookie de sesión del usuario:
   - **Resultado esperado**: Código HTTP `403 Forbidden` (`No tenes permisos para realizar esta accion`).

### Escenario 3: Gestión de Películas (ABM) por Rol `admin`
1. Cerrar sesión e iniciar sesión como administrador: `admin@movies.com` / `Admin123!`.
2. Acceder al enlace "Admin" en el encabezado (`/admin`).
3. **Crear Película**:
   - Completar el formulario con datos válidos y guardar.
   - **Resultado esperado**: Código HTTP `201 Created`, mensaje de éxito, y la película aparece de inmediato en la tabla y en el catálogo público (`/`).
4. **Validación Zod**:
   - Intentar crear una película con campos vacíos o un año anterior a 1888.
   - **Resultado esperado**: Los campos resaltan en rojo con sus mensajes de error específicos y no se envía petición inválida al servidor.
5. **Editar Película**:
   - Modificar el título o género de una película existente y guardar.
   - **Resultado esperado**: Código HTTP `200 OK`, cambios reflejados de inmediato.
6. **Eliminar Película**:
   - Presionar "Eliminar" y confirmar.
   - **Resultado esperado**: Código HTTP `204 No Content`, la película desaparece de la tabla y del catálogo.

### Escenario 4: Persistencia de Sesión y Gestión de Sesiones
1. Con la sesión de `admin` activa, presionar `F5` en el navegador.
   - **Resultado esperado**: El usuario permanece logueado con rol `admin` sin interrupción (`useSession`).
2. Acceder a `/admin/sesiones`:
   - Verificar la lista de usuarios registrados (`admin@movies.com`, `user@movies.com`).
   - Ver sesiones activas y presionar "Revocar" en una sesión secundaria: comprobar revocación en base de datos.
3. Cambiar el rol de un usuario de `user` a `admin` mediante el selector/botón de rol y verificar la actualización.

---

## 6. Checklist de Configuración para Render

### 6.1 Backend (Web Service)
- **Root Directory**: `backend`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run start`
- **Variables de Entorno**:
  - `PORT`: `10000` (o default asignado por Render)
  - `NODE_ENV`: `production`
  - `MONGODB_URI`: Cadena de conexión a MongoDB Atlas
  - `BETTER_AUTH_SECRET`: String de 32 bytes en base64
  - `BETTER_AUTH_URL`: URL del frontend Static Site en Render (ej. `https://mi-tp2-front.onrender.com`)
  - `GITHUB_CLIENT_ID`: Client ID de la GitHub OAuth App de producción
  - `GITHUB_CLIENT_SECRET`: Client Secret de la GitHub OAuth App de producción

### 6.2 Frontend (Static Site)
- **Root Directory**: `frontend`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`
- **Redirects / Rewrites en Render (Pestaña "Redirects/Rewrites")**:
  1. **Rewrite de API**:
     - *Type*: `Rewrite`
     - *Source*: `/api/*`
     - *Destination*: `https://<tu-backend-service>.onrender.com/api/*`
  2. **SPA Fallback**:
     - *Type*: `Rewrite`
     - *Source*: `/*`
     - *Destination*: `/index.html`
