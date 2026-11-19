# Feature Specification: Reseñas con Propiedad por Usuario, Autenticación Google y Administración de Roles

**Feature Branch**: `002-reviews-and-ownership`

**Created**: 2026-11-19

**Status**: Draft

**Input**: User description: "Fase 2 — Reseñas con propiedad por usuario, Login con Google y verificación/mejora de gestión de roles. Objetivo: sumar la capa interactiva de reseñas (con control de propiedad por usuario), habilitar autenticación con Google además de GitHub, y asegurar una vista clara de administración de roles."

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Publicación y Consulta de Reseñas en Películas (Priority: P1)

Como usuario registrado y aficionado al cine, quiero calificar películas (de 1 a 5 estrellas) y dejar una reseña escrita sobre la obra, para que otros usuarios y la comunidad puedan conocer mi opinión y ver el promedio de calificaciones de la película.

**Why this priority**: Es la funcionalidad central que transforma el catálogo estático en una plataforma comunitaria e interactiva, aportando el valor principal de la Fase 2.

**Independent Test**: Iniciar sesión como cualquier usuario (`user` o `admin`), abrir el detalle de una película, completar el formulario de reseña con puntaje (1-5) y comentario (3-500 caracteres), y verificar que la reseña aparece inmediatamente en el listado junto al promedio actualizado de calificación de la película.

**Acceptance Scenarios**:
1. **Given** un visitante anónimo en la página de detalle de una película, **When** visualiza la sección de reseñas, **Then** puede leer todas las reseñas públicas y el promedio general, pero ve un aviso invitándolo a iniciar sesión en lugar del formulario de creación.
2. **Given** un usuario autenticado en la página de detalle de una película donde aún no opinó, **When** completa el formulario de reseña con 5 estrellas y un comentario válido y lo envía, **Then** el sistema registra la reseña asociando su `userId` y `userName` de la sesión, la película actualiza su promedio de estrellas y la nueva reseña aparece al tope del listado.
3. **Given** un usuario autenticado que ya publicó una reseña en esa película, **When** intenta enviar una segunda reseña para la misma película, **Then** el sistema rechaza la operación con código HTTP 400 informando que solo se permite una reseña por usuario y película.

---

### User Story 2 - Control de Propiedad (Ownership) y Gestión de Reseñas Propias (Priority: P2)

Como autor de una reseña, quiero poder modificar mi opinión o eliminarla cuando lo desee, y disponer de una sección personal ("Mis Reseñas") donde auditar todos mis comentarios en el catálogo; y como administrador, quiero tener la potestad de moderar y eliminar cualquier reseña inapropiada.

**Why this priority**: Garantiza la integridad de datos, privacidad y el principio de "propiedad de registros" (Ownership) exigido por la cátedra, diferenciando claramente qué operaciones puede realizar el creador del registro frente a terceros u administradores.

**Independent Test**: Iniciar sesión con Usuario A y crear una reseña. Iniciar sesión con Usuario B y verificar que no aparecen controles de edición/borrado sobre la reseña de Usuario A, y que cualquier intento manual de mutación devuelve `403 Forbidden`. Iniciar sesión como `admin` y verificar que puede eliminarla por motivos de moderación. Ingresar a la vista "Mis Reseñas" y comprobar que solo se listan las reseñas del usuario activo con accesos directos de edición y borrado.

