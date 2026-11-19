<!--
# Sync Impact Report
- Version change: Unratified Scaffold (0.0.0) → 1.0.0
- Bump rationale: Initial constitution ratification establishing governance, architecture, security, deployment, and git workflow rules based on CONSIGNA.md and diagnostico-tp2.md.
- Core Principles established:
  - Principle 1: Arquitectura Monorepo y Continuidad de Infraestructura
  - Principle 2: Backend Contract-Driven con Zod y Better Auth
  - Principle 3: Frontend Reactivo, Tipado Estricto y Estado Centralizado
  - Principle 4: Seguridad, Control de Acceso Basado en Roles (RBAC) y Códigos HTTP Estrictos
  - Principle 5: Gestión Rigurosa de Secretos y Disciplina de Git
  - Principle 6: Estrategia de Despliegue en Render y Rutas Relativas de API
- Added Sections:
  - Estándares Técnicos y Restricciones de Implementación
  - Flujo de Trabajo y Criterios de Aceptación
- Governance rules: Amendment procedure, versioning policy, and compliance verification defined.
- Follow-up TODOs: None.
-->

# TP2 Full Stack App Constitution

## Core Principles

### I. Arquitectura Monorepo y Continuidad de Infraestructura
El proyecto se organiza estrictamente como un monorepo compuesto por dos aplicaciones independientes: `backend/` y `frontend/`.
- Se DEBE preservar y reutilizar la infraestructura base ya validada en el repositorio de clase: configuración de servidor Express (`backend/src/server.ts`), conexión y ciclo de vida de MongoDB con Mongoose (`backend/src/config/db.ts`), autenticación y adaptador Mongo de Better Auth (`backend/src/lib/auth.ts`), y middlewares de autenticación y validación (`backend/src/middlewares/`).
- Queda PROHIBIDO reescribir o descartar la infraestructura base existente sin justificación explícita de arquitectura aprobada.
- Debe mantenerse una separación estricta de responsabilidades: el backend actúa exclusivamente como un proveedor de API RESTful desacoplado; el frontend es una SPA cliente que consume dicha API.

### II. Backend Contract-Driven con Zod y Better Auth
El backend opera sobre Express 5, TypeScript (ESM) y MongoDB mediante Mongoose.
- Cada recurso DEBE implementar contratos estrictos mediante esquemas de Zod (`createSchema`, `updateSchema` con `.partial()`, y `listSchema` para query params).
- Toda petición de mutación (`POST`, `PUT`, `PATCH`) DEBE validarse obligatoriamente mediante el middleware `validateBody(schema)`, respondiendo con código HTTP `400 Bad Request` y un objeto JSON que detalle los errores de validación (`fieldErrors`).
- La autenticación DEBE ser gestionada integralmente por Better Auth con almacenamiento de usuarios y sesiones en MongoDB, soportando tanto credenciales tradicionales (email y contraseña) como proveedor social GitHub OAuth.
- Los tipos globales de Express (`req.user`) DEBEN respetarse en todos los controladores y middlewares.

### III. Frontend Reactivo, Tipado Estricto y Estado Centralizado
El frontend se construye sobre React 19, Vite, TypeScript y TailwindCSS.
- Todos los formularios DEBEN implementarse con React Hook Form integrado con `@hookform/resolvers/zod` y esquemas Zod, exponiendo mensajes de error de validación claros y accesibles en la interfaz de usuario.
- El estado de la sesión de autenticación DEBE mantenerse sincronizado mediante el cliente de Better Auth (`useSession()`), garantizando persistencia al recargar la página (F5).
- La comunicación con la API DEBE estructurarse mediante RTK Query (Redux Toolkit), definiendo endpoints tipados, hooks automáticos y mecanismos de invalidación de tags de caché para mantener consistencia inmediata entre lecturas y mutaciones.
- Los tipos TypeScript en el frontend DEBEN reflejar de forma exacta los modelos y respuestas del backend.

### IV. Seguridad, Control de Acceso Basado en Roles (RBAC) y Códigos HTTP Estrictos
El sistema implementa dos roles de usuario únicos y mutuamente excluyentes: `user` y `admin`.
- Todo usuario registrado recibe por defecto el rol `user`. Los usuarios con rol `user` tienen acceso exclusivamente de lectura a las entidades del dominio.
- El rol `admin` dispone de privilegios completos de lectura y escritura (CRUD) sobre las entidades de dominio y acceso al panel de administración.
- Todas las rutas de escritura (`POST`, `PUT`, `PATCH`, `DELETE`) en el backend DEBEN estar protegidas en cadena por `authMiddleware` seguido obligatoriamente de `requireRole("admin")`.
- Las rutas protegidas en el frontend DEBEN estar custodiadas por componentes de guarda (`ProtectedRoute`) que validen sesión activa y rol requerido, redirigiendo a login o impidiendo el paso con vistas informativas de falta de permisos.
- Las respuestas de la API DEBEN respetar rigurosamente los códigos de estado HTTP:
  - `200 OK`: Consulta o actualización exitosa.
  - `201 Created`: Recurso creado exitosamente.
  - `400 Bad Request`: Error de validación de esquema o parámetros malformados.
  - `401 Unauthorized`: Petición a ruta protegida sin sesión válida o autenticación expirada.
  - `403 Forbidden`: Petición de usuario autenticado que carece del rol necesario (ej. `user` intentando escribir).
  - `404 Not Found`: Identificador o recurso solicitado inexistente.

