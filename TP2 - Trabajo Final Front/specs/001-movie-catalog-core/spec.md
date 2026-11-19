# Feature Specification: Movie Catalog Core (Fase 1)

**Feature Branch**: `001-movie-catalog-core`

**Created**: 2026-11-19

**Status**: Draft

**Input**: User description: "Fase 1 — Núcleo de la aplicación de Películas (según CONSIGNA.md y diagnostico-tp.md). Objetivo: construir el catálogo full stack de películas con autenticación, autorización por roles y panel de administración."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Exploración y Consulta del Catálogo de Películas (Priority: P1)

Como visitante o usuario de la plataforma, quiero explorar el catálogo de películas en una cuadrícula visual, buscar por título o director, filtrar por género y consultar los detalles completos de una película individual, para descubrir contenidos de mi interés.

**Why this priority**: Es la propuesta de valor fundamental de la aplicación y el punto de entrada para todos los usuarios. Incluso sin autenticación o funciones de administración, el catálogo público entrega valor funcional inmediato como producto mínimo viable (MVP).

**Independent Test**: Puede probarse de forma totalmente independiente accediendo a la vista pública principal, ejecutando búsquedas y filtros, y seleccionando cualquier película para visualizar su ficha detallada sin necesidad de contar con una cuenta de usuario.

**Acceptance Scenarios**:

1. **Given** un catálogo con películas registradas, **When** el visitante ingresa a la página principal, **Then** visualiza una cuadrícula de películas mostrando su póster, título, año de estreno y género.
2. **Given** el catálogo principal, **When** el usuario escribe un término en el buscador (título o director) o selecciona un género en el filtro, **Then** la lista se actualiza mostrando únicamente las películas que coinciden con los criterios.
3. **Given** el catálogo principal, **When** el usuario hace clic en una película, **Then** es dirigido a la vista de detalle donde se exhibe toda la información: póster ampliado, título, sinopsis, director, año, género y estado de disponibilidad.
4. **Given** una búsqueda con un término inexistente, **When** el usuario aplica el filtro, **Then** el sistema muestra un mensaje informativo indicando que no se encontraron resultados y ofreciendo restablecer la búsqueda.

---

### User Story 2 - Autenticación y Persistencia de Sesión (Priority: P2)

Como usuario, quiero registrarme en la plataforma con mi correo y contraseña o iniciar sesión con mi cuenta de GitHub, mantener mi sesión activa al recargar la página y poder cerrar sesión de forma segura, para acceder a las funcionalidades personalizadas de mi cuenta.

**Why this priority**: Establece la base de identidad requerida para el control de acceso basado en roles (RBAC) y la custodia del panel de administración.

**Independent Test**: Puede probarse registrando un nuevo usuario o iniciando sesión mediante credenciales o GitHub, recargando el navegador (F5) para validar la persistencia de la sesión, consultando el perfil y cerrando la sesión.

**Acceptance Scenarios**:

1. **Given** un visitante no autenticado, **When** completa el formulario de registro con un correo válido y contraseña, **Then** su cuenta es creada con el rol por defecto (`user`), inicia sesión automáticamente y es redirigido a la vista principal.
2. **Given** un usuario registrado, **When** ingresa sus credenciales válidas en la pantalla de inicio de sesión, **Then** accede a su cuenta y el encabezado refleja su estado autenticado.
3. **Given** un visitante, **When** selecciona la opción de autenticación con GitHub, **Then** es redirigido al flujo de autorización y, al completarlo, ingresa al sistema con su identidad vinculada.
4. **Given** un usuario con sesión activa, **When** recarga la página o abre una nueva pestaña, **Then** la sesión se mantiene abierta sin solicitar reautenticación.
5. **Given** un usuario con sesión activa, **When** presiona el botón de cerrar sesión, **Then** la sesión finaliza y el usuario regresa al estado público.

---

### User Story 3 - Panel de Administración y ABM de Películas (Priority: P3)

Como administrador de la plataforma, quiero acceder a un panel exclusivo para dar de alta, editar los datos y eliminar películas del catálogo, contando con validaciones claras para mantener la calidad y consistencia de los datos.

**Why this priority**: Permite a los administradores gestionar el ciclo de vida completo del contenido disponible en el catálogo, garantizando integridad y actualización continua.

**Independent Test**: Puede probarse iniciando sesión con una cuenta de rol `admin`, ingresando al panel de administración, creando una nueva película con datos válidos, editando sus atributos y eliminando un registro, verificando que los cambios impacten en tiempo real en el catálogo público y que un usuario con rol `user` no pueda ejecutar estas acciones.

**Acceptance Scenarios**:

