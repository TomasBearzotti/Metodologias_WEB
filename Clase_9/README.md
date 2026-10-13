# Clase 9 - Rutas públicas y protegidas

El proyecto está dividido en dos aplicaciones independientes:

```text
Clase_9/
├── backend/   # Node.js + Express + TypeScript
└── frontend/  # React + React Router + TypeScript + Vite
```

## Backend

Desde `backend/`:

```bash
npm install
npm run dev
```

El backend se inicia por defecto en `http://localhost:3000`. Se deben completar las
variables de `backend/.env` tomando como referencia `backend/.env.example`.

Además de las rutas existentes, la autenticación expone:

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me` (requiere una sesión válida)

Las APIs de estudiantes y materias requieren sesión. Sus operaciones de lectura
están disponibles para `USER` y `ADMIN`; las operaciones de creación,
actualización y eliminación requieren el rol `ADMIN`.

La búsqueda de estudiantes conserva el método HTTP `QUERY`:

- `QUERY /api/students` con los filtros en el body.

`GET /api/auth/me` valida las cookies `httpOnly` y devuelve el usuario actual sin
exponer los tokens al frontend.

## Frontend

Desde `frontend/`:

```bash
npm install
npm run dev
```

El frontend se inicia por defecto en `http://localhost:5173` y utiliza
`http://localhost:3000` como backend. Para cambiarlo, crear `frontend/.env` con:

```env
VITE_API_URL=http://localhost:3000
```

## Rutas del frontend

- `/`: ruta pública de inicio. Consulta la sesión y redirige al dashboard correspondiente.
- `/login`: inicio de sesión público.
- `/dashboard`: ruta privada para cualquier usuario autenticado.
- `/dashboard-admin`: ruta privada disponible únicamente para usuarios con rol `ADMIN`.

Las solicitudes incluyen credenciales para que el backend gestione las cookies de
sesión. Las cookies son `httpOnly`, por lo que el frontend conoce la sesión mediante
`GET /api/auth/me` y no leyendo los tokens directamente.

## Verificación

```bash
cd backend
npm run build

cd ../frontend
npm run build
```