### V. Gestión Rigurosa de Secretos y Disciplina de Git
Queda terminantemente prohibido commitear información sensible, credenciales o secretos en el repositorio Git.
- Ningún archivo `.env`, token de API, `BETTER_AUTH_SECRET`, client secret de GitHub OAuth o cadena de conexión a MongoDB con contraseñas reales puede ser rastreado por Git, ni en commits actuales ni en el historial histórico.
- El archivo `backend/.env.example` DEBE mantenerse permanentemente actualizado con todas las variables requeridas por el backend, utilizando nombres canónicos y valores de ejemplo o vacíos.
- Todo desarrollo DEBE planificarse en unidades de trabajo atómicas y ordenadas. Los commits DEBEN ser descriptivos y seguir la convención Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `chore:`). Queda terminantemente prohibido realizar entregas en commits masivos o monolíticos.

### VI. Estrategia de Despliegue en Render y Rutas Relativas de API
El despliegue en producción en la plataforma Render se estructura como dos servicios desacoplados: un **Web Service** para el backend y un **Static Site** para el frontend.
- El frontend DEBE consumir la API REST siempre a través de rutas relativas (`/api/...` o `/api/v1/...`). Queda PROHIBIDO hardcodear URLs absolutas del backend en el código o bundles del frontend.
- En entorno local, Vite resuelve las llamadas relativas mediante su proxy configurado en `vite.config.ts`. En producción en Render, el Static Site DEBE configurar una regla de rewrite `/api/*` que redirija al servicio Web Service del backend.
- El Static Site en Render DEBE configurar obligatoriamente la regla de rewrite de SPA fallback (`/*` → `/index.html`) para garantizar la navegación directa y la recarga de página (F5) en cualquier ruta del frontend sin errores 404.
- La autenticación OAuth con GitHub DEBE contemplar configuración dual de aplicaciones: credenciales para desarrollo local (`http://localhost:3000` / `http://localhost:5173`) y credenciales separadas para producción en Render con su correspondiente redirect URL.

## Estándares Técnicos y Restricciones de Implementación

### Definición y Migración de Entidades de Dominio
- La aplicación DEBE modelar una entidad de dominio propia (ej. productos, libros, recetas, turnos), distinta de las entidades de ejemplo de la materia (`students` y `subjects`).
- La entidad DEBE contener como mínimo 4 campos relevantes, empleando al menos 3 tipos de datos distintos (ej. `string`, `number`, `boolean`, `Date`).
- Todos los artefactos de ejemplo de `students` y `subjects` DEBEN ser adaptados o eliminados:
  - Eliminar rutas, controladores, esquemas y modelos de `subjects` y el archivo `src/demo.ts`.
  - Reemplazar la entidad `students` por la entidad elegida en backend (modelo Mongoose, esquemas Zod, controlador, rutas registradas en `routes/index.ts`) y en frontend (tipos TypeScript, esquema Zod, slice de RTK Query, componentes y vistas de detalle y administración).

### Calidad de Código y Estructura
- El tipado en TypeScript DEBE ser estricto en ambos paquetes (`backend/tsconfig.json` y `frontend/tsconfig.json`), evitando el uso indiscriminado de `any`.
- Los errores devueltos por el backend DEBEN mantener un formato uniforme con propiedad `message` o estructura estandarizada de errores para que el helper `getErrorMessage` del frontend los interprete sin ambigüedades.

## Flujo de Trabajo y Criterios de Aceptación

### Criterios de Definición de Terminado (DoD)
Para que cualquier tarea o funcionalidad sobre una entidad se considere completa, DEBE cumplir:
1. **Backend**: Modelo Mongoose con índices y tipos adecuados; esquemas Zod (`create`, `update`, `list`); controlador con las 5 operaciones estándar; rutas montadas con protección por rol en escritura; respuestas con códigos HTTP canónicos.
2. **Frontend**: Tipos TypeScript sincronizados; validación en formularios con React Hook Form + Zod; operaciones CRUD conectadas a RTK Query; vistas de listado, detalle y panel de administración accesibles según rol.
3. **Seguridad verificada**: Verificación manual o automatizada de que usuarios con rol `user` no pueden mutar datos (reciben 403), usuarios no autenticados reciben 401, y usuarios con rol `admin` operan con éxito.
4. **Entrega y Documentación**: `README.md` actualizado con descripción de la entidad, endpoints disponibles (método, ruta, rol), instrucciones de ejecución local y credenciales de los dos usuarios de prueba preconfigurados (`admin` y `user`).

## Governance

- Esta constitución representa la máxima autoridad sobre arquitectura, diseño, seguridad y prácticas de desarrollo del proyecto, teniendo prelación sobre convenciones informales o decisiones ad-hoc.
- Todo cambio en las reglas de arquitectura, seguridad o flujos de trabajo DEBE tramitarse mediante una enmienda formal a este documento.
- Las enmiendas a la constitución requieren una actualización del número de versión conforme a Semantic Versioning:
  - **MAJOR (X.0.0)**: Modificaciones sustanciales, eliminación o ruptura de principios fundamentales existentes.
  - **MINOR (1.X.0)**: Incorporación de nuevos principios, secciones o directivas complementarias sin invalidar las existentes.
  - **PATCH (1.0.X)**: Correcciones gramaticales, clarificaciones o refinamientos menores que no alteran el significado normativo.
- Todo pull request o tarea de desarrollo debe verificarse contra los principios aquí establecidos antes de considerarse lista para despliegue.

**Version**: 1.0.0 | **Ratified**: 2026-11-19 | **Last Amended**: 2026-11-19
