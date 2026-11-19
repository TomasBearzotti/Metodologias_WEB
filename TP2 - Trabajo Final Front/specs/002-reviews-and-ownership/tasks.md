---
description: "Task list for Reviews, Ownership & Google Auth (Fase 2) implementation"
---

# Tasks: Reseñas con Propiedad por Usuario, Login con Google y Gestión de Roles (Fase 2)

**Input**: Design documents from `specs/002-reviews-and-ownership/`  
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/reviews-api.yaml](./contracts/reviews-api.yaml), [quickstart.md](./quickstart.md)  
**Organization**: Las tareas están agrupadas por fases y por historia de usuario para permitir desarrollo incremental e independiente.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Ejecutable en paralelo (archivos distintos, sin dependencias pendientes).
- **[Story]**: Identificador de historia de usuario (`[US1]`, `[US2]`, `[US3]`, `[US4]`). Las fases Setup, Foundational y Polish no llevan etiqueta de historia.
- Todas las tareas incluyen rutas relativas al repositorio exactas.

---

## Phase 1: Setup (Infraestructura Compartida)

**Propósito**: Preparación de variables de entorno y configuración de Better Auth para el nuevo proveedor social.

- [x] T001 [P] Actualizar `backend/.env.example` agregando las claves canónicas de Google OAuth (`GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`) sin valores reales
- [x] T002 [P] Actualizar `backend/src/lib/auth.ts` configurando el proveedor `google` en `socialProviders` de forma condicional (si las variables existen) y agregando `"google"` en `account.accountLinking.trustedProviders`

---

## Phase 2: Foundational (Prerrequisitos Bloqueantes)

**Propósito**: Modelos de datos, esquemas de validación Zod e interfaces compartidas antes de implementar las historias de usuario.

**⚠️ CRÍTICO**: Ninguna historia de usuario puede comenzar hasta completar esta fase.

- [X] T003 [P] Actualizar `backend/src/models/Movie.ts` asegurando que la interfaz `IMovieReview` y el esquema `movieReviewSchema` incluyan `updatedAt: Date` y mantengan `_id: true`
- [X] T004 [P] Crear esquemas Zod en `backend/src/schemas/review.schema.ts` conteniendo `createReviewSchema` (rating entero 1-5, comment string 3-500) y `updateReviewSchema`
- [X] T005 [P] Actualizar tipos en `frontend/src/types/movie.ts` exportando `MovieReview`, `UserReviewItem` y campos calculados de reseñas
- [X] T006 [P] Crear esquemas Zod en `frontend/src/schemas/review.schema.ts` conteniendo `reviewFormSchema` y `defaultReviewFormValues`

**Checkpoint**: Base de datos, tipos y esquemas listos — las historias de usuario pueden implementarse a continuación.

---

## Phase 3: User Story 1 - Publicación y Consulta de Reseñas en Películas (Priority: P1) 🎯 MVP

**Meta**: Permitir a cualquier usuario autenticado calificar (1 a 5) y comentar una película (máximo 1 reseña por usuario), y a visitantes consultar reseñas y promedio.

**Prueba Independiente**: Abrir una película en `/movies/:id`, enviar una reseña válida con un usuario autenticado, verificar que se guarda en MongoDB (`POST /api/v1/movies/:id/reviews`, status 201), se actualiza el promedio de la película y se rechaza un segundo intento de reseña con 400 Bad Request.

- [X] T007 [P] [US1] Implementar controlador `createReview` en `backend/src/controllers/reviews.controller.ts` extrayendo `userId` y `userName` exclusivamente de `req.user`, verificando que el usuario no haya opinado previamente en la película (400 si ya existe), insertando el subdocumento y devolviendo status 201
- [X] T008 [US1] Montar la ruta `POST /:id/reviews` en `backend/src/routes/movies.routes.ts` protegiéndola con `authMiddleware` y `validateBody(createReviewSchema)`
- [X] T009 [P] [US1] Agregar mutación `addReview` en `frontend/src/store/api.ts` con endpoint `POST /movies/:id/reviews` configurando `invalidatesTags: ["Movies"]`
- [X] T010 [P] [US1] Crear componente interactivo `StarRating.tsx` en `frontend/src/components/reviews/StarRating.tsx` para selección de 1 a 5 estrellas con modo interactivo y modo solo-lectura
- [X] T011 [P] [US1] Crear componente `ReviewForm.tsx` en `frontend/src/components/reviews/ReviewForm.tsx` con React Hook Form, Zod resolver, selector de estrellas y mensaje de error por campo
- [X] T012 [P] [US1] Crear componente `ReviewList.tsx` en `frontend/src/components/reviews/ReviewList.tsx` mostrando lista de reseñas con nombre de autor, estrellas, fecha formateada y comentario
- [X] T013 [US1] Integrar en `frontend/src/pages/MovieDetail.tsx` el promedio de estrellas, contador de opiniones, renderizado de `ReviewForm` (solo visible si el usuario está autenticado y no ha opinado aún) y `ReviewList`