**Acceptance Scenarios**:
1. **Given** un usuario autenticado que visualiza su propia reseña en el detalle de una película o en "Mis Reseñas", **When** presiona "Editar", modifica el comentario/puntaje y guarda, **Then** el sistema valida que sea el autor legítimo (`review.userId === req.user.id`), actualiza la reseña y refresca el promedio de calificación de la película.
2. **Given** un usuario malicioso o tercero autenticado, **When** intenta modificar la reseña de otro usuario mediante `PUT /api/v1/movies/:id/reviews/:reviewId`, **Then** el sistema deniega la acción respondiendo con código HTTP `403 Forbidden` ("No tienes permisos para modificar esta reseña").
3. **Given** un usuario común autenticado, **When** intenta eliminar una reseña creada por otra persona mediante `DELETE /api/v1/movies/:id/reviews/:reviewId`, **Then** el sistema rechaza la solicitud respondiendo con código HTTP `403 Forbidden` ("No tienes permisos para eliminar esta reseña").
4. **Given** un usuario con rol `admin` o el autor legítimo de la reseña, **When** solicita eliminar la reseña, **Then** el sistema elimina el subdocumento, responde con código HTTP `204 No Content` y recalcula la calificación promedio de la película.
5. **Given** un usuario autenticado en la plataforma, **When** navega a la vista "Mis Reseñas" (`/my-reviews` o sección dedicada en `/perfil`), **Then** visualiza un listado exclusivo de todas sus reseñas publicadas, mostrando póster, título de la película, puntaje asignado, comentario, fecha y botones rápidos para editar o eliminar.

---

### User Story 3 - Autenticación con Google OAuth (Priority: P3)

Como usuario de la aplicación, quiero tener la opción de iniciar sesión y registrarme utilizando mi cuenta de Google (además de GitHub y usuario/contraseña tradicionales), para agilizar mi acceso a la plataforma sin necesidad de recordar contraseñas adicionales.

**Why this priority**: Enriquece las opciones de autenticación social delegada requeridas en aplicaciones modernas y enriquece la experiencia del usuario final.

**Independent Test**: En la pantalla de login o registro, presionar el botón "Continuar con Google", completar el flujo de consentimiento de Google y verificar que la cuenta se crea/inicia sesión correctamente, redirigiendo al catálogo con la sesión activa persistente.

**Acceptance Scenarios**:
1. **Given** un usuario no autenticado en `/login` o `/register`, **When** hace clic en el botón "Continuar con Google", **Then** es redirigido a la pantalla de consentimiento de Google OAuth mediante Better Auth.
2. **Given** un usuario que autoriza la conexión con su cuenta de Google, **When** Google responde con el callback de autenticación, **Then** el sistema inicia sesión automáticamente, crea el usuario en MongoDB si es la primera vez (con rol por defecto `user`), y lo redirige a la página principal con sesión activa.
3. **Given** el backend y su configuración, **When** se inspeccionan las variables de entorno, **Then** `backend/.env.example` incluye las claves requeridas `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` sin valores reales, y los métodos de login por email y GitHub siguen funcionando sin alteraciones.

---

### User Story 4 - Vista y Panel Dedicado de Gestión de Roles para Administradores (Priority: P4)

Como administrador del sistema, quiero disponer de una vista dedicada y claramente navegable desde el panel de administración donde pueda auditar el listado completo de usuarios registrados, consultar su rol actual y alternar su jerarquía entre `user` y `admin` con salvaguardas claras que impidan la auto-degradación accidental.

**Why this priority**: Brinda visibilidad y control explícito sobre la autorización RBAC de la plataforma, facilitando la administración de usuarios y la verificación de permisos en evaluaciones y entornos productivos.

**Independent Test**: Iniciar sesión como `admin@movies.com`, navegar a `/admin` y acceder a la pestaña o ruta dedicada "Usuarios y Roles" (`/admin/usuarios` o subsección visible), promover a `user@movies.com` al rol `admin`, verificar el cambio en la interfaz y en MongoDB, e intentar quitarse el rol de admin a sí mismo verificando la presencia de una advertencia de confirmación explícita.

**Acceptance Scenarios**:
1. **Given** un usuario administrador en `/admin`, **When** selecciona la opción "Usuarios y Roles", **Then** accede a una vista tabular con todos los usuarios registrados mostrando nombre, correo, fecha de registro, rol actual (`admin` o `user`) y acciones disponibles.
2. **Given** un administrador que pulsa "Promover a Admin" en un usuario común, **When** confirma la acción, **Then** el sistema invoca `authClient.admin.setRole({ userId, role: "admin" })`, actualiza la insignia de rol en pantalla y refleja los nuevos permisos inmediatamente.
3. **Given** un administrador que pulsa el botón para degradar su propia cuenta a `user`, **When** se dispara la acción, **Then** el sistema despliega una advertencia preventiva obligatoria advirtiendo la pérdida de privilegios antes de ejecutar la petición.
4. **Given** un usuario común con rol `user` o un anónimo, **When** intenta ingresar a `/admin/usuarios`, **Then** es interceptado por `ProtectedRoute` y redirigido a `/perfil` o al catálogo sin acceso a los controles de rol.

