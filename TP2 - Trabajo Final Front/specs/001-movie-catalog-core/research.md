# Research & Architectural Decisions: Movie Catalog Core (Fase 1)

**Feature**: `001-movie-catalog-core` | **Phase**: 0 | **Date**: 2026-11-19

Este documento consolida las decisiones técnicas y de arquitectura para la Fase 1 del proyecto, fundamentadas en `CONSIGNA.md`, `diagnostico-tp2.md` y la constitución del proyecto (`.specify/memory/constitution.md`).

---

## 1. Reutilización de Infraestructura Existente vs. Creación de Código Nuevo

### Contexto
El repositorio base cuenta con infraestructura probada y funcionando (Express 5, conexión a MongoDB, Better Auth con adaptador de Mongo, middlewares de autorización y validación genérica, cliente de Better Auth, y gestión de sesiones).

### Decisión
Reutilizar íntegramente los componentes de infraestructura sin alterarlos y aislar el desarrollo de la entidad de dominio `Movie`:
- **Infraestructura a Reutilizar Intacta**:
  - `backend/src/server.ts`: Configuración del servidor, orden de middlewares (`Better Auth` antes de `express.json()`), prefijo `/api/v1` y healthcheck.
  - `backend/src/config/db.ts`: Conexión robusta a MongoDB con eventos de Mongoose (`connected`, `disconnected`, `error`).
  - `backend/src/lib/auth.ts`: Better Auth configurado con `mongodb` adapter, plugin `admin()` que gestiona roles (`user`, `admin`), y proveedores (credenciales y GitHub OAuth).
  - `backend/src/middlewares/auth.middleware.ts`: `authMiddleware` (extrae sesión desde MongoDB) y `requireRole(...roles)` (retorna 403 si el rol no coincide).
  - `backend/src/middlewares/validate.ts`: `validateBody(schema)` con Zod, devolviendo `400` y `details: error.flatten().fieldErrors`.
  - `backend/src/types/auth.types.ts`: Tipado global de Express (`req.user`) y `UserRole`.
  - `frontend/src/lib/auth-client.ts`: Instancia de Better Auth client con plugin `adminClient` y hook `useSession`.
  - `frontend/src/lib/api.ts`: Instancia de Axios configurada con `baseURL: "/api/v1"` y helper `getErrorMessage`.
  - `frontend/src/router/ProtectedRoute.tsx`: Guarda de rutas para react-router con soporte de validación de sesión y roles (`roles={["admin"]}`).
  - `frontend/src/pages/Sessions.tsx`: Vista existente para listar usuarios y revocar sesiones activas.

### Rationale
Garantiza máxima estabilidad, evita regresiones en mecanismos sensibles como cookies de sesión y OAuth, y reduce el tiempo de desarrollo enfocándose exclusivamente en la nueva lógica de negocio.

### Alternativas Descartadas
- Reescribir la autenticación con JWTs tradicionales: Descartado porque la consigna exige Better Auth con sesiones en MongoDB y capacidad de revocación en tiempo real.
- Modificar los middlewares compartidos para adaptarlos a `Movie`: Descartado porque los middlewares ya son totalmente genéricos.

---

## 2. Preparación del Modelo `Movie` para Fase 2 (Array Embebido `reviews`)

### Contexto
En la Fase 2 se incorporará un sistema de comentarios y puntuaciones (reviews). El diseño de la Fase 1 debe evitar que dicha incorporación requiera migraciones destructivas en MongoDB, quiebre esquemas Zod o rompa vistas del frontend.

### Decisión
Diseñar el esquema de Mongoose, el esquema de Zod y los tipos TypeScript de `Movie` incluyendo ya la definición opcional del campo `reviews` con valor predeterminado como array vacío (`[]`):
- **Mongoose**:
  ```ts
  const reviewSubSchema = new Schema(
    {
      userId: { type: String, required: true },
      userName: { type: String, required: true },
      rating: { type: Number, required: true, min: 1, max: 5 },
      comment: { type: String, required: true, trim: true },
      createdAt: { type: Date, default: Date.now }
    },
    { _id: true }
  );

  // En MovieSchema:
  reviews: {
    type: [reviewSubSchema],
    default: [],
  }
  ```
- **Zod Backend / Frontend**:
  Se omite `reviews` en `createMovieSchema` para que el cliente no envíe reviews en la creación; la inicialización recae de forma exclusiva y limpia en Mongoose con `default: []`.
  Para el campo `year`, se utiliza `z.coerce.number()` en el esquema Zod y `valueAsNumber: true` en la vinculación del formulario con React Hook Form.
- **TypeScript**:
  ```ts
  reviews?: Array<MovieReview>;
  ```

### Rationale
Embeber las reseñas como un array de subdocumentos en el documento de `Movie` aprovecha el modelo de datos de documentos de MongoDB (alta localidad de lectura al obtener el detalle de la película). Al inicializarlo como `default: []` en Mongoose:
1. No se requiere migración de datos al habilitar la Fase 2.
2. Las consultas y serializaciones actuales no se rompen.
3. El frontend de la Fase 1 simplemente maneja un array vacío (`reviews: []`) sin errores.

### Alternativas Descartadas
- Colección separada `Review` con referencias foráneas (`movieId`): Descartado porque un catálogo de películas se beneficia enormemente del patrón embebido en MongoDB (las reseñas se leen siempre junto a la película y el volumen típico por película en este TP no excede el límite de 16MB de BSON).

---

