# Implementation Plan: Reseñas con Propiedad por Usuario, Login con Google y Gestión de Roles (Fase 2)

**Branch**: `002-reviews-and-ownership` | **Date**: 2026-11-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/002-reviews-and-ownership/spec.md`

---

## Summary

La Fase 2 implementa la capa interactiva de la plataforma:

1. **Sistema de Reseñas y Control de Propiedad (Ownership)**: Subdocumentos embebidos en el modelo `Movie`, con endpoints para crear (`POST`, calif. 1-5 y comentario 3-500, max 1 reseña por usuario), editar (`PUT`, solo autor, 403 para otros), eliminar (`DELETE`, autor o admin, 403 para otros) y listar registros propios (`GET /api/v1/reviews/me`).
2. **Frontend Interactivo**: Calificación promedio en `MovieDetail.tsx`, selector de estrellas y formulario con React Hook Form + Zod, visibilidad condicional de botones según autoría/rol, y nueva vista privada "Mis Reseñas" (`/mis-reseñas`).
3. **Autenticación con Google**: Configuración del proveedor `google` en `better-auth` conviviendo con GitHub y email/contraseña, y botón "Continuar con Google" en `Login.tsx` y `Register.tsx`.
4. **Administración de Roles**: Consolidación y mejora de navegación en `/admin/usuarios` con confirmación preventiva contra auto-degradación.

---

## Technical Context

**Language/Version**: TypeScript 5.8+ en Node.js v20+ (ESM) para backend; TypeScript 5.8+ con React 19 y Vite 6 para frontend.  
**Primary Dependencies**:

- Backend: Express 5, Mongoose 8+, Zod v4, Better Auth 1.2+ con plugin `admin` y adaptador MongoDB.
- Frontend: React 19, Redux Toolkit (RTK Query), React Hook Form, `@hookform/resolvers/zod`, `@better-auth/react`, TailwindCSS v4, Lucide React.  
  **Storage**: MongoDB Atlas con base de datos unificada (colecciones `movies`, `user`, `session`, `account`). Reseñas embebidas en `Movie`.  
  **Testing**: Pruebas de integración manual y validación end-to-end según `quickstart.md`, compilación `tsc` y linter `oxlint`.  
  **Target Platform**: Linux (Render Web Service para backend y Render Static Site con rewrites para frontend).  
  **Project Type**: Web Application Full Stack Monorepo (`backend/` y `frontend/`).  
  **Performance Goals**: Respuestas de reseñas y agregación en menos de 100ms; sincronización instantánea en frontend vía invalidación de tags RTK Query.  
  **Constraints**: Rutas relativas `/api/...`, 0 secretos en git, HTTP status codes estrictos (201, 204, 400, 401, 403, 404).  
  **Scale/Scope**: Catálogo con múltiples reseñas por película, soporte para miles de usuarios y sesiones.

---

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **Principio I (Monorepo & Continuidad)**: ✓ PASS. Se reutiliza la infraestructura de Express, MongoDB, Mongoose, Better Auth y middlewares existentes.
- **Principio II (Backend Contract-Driven)**: ✓ PASS. Endpoints de reseñas validados mediante `validateBody` con esquemas Zod (`createReviewSchema`, `updateReviewSchema`).
- **Principio III (Frontend Reactivo & Tipado Estricto)**: ✓ PASS. RHF + Zod en formulario de reseña, tipos en `frontend/src/types/`, cache en RTK Query con tags `Movies` y `MyReviews`.
- **Principio IV (Seguridad, RBAC & Ownership)**: ✓ PASS. Autorización estricta por propiedad: solo el autor puede editar (`review.userId === req.user.id`), solo autor o admin pueden eliminar. Códigos HTTP canónicos: 201, 204, 400, 401, 403, 404.
- **Principio V (Gestión de Secretos & Git)**: ✓ PASS. Nuevas variables `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` documentadas en `backend/.env.example` sin valores reales. Commits atómicos.
- **Principio VI (Despliegue en Render & Rutas Relativas)**: ✓ PASS. Endpoints consumidos de forma relativa (`/api/v1/movies/...`, `/api/v1/reviews/me`), compatibles con el proxy local de Vite y el rewrite en Render.

---

## Project Structure

### Documentation (this feature)

```text
specs/002-reviews-and-ownership/
├── spec.md              # Especificación de requerimientos y casos de uso
├── research.md          # Decisiones de diseño técnico y agregación
├── data-model.md        # Estructuras de datos, esquemas Mongoose y Zod
├── contracts/
│   └── reviews-api.yaml # Especificación OpenAPI 3.0 de endpoints de reseñas
├── quickstart.md        # Guía paso a paso de verificación y pruebas
├── plan.md              # Este plan de implementación
└── checklists/
    └── requirements.md  # Checklist de calidad de requerimientos