---

### Edge Cases

- **Usuario no autenticado intenta enviar o mutar una reseña**: La API intercepta la petición en `authMiddleware` y retorna inmediatamente `401 Unauthorized`.
- **Comentario con caracteres vacíos o longitud inválida**: El esquema de validación Zod en backend y frontend rechaza comentarios de menos de 3 caracteres o más de 500 caracteres, y calificaciones fuera del rango entero 1..5 con código HTTP `400 Bad Request`.
- **Intento de inyección de identidad**: Si un usuario envía un `userId` o `userName` falso en el cuerpo del JSON, el backend ignora completamente esos campos y utiliza de manera obligatoria `req.user.id` y `req.user.name` extraídos de la sesión verificada.
- **Reseña sobre una película inexistente**: Si se envía `POST /api/v1/movies/:id/reviews` con un ID inexistente o inválido de película, la API responde `404 Not Found` o `400 Bad Request`.
- **Reseña o subdocumento no encontrado en edición/borrado**: Si el `reviewId` no existe dentro del array de la película, la API responde `404 Not Found` ("Reseña no encontrada").
- **Eliminación de una reseña que deja a la película con 0 reseñas**: El promedio de calificación de la película se recalcula a 0 y la interfaz muestra "Sin reseñas aún" en lugar de un valor `NaN`.
- **Falla o cancelación en el flujo de Google OAuth**: El frontend captura el error o cancelación en la URL de retorno y muestra un banner amigable ("No se pudo completar el inicio de sesión con Google") sin romper la aplicación.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE permitir a cualquier usuario autenticado registrar una reseña sobre una película mediante `POST /api/v1/movies/:id/reviews`, conteniendo calificación numérica entera (1 a 5) y comentario textual (3 a 500 caracteres).
- **FR-002**: El backend DEBE extraer el identificador de usuario (`userId`) y nombre (`userName`) exclusivamente de la sesión activa (`req.user`), rechazando cualquier suplantación proveniente del cuerpo de la petición.
- **FR-003**: El sistema DEBE asegurar que un mismo usuario pueda publicar como máximo una única reseña por película, retornando `400 Bad Request` en caso de reincidencia.
- **FR-004**: El sistema DEBE permitir la edición de una reseña existente mediante `PUT /api/v1/movies/:id/reviews/:reviewId` EXCLUSIVAMENTE a su autor original (`review.userId === req.user.id`).
- **FR-005**: El sistema DEBE responder con código HTTP `403 Forbidden` si un usuario autenticado intenta modificar una reseña que no le pertenece.
- **FR-006**: El sistema DEBE permitir la eliminación de una reseña mediante `DELETE /api/v1/movies/:id/reviews/:reviewId` al autor original de la misma O a cualquier usuario con rol `admin`.
- **FR-007**: El sistema DEBE responder con código HTTP `403 Forbidden` si un usuario estándar intenta eliminar una reseña de otro usuario.
- **FR-008**: El sistema DEBE proveer el endpoint `GET /api/v1/reviews/me` protegido por `authMiddleware`, que retorne únicamente las reseñas redactadas por el usuario solicitante, incluyendo los datos de la película vinculada (`movieId`, `movieTitle`, `posterUrl`, `rating`, `comment`, `createdAt`, `updatedAt`).
- **FR-009**: La vista de detalle de película en frontend DEBE exhibir el promedio de calificación, el total de reseñas, la lista ordenada de opiniones y un formulario interactivo accesible solo con sesión activa.
- **FR-010**: El frontend DEBE presentar una vista privada "Mis Reseñas" accesible desde la barra de navegación o perfil, que permita al usuario listar, editar y borrar sus comentarios personales.
- **FR-011**: Tras cualquier operación de creación, edición o eliminación de reseña, el frontend DEBE invalidar automáticamente los tags de caché en RTK Query para actualizar instantáneamente las vistas de catálogo, detalle y "Mis Reseñas".
- **FR-012**: El backend DEBE integrar el proveedor social `google` en `better-auth` (`backend/src/lib/auth.ts`) mediante `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`, preservando intactos los métodos de email/contraseña y GitHub.
- **FR-013**: El archivo `backend/.env.example` DEBE incluir las nuevas variables canónicas para Google OAuth sin exponer secretos reales.
- **FR-014**: Las páginas de Login y Registro en frontend DEBEN ofrecer un botón "Continuar con Google" que active el flujo de OAuth mediante `authClient.signIn.social({ provider: "google" })`.
- **FR-015**: El panel de administración DEBE contar con una ruta o pestaña claramente visible y dedicada (`/admin/usuarios` o pestaña en `/admin`) para auditar usuarios y cambiar roles entre `user` y `admin` con `authClient.admin.setRole`.
- **FR-016**: El sistema DEBE incluir salvaguardas explícitas con confirmación previa cuando un administrador intente degradar su propia cuenta.