**Checkpoint**: MVP de reseñas operativo. Usuarios pueden opinar y consultar calificaciones.

---

## Phase 4: User Story 2 - Control de Propiedad (Ownership) y "Mis Reseñas" (Priority: P2)

**Meta**: Garantizar que solo el autor pueda editar su reseña (403 para otros), que solo el autor o un admin puedan eliminarla (403 para otros), y proveer la vista privada "Mis Reseñas".

**Prueba Independiente**: Iniciar sesión como Usuario A y crear una reseña. Iniciar sesión como Usuario B e intentar editarla o borrarla (verificar 403 Forbidden). Iniciar sesión como admin y borrarla (status 204). Ingresar a `/mis-reseñas` con Usuario A y verificar que ve solo sus propias opiniones con opciones de editar y eliminar.

- [ ] T014 [P] [US2] Implementar controladores `updateReview` (status 200, ownership estricto `review.userId === req.user.id` o 403 Forbidden) y `deleteReview` (status 204, permitido solo si `review.userId === req.user.id || req.user.role === "admin"`, 403 si no) en `backend/src/controllers/reviews.controller.ts`
- [ ] T015 [US2] Agregar rutas `PUT /:id/reviews/:reviewId` con `validateBody(updateReviewSchema)` y `DELETE /:id/reviews/:reviewId` en `backend/src/routes/movies.routes.ts` protegidas por `authMiddleware`
- [ ] T016 [P] [US2] Implementar controlador `getMyReviews` en `backend/src/controllers/reviews.controller.ts` utilizando agregación MongoDB (`$unwind` sobre `reviews` filtrando por `reviews.userId === req.user.id`) devolviendo status 200 con la lista de reseñas propias y metadata de película
- [ ] T017 [US2] Crear router `backend/src/routes/reviews.routes.ts` exponiendo `GET /me` con `authMiddleware` y montarlo en `backend/src/routes/index.ts` bajo `/reviews`
- [ ] T018 [P] [US2] Agregar mutaciones `updateReview`, `deleteReview` y query `getMyReviews` en `frontend/src/store/api.ts` proveyendo e invalidando tags `Movies` y `MyReviews`
- [ ] T019 [P] [US2] Extender `frontend/src/components/reviews/ReviewList.tsx` para mostrar botones de editar y eliminar condicionalmente (editar solo si `review.userId === currentUserId`, eliminar si es autor o `isAdmin`)
- [ ] T020 [P] [US2] Crear página `MyReviews.tsx` en `frontend/src/pages/MyReviews.tsx` consumiendo `useGetMyReviewsQuery`, mostrando tarjetas con póster, título, puntaje, comentario y modal/panel para editar o eliminar con confirmación
- [ ] T021 [US2] Registrar ruta protegida `/mis-reseñas` en `frontend/src/router/index.tsx` y agregar enlace de navegación "Mis Reseñas" en `frontend/src/layouts/Layout.tsx` visible para usuarios autenticados

**Checkpoint**: Control de autoría (Ownership) y vista privada de gestión personal plenamente funcionales.

---

## Phase 5: User Story 3 - Autenticación con Google OAuth (Priority: P3)

**Meta**: Habilitar inicio de sesión y registro social con Google delegando en Better Auth.

**Prueba Independiente**: Abrir `/login` y `/register`, verificar botón "Continuar con Google" y corroborar inicio del flujo OAuth vía `authClient.signIn.social({ provider: "google" })`.

- [ ] T022 [P] [US3] Agregar botón estilizado "Continuar con Google" en `frontend/src/pages/Login.tsx` invocando `authClient.signIn.social({ provider: "google", callbackURL: "/" })` con captura amigable de errores
- [ ] T023 [P] [US3] Agregar botón estilizado "Continuar con Google" en `frontend/src/pages/Register.tsx` invocando `authClient.signIn.social({ provider: "google", callbackURL: "/" })`

**Checkpoint**: Autenticación dual (GitHub + Google + email/contraseña) operativa.

---

## Phase 6: User Story 4 - Panel y Pestaña de Gestión de Roles para Administradores (Priority: P4)