```

### Source Code Modificado y Creado

```text
backend/
├── .env.example                               # Modificar: agregar variables GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET
├── src/
│   ├── lib/
│   │   └── auth.ts                            # Modificar: habilitar proveedor social 'google' y accountLinking
│   ├── models/
│   │   └── Movie.ts                           # Modificar: actualizar IMovieReview con updatedAt y virtuales/métodos
│   ├── schemas/
│   │   └── review.schema.ts                   # Crear: esquemas Zod createReviewSchema y updateReviewSchema
│   ├── controllers/
│   │   └── reviews.controller.ts              # Crear: createReview, updateReview, deleteReview, getMyReviews
│   └── routes/
│       ├── movies.routes.ts                   # Modificar: montar sub-rutas /:id/reviews (POST, PUT, DELETE)
│       ├── reviews.routes.ts                  # Crear: ruta /me (GET) para Mis Reseñas
│       └── index.ts                           # Modificar: montar /reviews en el router central

frontend/
├── src/
│   ├── types/
│   │   └── movie.ts                           # Modificar: exportar MovieReview, UserReviewItem y promedios
│   ├── schemas/
│   │   └── review.schema.ts                   # Crear: reviewFormSchema y defaultReviewFormValues
│   ├── store/
│   │   └── api.ts                             # Modificar: mutaciones addReview, updateReview, deleteReview y getMyReviews
│   ├── components/
│   │   └── reviews/
│   │       ├── ReviewList.tsx                 # Crear: listado de reseñas con avatar, estrellas, fecha y acciones
│   │       ├── ReviewForm.tsx                 # Crear: formulario interactivo con selector de 5 estrellas
│   │       └── StarRating.tsx                 # Crear: componente visual reusable de estrellas interactivas/solo lectura
│   ├── pages/
│   │   ├── MovieDetail.tsx                    # Modificar: integrar sección de reseñas, promedio y formulario
│   │   ├── MyReviews.tsx                      # Crear: vista privada de gestión de reseñas propias
│   │   ├── Login.tsx                          # Modificar: agregar botón "Continuar con Google"
│   │   ├── Register.tsx                       # Modificar: agregar botón "Continuar con Google"
│   │   ├── Profile.tsx                        # Modificar: enlace directo o pestaña a "Mis Reseñas"
│   │   ├── Admin.tsx                          # Modificar: tabs de navegación entre "Películas" y "Usuarios y Roles"
│   │   └── Sessions.tsx                       # Modificar: asegurar título/ruta como /admin/usuarios y feedback
│   ├── layouts/
│   │   └── Layout.tsx                         # Modificar: agregar enlace "Mis Reseñas" en barra para usuarios autenticados
│   └── router/
│       └── index.tsx                          # Modificar: registrar /mis-reseñas y alias /admin/usuarios
```

---

## Complexity Tracking

| Violation | Why Needed                            | Simpler Alternative Rejected Because |
| :-------- | :------------------------------------ | :----------------------------------- |
| Ninguna   | Cumplimiento total de la constitución | N/A                                  |