## 3. Resolución de Rutas `/api/v1/movies`: Desarrollo Local vs. Producción en Render

### Contexto
El frontend y el backend deben comunicarse mediante rutas relativas (`/api/...`) sin hardcodear URLs absolutas en el código del cliente.

### Decisión
1. **En Entorno de Desarrollo Local**:
   - `frontend/src/lib/api.ts` define `baseURL: "/api/v1"`.
   - `frontend/vite.config.ts` mantiene su configuración:
     ```ts
     server: {
       proxy: { "/api": "http://localhost:3000" }
     }
     ```
   - Al invocar `/api/v1/movies`, Vite intercepta `/api` y lo reenvía a `http://localhost:3000/api/v1/movies`.
   - Como la llamada es al mismo origen del navegador (`localhost:5173`), las cookies de sesión se envían automáticamente sin requerir configuración especial de CORS.
2. **En Producción (Render)**:
   - Backend desplegado como **Web Service** (`https://<backend-app>.onrender.com`).
   - Frontend desplegado como **Static Site** (`https://<frontend-app>.onrender.com`).
   - Regla de Rewrite en el Static Site de Render:
     - **Source**: `/api/*`
     - **Destination**: `https://<backend-app>.onrender.com/api/*`
   - Regla de SPA Fallback en el Static Site:
     - **Source**: `/*`
     - **Destination**: `/index.html`

### Rationale
Satisface el principio VI de la constitución y los requisitos de CONSIGNA.md. Asegura paridad entre local y producción sin lidiar con cookies de terceros bloqueadas por navegadores modernos.

---

## 4. Estrategia de Limpieza de Entidades Legadas (Students & Subjects)

### Contexto
El proyecto base contiene código de ejemplo de la materia centrado en estudiantes y asignaturas que no pertenecen al dominio de películas.

### Decisión
Ejecutar una depuración controlada en 2 etapas:
1. **Backend**:
   - **Eliminar permanentemente**:
     - `backend/src/models/Subject.ts`
     - `backend/src/schemas/subject.schema.ts`
     - `backend/src/controllers/subjects.controller.ts`
     - `backend/src/routes/subjects.routes.ts`
     - `backend/src/demo.ts`
   - **Reemplazar**:
     - `Student.ts` → `Movie.ts`
     - `student.schema.ts` → `movie.schema.ts`
     - `students.controller.ts` → `movies.controller.ts`
     - `students.routes.ts` → `movies.routes.ts`
   - **Desmontar de `backend/src/routes/index.ts`**: Remover `studentsRouter` y `subjectsRouter`; montar exclusivamente `moviesRouter` en `/movies`.
2. **Frontend**:
   - **Eliminar permanentemente**:
     - `frontend/src/components/StudentCard.tsx`
     - `frontend/src/components/admin/StudentForm.tsx`
     - `frontend/src/pages/StudentDetail.tsx`
     - `frontend/src/schemas/student.schema.ts`
     - `frontend/src/types/student.ts`
   - **Crear componentes de dominio**:
     - `frontend/src/types/movie.ts`
     - `frontend/src/schemas/movie.schema.ts`
     - `frontend/src/components/MovieCard.tsx`
     - `frontend/src/components/admin/MovieForm.tsx`
     - `frontend/src/pages/MovieDetail.tsx`
   - **Adaptar vistas y store**:
     - `frontend/src/store/api.ts` (reemplazar `studentsApi` por `moviesApi`).
     - `frontend/src/store/index.ts` (registrar `moviesApi`).
     - `frontend/src/pages/Home.tsx` (catálogo y filtros de películas).
     - `frontend/src/pages/Admin.tsx` (ABM de películas).
     - `frontend/src/router/index.tsx` (rutas `/`, `/movies/:id`, `/admin`, `/sessions`).
     - `frontend/src/layouts/Layout.tsx` (actualizar textos de navegación e identidad).

### Rationale
Evita código muerto y deuda técnica, garantizando que el build de TypeScript (`tsc`) pase limpiamente sin referencias rotas.

---

## 5. Estrategia de Seed y Gestión de Usuarios de Prueba

### Contexto
La consigna de entrega requiere dos usuarios de prueba preconfigurados con sus credenciales indicadas en el `README.md`:
- Admin: `admin@movies.com` / `Admin123!` (rol: `admin`)
- User: `user@movies.com` / `User123!` (rol: `user`)
Además se requieren datos iniciales de películas para evaluar la aplicación de inmediato tras su despliegue en Render.

### Decisión
Crear un script de inicialización idempotente `backend/src/scripts/seed.ts` ejecutable vía `npm run seed`:
1. Conecta a la base de datos de MongoDB especificada en `process.env.MONGODB_URI`.
2. Verifica si existen los usuarios de prueba. Si no existen, los crea mediante la API interna de Better Auth `auth.api.signUpEmail({ body: { email, password, name } })`. Esto asegura que Better Auth genere correctamente los documentos en las colecciones `user` y `account` (con su hash de contraseña correspondiente).
3. Para el usuario administrador (`admin@movies.com`), inmediatamente tras crearlo con `signUpEmail`, actualiza directamente su documento en la colección `user` de Mongo seteando `role: "admin"`.
4. Si la colección de películas está vacía, inserta 6 películas iniciales completas con diversos géneros, directores y URLs de póster reales.
5. Documentar los pasos de ejecución tanto en `README.md` como en `quickstart.md`.

### Rationale
Permite inicializar tanto la base de desarrollo local como la base de producción en MongoDB Atlas con un único comando confiable y documentado.