1. **Given** un usuario con rol `admin`, **When** ingresa a la sección de administración, **Then** visualiza la tabla o listado de películas existentes junto con las opciones de crear, editar y eliminar.
2. **Given** el formulario de creación de película, **When** el administrador envía información completa y válida (título, sinopsis, director, año, género, URL de póster y disponibilidad), **Then** la película se crea exitosamente, se muestra un mensaje de confirmación y el nuevo título se visualiza de inmediato en el catálogo.
3. **Given** el formulario de creación o edición, **When** el administrador omite un campo obligatorio o ingresa datos inválidos (ej. año fuera de rango, URL malformada), **Then** el sistema bloquea el envío y resalta claramente los errores de validación en cada campo afectado.
4. **Given** una película existente, **When** el administrador modifica sus datos y guarda los cambios, **Then** la información actualizada se refleja de inmediato tanto en la tabla administrativa como en el detalle público.
5. **Given** una película en el panel de administración, **When** el administrador confirma su eliminación, **Then** el recurso es removido permanentemente y deja de figurar en el catálogo.
6. **Given** un usuario no autenticado o con rol `user`, **When** intenta acceder a la ruta del panel de administración o enviar peticiones de modificación, **Then** el sistema deniega el acceso, impidiendo la operación y mostrando una advertencia de falta de permisos o redirigiendo al inicio.

---

### User Story 4 - Administración de Usuarios, Roles y Sesiones (Priority: P4)

Como administrador del sistema, quiero supervisar la lista de usuarios registrados, promover o degradar roles (`admin` / `user`) y auditar o revocar sesiones activas, para garantizar la seguridad y la correcta asignación de responsabilidades.

**Why this priority**: Proporciona herramientas de gobierno operativo y seguridad administrativa sobre los accesos a la plataforma.

**Independent Test**: Puede probarse desde la vista administrativa de sesiones y usuarios, modificando el rol de una cuenta de prueba de `user` a `admin` y comprobando que dicha cuenta adquiere inmediatamente permisos de gestión sobre el catálogo.

**Acceptance Scenarios**:

1. **Given** un administrador en el panel de usuarios/sesiones, **When** visualiza el listado de usuarios, **Then** puede ver sus nombres, correos, roles actuales y sesiones activas.
2. **Given** un usuario con rol `user`, **When** el administrador cambia su rol a `admin`, **Then** el nuevo rol se aplica y el usuario pasa a tener acceso al panel y operaciones de edición de películas.
3. **Given** una sesión listada en el panel, **When** el administrador revoca dicha sesión, **Then** el token o cookie asociado queda invalidado, forzando a dicho usuario a autenticarse nuevamente.

---

### Edge Cases

- **Búsqueda sin coincidencias**: Cuando una consulta por título, director o género no arroja resultados, el sistema debe presentar una interfaz limpia con sugerencias para limpiar filtros, sin romper el diseño de cuadrícula.
- **Póster inaccesible o URL inválida**: Si la URL del póster no carga o es errónea, la tarjeta de la película debe mostrar un marcador de posición visual genérico (*placeholder*) con el título de la película.
- **Acceso por URL directa a película inexistente**: Cuando un usuario intenta acceder a `/movies/:id` con un identificador inexistente o eliminado, se debe mostrar una página de error 404 amigable con botón para volver al catálogo.
- **Intento de creación con datos fuera de límites**: Si se ingresa un año de estreno menor a 1888 (año de la primera película histórica) o superior al año calendario próximo, el sistema debe indicar el error específico.
- **Degradación de sesión durante la navegación**: Si la sesión de un administrador caduca o es revocada mientras permanece en el panel de administración, cualquier acción posterior debe solicitar reautenticación sin pérdida de datos no guardados.
- **Navegación directa no autorizada**: Si un usuario con rol `user` o anónimo escribe directamente en la barra de direcciones la URL del panel de administración, debe ser interceptado antes de renderizar datos sensibles y recibir una pantalla de "Acceso Denegado" o ser redirigido a login.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE exponer un catálogo público de películas accesible sin requerir inicio de sesión.
- **FR-002**: El sistema DEBE permitir consultar la ficha individual de cualquier película con toda su información detallada.
- **FR-003**: El sistema DEBE proveer capacidades de búsqueda por texto (coincidencia en título o director) y filtrado por género cinematográfico.
- **FR-004**: El sistema DEBE permitir el registro de nuevos usuarios mediante correo electrónico y contraseña, asignando de manera predeterminada el rol `user`.
- **FR-005**: El sistema DEBE permitir el inicio de sesión tanto con credenciales locales (email y contraseña) como mediante el proveedor social GitHub OAuth.
- **FR-006**: El sistema DEBE garantizar la persistencia de la sesión en el cliente ante recargas de página o navegación entre rutas.
- **FR-007**: El sistema DEBE permitir a los usuarios autenticados cerrar su sesión en cualquier momento.
- **FR-008**: El sistema DEBE restringir el acceso al panel de administración y a todas las operaciones de modificación de películas (crear, editar, eliminar) exclusivamente a usuarios con rol `admin`.
- **FR-009**: El sistema DEBE validar de forma rigurosa todos los campos de una película (título, sinopsis, director, año, género, URL de póster, estado de disponibilidad) antes de procesar altas o modificaciones.
- **FR-010**: El sistema DEBE presentar mensajes de error comprensibles e individualizados por campo cuando una validación falle en los formularios de alta o edición.
- **FR-011**: El sistema DEBE actualizar de inmediato la visualización del catálogo público y de la administración tras cada operación exitosa de creación, actualización o eliminación de películas.
- **FR-012**: El sistema DEBE permitir a los administradores visualizar el listado de usuarios y actualizar sus roles (`user` a `admin` y viceversa).
- **FR-013**: El sistema DEBE permitir a los administradores visualizar y revocar sesiones activas de usuarios.
- **FR-014**: El sistema DEBE desacoplar y sustituir completamente las entidades de ejemplo del repositorio base (`students` y `subjects`), consolidando el dominio exclusivo en la entidad `Movie`.
- **FR-015**: El sistema DEBE responder con códigos de estado HTTP semánticos y estructurados ante cada operación (200 para lecturas/actualizaciones, 201 para creaciones, 400 para errores de validación, 401 para accesos no autenticados, 403 para accesos sin permisos requeridos y 404 para recursos inexistentes).