---

### Key Entities

- **Review (Reseña)**:
  - Subdocumento embebido en el modelo `Movie`.
  - Atributos:
    - `_id`: Identificador único del subdocumento (ObjectId de MongoDB).
    - `userId`: Identificador del usuario autor (string o referencia al usuario de Better Auth).
    - `userName`: Nombre visible del autor al momento de la publicación (string).
    - `rating`: Calificación otorgada (número entero entre 1 y 5).
    - `comment`: Contenido de la reseña (cadena de texto de 3 a 500 caracteres).
    - `createdAt`: Fecha de publicación original (Date).
    - `updatedAt`: Fecha de última edición (Date).
- **Movie (Película)**:
  - Entidad de dominio principal.
  - Atributos: `title`, `synopsis`, `director`, `year`, `genre`, `posterUrl`, `isAvailable`, `releaseDate`, `reviews` (Array de `Review`), `averageRating` (número flotante derivado o calculado), `reviewsCount` (número entero derivado o calculado).
- **User (Usuario)**:
  - Entidad de identidad gestionada por Better Auth en la colección `user`.
  - Atributos: `id`, `name`, `email`, `role` (`user` o `admin`), `image`, `createdAt`.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Los usuarios autenticados pueden publicar, editar y eliminar sus reseñas con retroalimentación visual en menos de 1 segundo tras la confirmación.
- **SC-002**: El 100% de los intentos de modificación o eliminación de reseñas ajenas por usuarios no autorizados son bloqueados en backend con código HTTP `403 Forbidden`.
- **SC-003**: El promedio de calificación de la película y el contador de reseñas se recalculan con 100% de precisión matemática en cada alta, baja o modificación de reseña.
- **SC-004**: Cualquier usuario puede acceder a su historial completo de reseñas en la vista "Mis Reseñas" en como máximo 2 clics desde la barra superior de navegación.
- **SC-005**: Los usuarios pueden registrarse o iniciar sesión con Google OAuth sin fricción manteniendo la sesión persistente en recargas (F5).
- **SC-006**: Los administradores pueden visualizar la lista de usuarios y conmutar un rol de usuario en menos de 3 clics desde el panel de administración.

---

## Assumptions

- Las reseñas se almacenan como subdocumentos embebidos en el documento `Movie` en MongoDB, tal como se dejó preparado en el modelo de datos de la Fase 1 (`reviews: []`).
- Para la consulta `GET /api/v1/reviews/me`, se utiliza agregación de MongoDB (`$unwind` sobre `reviews` filtrando por `reviews.userId == req.user.id`) para extraer eficientemente las reseñas del usuario junto a la metadata de la película correspondiente sin requerir una colección separada.
- Las credenciales reales de Google OAuth (`GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`) se configuran localmente en `backend/.env` del desarrollador y en el panel de variables de Render en producción.
- La gestión de usuarios y roles utiliza las APIs administrativas provistas por el plugin `admin` de Better Auth ya configurado (`authClient.admin.listUsers` y `authClient.admin.setRole`).
