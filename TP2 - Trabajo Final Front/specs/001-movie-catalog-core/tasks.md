---
description: "Task list for Movie Catalog Core (Fase 1) implementation"
---

# Tasks: Movie Catalog Core (Fase 1)

**Input**: Design documents from `specs/001-movie-catalog-core/`  
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/movies-api.yaml](./contracts/movies-api.yaml), [quickstart.md](./quickstart.md)  
**Organization**: Las tareas están agrupadas por fases y por historia de usuario para permitir desarrollo incremental e independiente.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Ejecutable en paralelo (archivos distintos, sin dependencias pendientes).
- **[Story]**: Identificador de historia de usuario (`[US1]`, `[US2]`, `[US3]`, `[US4]`). Las fases Setup, Foundational y Polish no llevan etiqueta de historia.
- Todas las tareas incluyen rutas absolutas o relativas al repositorio exactas.

---

## Phase 1: Setup (Limpieza e Infraestructura Compartida)

**Propósito**: Saneamiento de artefactos legados de la materia y preparación de la configuración base.

- [x] T001 Eliminar modelos, controladores, rutas y esquemas legados de clase en `backend/src/models/Subject.ts`, `backend/src/models/Student.ts`, `backend/src/schemas/subject.schema.ts`, `backend/src/schemas/student.schema.ts`, `backend/src/controllers/subjects.controller.ts`, `backend/src/controllers/students.controller.ts`, `backend/src/routes/subjects.routes.ts`, `backend/src/routes/students.routes.ts` y `backend/src/demo.ts`
- [x] T002 Eliminar componentes, páginas, tipos y esquemas legados de clase en `frontend/src/components/StudentCard.tsx`, `frontend/src/components/admin/StudentForm.tsx`, `frontend/src/pages/StudentDetail.tsx`, `frontend/src/schemas/student.schema.ts` y `frontend/src/types/student.ts`
- [x] T003 [P] Actualizar plantilla de variables de entorno en `backend/.env.example` con las claves canónicas (`PORT`, `NODE_ENV`, `MONGODB_URI`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`)
- [x] T004 [P] Agregar script de ejecución de seed `"seed": "tsx src/scripts/seed.ts"` en `backend/package.json`

---

## Phase 2: Foundational (Prerrequisitos Bloqueantes)

**Propósito**: Modelos base, esquemas Zod, interfaces TypeScript y script de seed requeridos antes de implementar las historias de usuario.

**⚠️ CRÍTICO**: Ninguna historia de usuario puede comenzar hasta completar esta fase.

- [x] T005 [P] Crear modelo Mongoose `Movie` en `backend/src/models/Movie.ts` con campos `title` (String, required, max 150), `synopsis` (String, required, max 2000), `director` (String, required, max 100), `year` (Number, required, min 1888, max current year + 2), `genre` (String, required), `posterUrl` (String, required), `isAvailable` (Boolean, default true), `releaseDate` (Date, default Date.now), timestamps, índices en title/director y subdocumento `reviews` embebido con `default: []` para soporte de Fase 2
- [x] T006 [P] Crear esquemas de validación Zod en `backend/src/schemas/movie.schema.ts` conteniendo `createMovieSchema` (`title` 1-150 chars, `synopsis` 10-2000 chars, `director` 2-100 chars, `year` con `z.coerce.number().int().min(1888)`, `genre`, `posterUrl` url válida, `isAvailable`, `releaseDate` - omitiendo `reviews`), `updateMovieSchema` (`createMovieSchema.partial()`) y `listMoviesQuerySchema` (`search`, `genre`, `page`, `limit`, `sortBy`, `sortOrder`)
- [x] T007 [P] Crear interfaces y tipos de TypeScript en `frontend/src/types/movie.ts` definiendo `Movie`, `MovieReview`, `MovieFilters` y `Paginated<T>`
- [x] T008 [P] Crear esquemas Zod de formulario en `frontend/src/schemas/movie.schema.ts` definiendo `movieFormSchema` con `z.coerce.number()` para `year`, `defaultMovieFormValues` y lista de géneros `GENRES`
- [x] T009 Crear script idempotente `backend/src/scripts/seed.ts` que conecte a MongoDB, registre `admin@movies.com` (pass `Admin123!`) y `user@movies.com` (pass `User123!`) mediante `auth.api.signUpEmail`, actualice `role: "admin"` directamente en la colección `user` de Mongo para el admin, e inserte 6 películas iniciales
- [x] T010 Actualizar router central `backend/src/routes/index.ts` desmontando las rutas legadas de `students` y `subjects`, y preparando el montaje exclusivo de `/movies`

**Checkpoint**: Base lista — las historias de usuario pueden implementarse a continuación.

---

## Phase 3: User Story 1 - Exploración y Consulta del Catálogo de Películas (Priority: P1) 🎯 MVP

**Meta**: Permitir a visitantes y usuarios consultar el catálogo de películas en cuadrícula responsiva, filtrar por género, buscar por título/director y acceder a la ficha de detalle individual.

**Prueba Independiente**: Acceder a `http://localhost:5173/`, verificar la carga de películas del catálogo, aplicar filtro de género y búsqueda por texto, y abrir una película para ver su ficha completa en `/movies/:id` sin requerir login.

- [x] T011 [P] [US1] Implementar controladores de lectura `listMovies` (con soporte para `search`, `genre`, `page`, `limit`, `sortBy`, `sortOrder` devolviendo status 200 y meta paginado) y `getMovieById` (status 200 si existe, 400 si ID no es ObjectId válido, 404 si no existe) en `backend/src/controllers/movies.controller.ts`
- [x] T012 [US1] Crear router de películas en `backend/src/routes/movies.routes.ts` exponiendo las rutas públicas `GET /` y `GET /:id` asociadas a sus respectivos controladores, y montarlo en `backend/src/routes/index.ts`
- [x] T013 [P] [US1] Implementar `moviesApi` en `frontend/src/store/api.ts` definiendo los endpoints de consulta `getMovies` (`GET /movies` con params) y `getMovieById` (`GET /movies/:id`) con tag `Movies`
- [x] T014 [US1] Registrar el reducer y middleware de `moviesApi` en `frontend/src/store/index.ts` reemplazando la referencia legada de `studentsApi`
- [x] T015 [P] [US1] Crear componente de tarjeta visual `MovieCard.tsx` en `frontend/src/components/MovieCard.tsx` mostrando póster con fallback de imagen rota, título, año de estreno, género y enlace al detalle
- [x] T016 [US1] Implementar página principal de catálogo en `frontend/src/pages/Home.tsx` con barra de búsqueda por texto, selector de género y cuadrícula de componentes `MovieCard` con estados de carga y lista vacía
- [x] T017 [P] [US1] Implementar vista de detalle de película en `frontend/src/pages/MovieDetail.tsx` consumiendo `useGetMovieByIdQuery`, mostrando póster ampliado, título, sinopsis completa, director, año, género, disponibilidad y botón para volver al catálogo
- [x] T018 [US1] Configurar rutas públicas `/` y `/movies/:id` en `frontend/src/router/index.tsx` y actualizar identidad visual y enlaces de navegación en `frontend/src/layouts/Layout.tsx`

**Checkpoint**: MVP operativo. El catálogo público y la vista de detalle funcionan de forma autónoma.

---

## Phase 4: User Story 2 - Autenticación y Persistencia de Sesión (Priority: P2)

**Meta**: Proveer registro de nuevos usuarios, login por credenciales locales y GitHub OAuth, persistencia de sesión con `useSession` y cierre de sesión.

**Prueba Independiente**: Registrar un nuevo usuario, iniciar sesión con credenciales y con GitHub, verificar que la sesión persiste tras presionar F5, inspeccionar la información de perfil y ejecutar logout.

- [X] T019 [US2] Adaptar la vista de inicio de sesión en `frontend/src/pages/Login.tsx` para admitir autenticación por correo/contraseña y botón de inicio con GitHub OAuth, gestionando errores y redireccionando al catálogo tras el login exitoso
- [X] T020 [P] [US2] Adaptar la vista de registro en `frontend/src/pages/Register.tsx` utilizando React Hook Form con validaciones de email y longitud mínima de contraseña, e invocando `authClient.signUp.email` con redirección automática
- [X] T021 [P] [US2] Adaptar la página de perfil en `frontend/src/pages/Profile.tsx` para exhibir el nombre de usuario, email, insignia de rol (`user` o `admin`) y cuentas sociales vinculadas
- [X] T022 [US2] Actualizar el encabezado en `frontend/src/layouts/Layout.tsx` para reflejar el estado de autenticación dinámico mediante `useSession()`, mostrando botones de Login/Registro si no hay sesión, o nombre, badge de rol y botón de SignOut si está autenticado

**Checkpoint**: Autenticación y control de sesión completamente operativos e integrados al frontend.

---

## Phase 5: User Story 3 - Panel de Administración y ABM de Películas (Priority: P3)

**Meta**: Implementar el panel de administración exclusivo para usuarios con rol `admin`, permitiendo el alta, edición y eliminación de películas con validación estricta por Zod y retroalimentación inmediata.

**Prueba Independiente**: Iniciar sesión como `admin@movies.com`, ingresar a `/admin`, crear una nueva película validando errores de campo, editar sus datos, eliminar un registro, y verificar que un usuario con rol `user` reciba 403 Forbidden y sea interceptado por `ProtectedRoute`.

- [X] T023 [P] [US3] Implementar controladores de mutación `createMovie` (status 201), `updateMovie` (status 200, 400 si ID o body inválido, 404 si no existe) y `deleteMovie` (status 204, 400 si ID inválido, 404 si no existe) en `backend/src/controllers/movies.controller.ts`
- [X] T024 [US3] Agregar rutas de escritura en `backend/src/routes/movies.routes.ts` protegiendo `POST /` con `validateBody(createMovieSchema)`, `PUT /:id` con `validateBody(updateMovieSchema)` y `DELETE /:id`, aplicando en todas ellas la cadena de seguridad `[authMiddleware, requireRole("admin")]`
- [X] T025 [P] [US3] Agregar mutaciones `createMovie`, `updateMovie` y `deleteMovie` en `frontend/src/store/api.ts` configurando `invalidatesTags: ["Movies"]` para actualización automática de la caché
- [X] T026 [P] [US3] Crear componente de formulario `MovieForm.tsx` en `frontend/src/components/admin/MovieForm.tsx` con React Hook Form y `@hookform/resolvers/zod` usando `movieFormSchema`, inputs controlados con `{ valueAsNumber: true }` para el año, selector de género y mensajes de error visibles por campo
- [X] T027 [US3] Implementar página de administración en `frontend/src/pages/Admin.tsx` con tabla interactiva de películas (póster miniatura, título, año, género, disponibilidad), modal o panel para crear/editar con `MovieForm`, y botón de eliminación con confirmación
- [X] T028 [US3] Configurar ruta protegida `/admin` en `frontend/src/router/index.tsx` mediante `ProtectedRoute` con `roles={["admin"]}` y `redirectTo="/perfil"`, agregando el acceso directo a "Admin" en la barra de navegación de `frontend/src/layouts/Layout.tsx` solo visible para administradores

**Checkpoint**: ABM administrativo de películas 100% operativo con RBAC estricto en backend y frontend.

---

## Phase 6: User Story 4 - Administración de Usuarios, Roles y Sesiones (Priority: P4)

**Meta**: Proveer a los administradores herramientas para auditar usuarios, revocar sesiones activas y modificar roles (`authClient.admin.setRole`).

**Prueba Independiente**: Ingresar a `/admin/sesiones` con usuario admin, ver el listado de usuarios, promover un usuario común a `admin`, verificar el cambio en MongoDB, y revocar una sesión secundaria.

- [X] T029 [US4] Extender la página `Sessions.tsx` en `frontend/src/pages/Sessions.tsx` agregando control/botón para alternar el rol de los usuarios entre `user` y `admin` mediante `authClient.admin.setRole({ userId, role })` y mostrando notificación del cambio
- [X] T030 [US4] Asegurar el montaje de la ruta `/admin/sesiones` en `frontend/src/router/index.tsx` bajo la guarda de rol `admin` y añadir enlace de navegación en `frontend/src/layouts/Layout.tsx`

**Checkpoint**: Control de usuarios, roles y sesiones plenamente operativo.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Propósito**: Compilación limpia, linting, documentación completa para entrega y verificación integral.

- [X] T031 [P] Ejecutar compilación de TypeScript en backend (`npm run build` en `backend/`) y en frontend (`npm run build` en `frontend/`) verificando 0 errores de tipado
- [X] T032 [P] Ejecutar linter en frontend (`npx oxlint` en `frontend/`) asegurando ausencia de advertencias o errores de sintaxis
- [X] T033 [P] Documentar el proyecto en `README.md` con descripción general de la aplicación de películas, tabla completa de endpoints de la API con sus roles y métodos, credenciales de los usuarios de prueba (`admin` y `user`), instrucciones de ejecución local y guía de despliegue en Render (Web Service y Static Site con rewrites)
- [X] T034 Ejecutar validación final end-to-end siguiendo los 4 escenarios de `specs/001-movie-catalog-core/quickstart.md` (catálogo público, restricción 403 para usuarios normales, ABM por admin con Zod y persistencia de sesión)

---

## Dependencies & Execution Order

### Dependencias entre Fases

1. **Setup (Phase 1)**: Puede ejecutarse de inmediato. Limpia artefactos obsoletos.
2. **Foundational (Phase 2)**: Depende de Phase 1. **Bloquea todas las historias de usuario**.
3. **User Story 1 (Phase 3 - P1 🎯 MVP)**: Depende de Phase 2. No depende de otras historias.
4. **User Story 2 (Phase 4 - P2)**: Depende de Phase 2. Se integra con la barra de navegación de US1.
5. **User Story 3 (Phase 5 - P3)**: Depende de Phase 2, US1 (capa de datos `moviesApi`) y US2 (sesión admin).
6. **User Story 4 (Phase 6 - P4)**: Depende de Phase 2 y US2 (adminClient).
7. **Polish (Phase 7)**: Depende de la finalización de todas las historias anteriores.

---

## Parallel Opportunities

- **Fase 1**: T003 (`.env.example`) y T004 (`package.json`) pueden ejecutarse en paralelo tras T001 y T002.
- **Fase 2**: T005 (`Movie.ts`), T006 (`movie.schema.ts`), T007 (`types/movie.ts`) y T008 (`schemas/movie.schema.ts`) pueden implementarse en paralelo.
- **Fase 3 (US1)**:
  - T011 (controller backend) y T013 (`moviesApi` front) pueden desarrollarse en paralelo.
  - T015 (`MovieCard.tsx`) y T017 (`MovieDetail.tsx`) pueden desarrollarse en paralelo.
- **Fase 5 (US3)**:
  - T023 (mutations controller) y T025 (`moviesApi` mutations) pueden desarrollarse en paralelo.
  - T026 (`MovieForm.tsx`) puede desarrollarse en paralelo con el backend de escritura.
- **Fase 7**: T031 (typecheck), T032 (lint) y T033 (`README.md`) pueden ejecutarse en paralelo.

---

## Implementation Strategy

### Estrategia MVP Incremental

1. **Paso 1**: Completar Setup (Fase 1) y Foundational (Fase 2). Ejecutar `npm run seed`.
2. **Paso 2**: Implementar User Story 1 (Fase 3). Validar catálogo público y detalle. ¡MVP listo para demo!
3. **Paso 3**: Implementar User Story 2 (Fase 4). Validar registro, login, GitHub OAuth y sesión.
4. **Paso 4**: Implementar User Story 3 (Fase 5). Validar ABM de películas y seguridad RBAC (`admin` vs `user`).
5. **Paso 5**: Implementar User Story 4 (Fase 6). Validar cambio de rol y revocación de sesiones.
6. **Paso 6**: Ejecutar Polish (Fase 7) y validar contra `quickstart.md`.