### Key Entities *(include if feature involves data)*

- **Película (Movie)**:
  - Representa una obra cinematográfica en el catálogo.
  - Atributos clave:
    - `title` (texto): Título oficial de la película.
    - `synopsis` (texto): Resumen argumental de la película.
    - `director` (texto): Nombre del director o realizador principal.
    - `year` (número entero): Año de lanzamiento oficial (mínimo 1888).
    - `genre` (texto / categoría): Género cinematográfico (ej. Acción, Comedia, Drama, Ciencia Ficción, Terror).
    - `posterUrl` (texto / URL): Enlace a la imagen del póster promocional.
    - `isAvailable` (booleano) / `releaseDate` (fecha): Indicador de disponibilidad en cartelera o streaming, o fecha de estreno.
    - Metadatos de auditoría: marcas temporales de creación y actualización (`createdAt`, `updatedAt`).

- **Usuario (User)**:
  - Representa una cuenta de acceso al sistema gestionada por el módulo de autenticación.
  - Atributos clave:
    - Identificador único (`id`), nombre (`name`), correo electrónico (`email`).
    - Rol de autorización (`role`): `"user"` (solo lectura) o `"admin"` (acceso total de gestión).
    - Vínculos de proveedores OAuth (ej. GitHub).

- **Sesión (Session)**:
  - Representa una sesión activa emitida tras una autenticación exitosa.
  - Atributos clave: Identificador de sesión, identificador del usuario asociado, token de sesión, fecha de expiración y metadatos de conexión.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Los visitantes pueden buscar películas por título o filtrar por género con actualización de resultados en menos de 1 segundo.
- **SC-002**: El 100% de los intentos de envío de formularios con datos inválidos o incompletos presenta errores claros y específicos por campo sin enviar datos erróneos al servidor.
- **SC-003**: El 100% de las solicitudes de creación, edición o eliminación ejecutadas por usuarios sin rol `admin` o no autenticados son bloqueadas con respuesta de autorización denegada.
- **SC-004**: La sesión de un usuario autenticado se preserva de manera ininterrumpida ante recargas completas del navegador (F5) en el 100% de las rutas visitadas.
- **SC-005**: Un administrador puede dar de alta o modificar una película en menos de 60 segundos, reflejándose los cambios de manera inmediata en la vista pública del catálogo.
- **SC-006**: Ninguna traza de las entidades de prueba de clase (`students` y `subjects`) queda expuesta en la navegación, interfaz ni en los endpoints de la aplicación.

## Assumptions

- Los usuarios disponen de un navegador web moderno con JavaScript habilitado.
- Las imágenes de pósters provienen de URLs públicas accesibles por la web o marcadores de posición predeterminados.
- Todo nuevo usuario registrado recibe automáticamente el rol `user` con permisos limitados a la consulta pública.
- La gestión de usuarios y cambio de roles está reservada de forma estricta para cuentas con rol `admin`.
- Fuera de alcance en esta Fase 1: El sistema de valoraciones, puntuaciones y reseñas de usuarios (reviews/ratings) no forma parte de esta entrega y queda explícitamente postergado para la Fase 2.
- La infraestructura existente de conexión a base de datos y middlewares de autenticación del repositorio base se reutiliza como soporte directo del nuevo dominio.
