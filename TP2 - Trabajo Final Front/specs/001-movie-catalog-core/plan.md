# Implementation Plan: Movie Catalog Core (Fase 1)

**Branch**: `001-movie-catalog-core` | **Date**: 2026-11-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-movie-catalog-core/spec.md`

## Summary

Construcción del núcleo del catálogo full stack de películas (Fase 1), implementando:

1. Catálogo público con cuadrícula responsiva, búsqueda por título/director, filtrado por género y ficha de detalle de películas.
2. Autenticación completa y persistencia de sesión con Better Auth (credenciales locales y GitHub OAuth).
3. Control de acceso basado en roles (`user` por defecto con solo lectura, y `admin` con permisos completos).
4. Panel de administración con ABM de películas (formularios con React Hook Form + Zod, mensajes de error específicos por campo) y supervisión de sesiones/usuarios.
5. Depuración y limpieza de entidades legadas del proyecto de clase (`students`, `subjects`).
6. Preparación arquitectónica del modelo `Movie` para soportar el array embebido `reviews` en la Fase 2 sin migraciones ni roturas (`reviews` omitido de `createMovieSchema` e inicializado exclusivamente por Mongoose con `default: []`).
7. Manejo robusto del tipo numérico para `year` (`z.coerce.number()` en Zod y `valueAsNumber: true` en React Hook Form).
8. Script de seeding (`seed.ts`) que crea los usuarios mediante `auth.api.signUpEmail` para poblar correctamente `account` con el hash de contraseña, y actualiza `role: "admin"` directamente en Mongo para el administrador.
9. Compatibilidad total de despliegue en Render (Web Service + Static Site con rewrites `/api/*` y fallback SPA `/*`).

## Technical Context

**Language/Version**: TypeScript 5.8+ (ESM en backend y frontend), Node.js v20+ / v22+  
**Primary Dependencies**: Express 5, Mongoose 9, Better Auth 1.7+ (con `@better-auth/mongo-adapter`), Zod 4, React 19, Vite 8, Redux Toolkit 2 (RTK Query), React Hook Form 7, TailwindCSS 4  
**Storage**: MongoDB (Mongoose ODM) para películas, y Better Auth Mongo Adapter para usuarios y sesiones  
**Testing**: Verificación integral end-to-end según [quickstart.md](./quickstart.md), validación estricta de esquemas Zod, chequeo de tipos estático con `tsc --noEmit` y linting con `oxlint`  
**Target Platform**: Render (Backend como Web Service, Frontend como Static Site) + soporte de desarrollo local con Vite proxy  
**Project Type**: Monorepo de aplicación web full stack (`backend/` + `frontend/`)  
**Performance Goals**: Búsquedas y filtros en catálogo con respuesta en <1s; reflejo inmediato de mutaciones en UI mediante invalidación de tags en RTK Query  
**Constraints**:

- Queda terminantemente prohibido commitear archivos `.env` o credenciales reales.
- El frontend debe consumir la API mediante rutas relativas (`/api/...`), resolviéndose por proxy en local y por rewrite en Render.
- Las mutaciones en backend deben exigir `authMiddleware` + `requireRole("admin")`.
- Códigos HTTP estrictos: 201 en creación, 400 en error de validación con `fieldErrors`, 401 en sesión ausente, 403 en rol insuficiente, 404 en recurso inexistente.  
  **Scale/Scope**: Catálogo inicial de películas con seed de prueba, 2 usuarios de corrección (`admin` y `user`), ABM y gestión de sesiones.

## Constitution Check

_GATE: Evaluado contra `.specify/memory/constitution.md`._

| Principio                                           | Estado  | Justificación                                                                                                                                                           |
| --------------------------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **I. Arquitectura Monorepo y Continuidad**          | ✅ PASA | Se conserva el monorepo (`backend/` + `frontend/`). Se reutiliza la infraestructura intacta (`server.ts`, `db.ts`, `auth.ts`, middlewares compartidos, `Sessions.tsx`). |
| **II. Backend Contract-Driven (Zod + Better Auth)** | ✅ PASA | Rutas montadas bajo `/api/v1/movies`. Esquemas Zod para `create`, `update` (`.partial()`) y `list`. Middleware `validateBody` con respuesta `400` estructurada.         |
| **III. Frontend Reactivo, Tipado y RTK Query**      | ✅ PASA | Formularios con React Hook Form + Zod resolvers. Estado de sesión con `useSession()`. Capa de datos con `moviesApi` (RTK Query) y tags para auto-refresh.               |
| **IV. Seguridad, Roles (RBAC) y Códigos HTTP**      | ✅ PASA | Roles `user` (lectura) y `admin` (CRUD). Rutas de escritura protegidas con `authMiddleware` + `requireRole("admin")`. Códigos 201, 400, 401, 403, 404.                  |
| **V. Gestión de Secretos y Disciplina Git**         | ✅ PASA | Cero credenciales commiteadas. `.env.example` actualizado. Script de seeding para usuarios de prueba. Planificación en tareas atómicas con Conventional Commits.        |
| **VI. Despliegue en Render y Rutas Relativas**      | ✅ PASA | El front consume siempre `/api/v1`. Rewrite `/api/*` hacia el Web Service y rewrite `/*` hacia `/index.html` en Static Site.                                            |

## Project Structure

### Documentation (this feature)

```text
specs/001-movie-catalog-core/
├── plan.md              # Este plan de implementación
├── research.md          # Decisiones de arquitectura y reutilización
├── data-model.md        # Modelos Mongoose, esquemas Zod e interfaces TypeScript
├── quickstart.md        # Guía de ejecución, escenarios de prueba y config Render
├── contracts/
│   └── movies-api.yaml  # Contrato OpenAPI 3.0 para /api/v1/movies
└── checklists/
    └── requirements.md  # Checklist de validación de calidad de especificación
```

### Source Code Impact & Directory Layout

```text
backend/
├── src/
│   ├── config/
│   │   └── db.ts                         # [REUTILIZADO] Conexión Mongoose
│   ├── controllers/
│   │   ├── movies.controller.ts          # [NUEVO] CRUD de películas con búsqueda y filtros
│   │   ├── students.controller.ts        # [ELIMINAR] Entidad legada
│   │   └── subjects.controller.ts        # [ELIMINAR] Entidad legada
│   ├── lib/
│   │   └── auth.ts                       # [REUTILIZADO] Better Auth + Mongo adapter + admin plugin
│   ├── middlewares/
│   │   ├── auth.middleware.ts            # [REUTILIZADO] authMiddleware y requireRole
│   │   └── validate.ts                   # [REUTILIZADO] validateBody con Zod
│   ├── models/
│   │   ├── Movie.ts                      # [NUEVO] Modelo Mongoose con array reviews para Fase 2
│   │   ├── Student.ts                    # [ELIMINAR] Entidad legada
│   │   └── Subject.ts                    # [ELIMINAR] Entidad legada
│   ├── routes/
│   │   ├── index.ts                      # [MODIFICAR] Desmontar legados, montar /movies
│   │   ├── movies.routes.ts              # [NUEVO] Rutas públicas y protegidas con onlyAdmin
│   │   ├── students.routes.ts            # [ELIMINAR] Entidad legada
│   │   └── subjects.routes.ts            # [ELIMINAR] Entidad legada
│   ├── schemas/
│   │   ├── movie.schema.ts               # [NUEVO] Esquemas Zod create, update, list
│   │   ├── student.schema.ts             # [ELIMINAR] Entidad legada
│   │   └── subject.schema.ts             # [ELIMINAR] Entidad legada
│   ├── scripts/
│   │   └── seed.ts                       # [NUEVO] Seed con signUpEmail, role admin en Mongo y 6 películas
│   ├── types/
│   │   └── auth.types.ts                 # [REUTILIZADO] Tipos de usuario y roles
│   ├── demo.ts                           # [ELIMINAR] Archivo de demostración de clase
│   └── server.ts                         # [REUTILIZADO] Servidor Express y montaje /api/v1
├── .env.example                          # [MODIFICAR] Variables canónicas
└── package.json                          # [MODIFICAR] Agregar script "seed"

frontend/
├── src/
│   ├── components/
│   │   ├── admin/
│   │   │   ├── MovieForm.tsx             # [NUEVO] Formulario RHF + Zod para crear/editar películas
│   │   │   └── StudentForm.tsx           # [ELIMINAR] Componente legado
│   │   ├── MovieCard.tsx                 # [NUEVO] Tarjeta visual de película en catálogo
│   │   └── StudentCard.tsx               # [ELIMINAR] Componente legado
│   ├── layouts/
│   │   └── Layout.tsx                    # [MODIFICAR] Navegación para películas y panel admin
│   ├── lib/
│   │   ├── api.ts                        # [REUTILIZADO] Axios baseURL: "/api/v1"
│   │   └── auth-client.ts                # [REUTILIZADO] useSession, authClient
│   ├── pages/
│   │   ├── Admin.tsx                     # [MODIFICAR] ABM de películas con MovieForm
│   │   ├── Home.tsx                      # [MODIFICAR] Catálogo con cuadrícula, búsqueda y filtros
│   │   ├── MovieDetail.tsx               # [NUEVO] Detalle público completo de la película
│   │   ├── StudentDetail.tsx             # [ELIMINAR] Página legada
│   │   ├── Login.tsx                     # [REUTILIZADO] Login con email y GitHub
│   │   ├── Register.tsx                  # [REUTILIZADO] Registro de usuarios
│   │   ├── Profile.tsx                   # [REUTILIZADO] Perfil de usuario y rol
│   │   ├── Sessions.tsx                  # [MODIFICAR] Agregar control setRole para usuarios
│   │   └── NotFound.tsx                  # [REUTILIZADO] Vista 404
│   ├── router/
│   │   ├── index.tsx                     # [MODIFICAR] Rutas /, /movies/:id, /admin
│   │   └── ProtectedRoute.tsx            # [REUTILIZADO] Guarda de autenticación y rol
│   ├── schemas/
│   │   ├── auth.schema.ts                # [REUTILIZADO] Esquemas auth Zod
│   │   ├── movie.schema.ts               # [NUEVO] Esquema Zod + valores default para form
│   │   └── student.schema.ts             # [ELIMINAR] Esquema legado
│   ├── store/
│   │   ├── api.ts                        # [MODIFICAR] Reemplazar studentsApi por moviesApi
│   │   └── index.ts                      # [MODIFICAR] Registrar reducer y middleware de moviesApi
│   ├── types/
│   │   ├── auth.ts                       # [REUTILIZADO] Tipo UserRole
│   │   ├── movie.ts                      # [NUEVO] Interface Movie, MovieReview, MovieFilters
│   │   └── student.ts                    # [ELIMINAR] Tipo legado
│   ├── main.tsx                          # [REUTILIZADO] Montaje de providers Redux y Router
│   └── vite.config.ts                    # [REUTILIZADO] Proxy /api -> localhost:3000
└── README.md                             # [MODIFICAR] Documentación del proyecto y entrega
```

## Structure Decision

Arquitectura web desacoplada en monorepo estándar `backend/` y `frontend/`.

- El backend expone la API RESTful modularizada mediante Express routers bajo el prefijo unificado `/api/v1`.
- El frontend gestiona su estado de datos de servidor con RTK Query sobre endpoints tipados, asegurando que las mutaciones administrativas invaliden la caché y refresquen el catálogo en tiempo real.
- Las entidades legadas de clase (`students` y `subjects`) son eliminadas completamente, desacoplándolas de `routes/index.ts`, del store de Redux y del router del cliente.

## Complexity Tracking

_No se registran violaciones a la constitución del proyecto. Todos los principios se cumplen estrictamente._