**Meta**: Brindar a los administradores una navegación clara entre la gestión de películas y la administración de usuarios y roles (`/admin/usuarios`).

**Prueba Independiente**: Entrar a `/admin`, conmutar entre pestaña "Películas" y "Usuarios y Roles", cambiar el rol de un usuario con `authClient.admin.setRole` y verificar advertencia ante auto-degradación.

- [ ] T024 [P] [US4] Integrar barra de pestañas ("Películas" vs "Usuarios y Roles") en `frontend/src/pages/Admin.tsx` para permitir navegación fluida hacia la gestión de usuarios
- [ ] T025 [US4] Asegurar montaje de `/admin/usuarios` en `frontend/src/router/index.tsx` protegido con `roles={["admin"]}`, unificando el control de roles y sesiones

**Checkpoint**: Panel administrativo organizado y navegación fluida entre recursos.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Propósito**: Compilación limpia, linting sin advertencias, documentación de entrega y verificación integral.

- [ ] T026 [P] Ejecutar compilación estricta de TypeScript en backend (`npm run build` en `backend/`) y frontend (`npm run build` en `frontend/`) verificando 0 errores de tipado
- [ ] T027 [P] Ejecutar linter en frontend (`npx oxlint` en `frontend/`) asegurando 0 errores y 0 advertencias
- [ ] T028 [P] Actualizar `README.md` documentando los nuevos endpoints de reseñas (`/api/v1/movies/:id/reviews` y `/api/v1/reviews/me`), la matriz de permisos de autoría (Ownership), configuración de Google OAuth y guía de navegación en el panel de administración
- [ ] T029 Ejecutar validación end-to-end siguiendo los 6 escenarios descritos en `specs/002-reviews-and-ownership/quickstart.md`

---

## Dependencies & Execution Order

### Dependencias entre Fases

1. **Setup (Phase 1)**: Puede iniciarse de inmediato.
2. **Foundational (Phase 2)**: Depende de Phase 1. **Bloquea todas las historias de usuario**.
3. **User Story 1 (Phase 3 - P1 🎯 MVP)**: Depende de Phase 2. No depende de US2, US3 ni US4.
4. **User Story 2 (Phase 4 - P2)**: Depende de Phase 2 y US1 (capa base de reseñas).
5. **User Story 3 (Phase 5 - P3)**: Depende de Phase 1 (Better Auth Google config). Puede implementarse en paralelo con US1/US2.
6. **User Story 4 (Phase 6 - P4)**: Depende de Phase 2. Puede implementarse en paralelo con US1/US2.
7. **Polish (Phase 7)**: Depende de la finalización de todas las historias anteriores.

---

## Parallel Opportunities

- **Fase 1**: T001 (`.env.example`) y T002 (`auth.ts`) pueden realizarse en paralelo.
- **Fase 2**: T003 (`Movie.ts`), T004 (`review.schema.ts`), T005 (`types/movie.ts`) y T006 (`review.schema.ts`) pueden realizarse en paralelo.
- **Fase 3 (US1)**:
  - T007 (controlador backend), T009 (mutación RTK Query) y T010 (`StarRating.tsx`) pueden desarrollarse en paralelo.
  - T011 (`ReviewForm.tsx`) y T012 (`ReviewList.tsx`) pueden desarrollarse en paralelo.
- **Fase 4 (US2)**:
  - T014 (controladores update/delete) y T016 (agregación `getMyReviews`) pueden desarrollarse en paralelo.
  - T018 (mutaciones RTK Query) y T020 (`MyReviews.tsx`) pueden desarrollarse en paralelo.
- **Fase 5 (US3)**: T022 (`Login.tsx`) y T023 (`Register.tsx`) pueden desarrollarse en paralelo.
- **Fase 7**: T026 (typecheck), T027 (linter) y T028 (`README.md`) pueden realizarse en paralelo.

---

## Implementation Strategy

### Estrategia MVP Incremental

1. **Paso 1**: Completar Setup (Fase 1) y Foundational (Fase 2).
2. **Paso 2**: Implementar User Story 1 (Fase 3). Validar creación y listado de reseñas con cálculo de promedio. ¡MVP de Fase 2 listo!
3. **Paso 3**: Implementar User Story 2 (Fase 4). Validar control estricto de propiedad (código 403) y vista "Mis Reseñas".
4. **Paso 4**: Implementar User Story 3 (Fase 5). Validar botón e integración de Google OAuth.
5. **Paso 5**: Implementar User Story 4 (Fase 6). Validar navegación de roles en el panel de administración.
6. **Paso 6**: Ejecutar Polish (Fase 7) y validar contra `quickstart.md`.
