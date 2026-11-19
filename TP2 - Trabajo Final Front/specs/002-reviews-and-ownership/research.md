# Research & Technical Decisions: Reviews, Ownership & Google OAuth (Fase 2)

**Feature**: `002-reviews-and-ownership` | **Date**: 2026-11-19 | **Phase**: 2

Este documento consolida las decisiones de arquitectura, patrones de diseño, librerías y contratos técnicos para la implementación de la Fase 2 del proyecto.

---

## 1. Estrategia de Almacenamiento y Consulta de Reseñas

### Decisión: Subdocumentos Embebidos en `Movie`
En la Fase 1, el esquema de `Movie` en MongoDB (`backend/src/models/Movie.ts`) fue preparado con el array embebido:
```ts
reviews: {
  type: [movieReviewSchema],
  default: [],
}
```
- **Ventajas**:
  1. Atomicidad: Al consultar el detalle de una película (`GET /api/v1/movies/:id`), se recupera la lista completa de reseñas en una sola consulta sin necesidad de un `$lookup` o consultas adicionales.
  2. Integridad referencial: Si una película es eliminada por un administrador, todas sus reseñas se eliminan en cascada de forma automática sin dejar registros huérfanos.
  3. Cálculo de Promedio: Se puede recalcular el promedio (`averageRating`) y contador (`reviewsCount`) directamente sobre el array o mediante virtuales/agregaciones.
- **Alternativa Descartada (Colección separada `reviews`)**: Requeriría mantener índices cruzados, transacciones distribuidas o limpieza manual en eliminaciones de películas. Dado el volumen esperado en la consigna académica, el modelo embebido es óptimo y respeta la base establecida en la Fase 1.

---

## 2. Patrón de Control de Propiedad (Ownership)

### Reglas de Autorización
El control de acceso para la entidad de reseñas distingue tres niveles:

| Operación | Método & Ruta | Nivel de Acceso Requerido | Código HTTP si No Autorizado |
| :--- | :--- | :--- | :--- |
| **Crear Reseña** | `POST /api/v1/movies/:id/reviews` | Usuario autenticado (cualquier rol) | `401 Unauthorized` |
| **Editar Reseña** | `PUT /api/v1/movies/:id/reviews/:reviewId` | **Solo el autor original** (`review.userId === req.user.id`) | `403 Forbidden` |
| **Eliminar Reseña** | `DELETE /api/v1/movies/:id/reviews/:reviewId` | **Autor original O usuario con rol `admin`** | `403 Forbidden` |
| **Mis Reseñas** | `GET /api/v1/reviews/me` | Usuario autenticado (filtra por `req.user.id`) | `401 Unauthorized` |

### Implementación Segura de Identidad
- **Inmutabilidad de Identidad**: `userId` y `userName` **NUNCA** se aceptan desde el body del cliente. Se extraen directamente del objeto verificado `req.user` inyectado por `authMiddleware`.
- **Restricción de Unicidad**: En la creación, se comprueba si `movie.reviews.some(r => r.userId === req.user.id)`. Si es verdadero, se rechaza con código `400 Bad Request` ("Ya has publicado una reseña para esta película").

---

## 3. Consulta Eficiente de "Mis Reseñas" (`GET /api/v1/reviews/me`)

### Enfoque: Pipeline de Agregación en MongoDB
Para obtener todas las reseñas creadas por el usuario autenticado junto con los datos de la película vinculada, se ejecuta un pipeline de agregación sobre la colección `Movie`:
```ts
const userReviews = await Movie.aggregate([
  { $unwind: "$reviews" },
  { $match: { "reviews.userId": req.user.id } },
  { $sort: { "reviews.createdAt": -1 } },
  {
    $project: {
      _id: "$reviews._id",
      movieId: "$_id",
      movieTitle: "$title",
      posterUrl: "$posterUrl",
      genre: "$genre",
      year: "$year",
      rating: "$reviews.rating",
      comment: "$reviews.comment",
      createdAt: "$reviews.createdAt",
      updatedAt: "$reviews.updatedAt",
    },
  },
]);
```
Este pipeline devuelve una lista plana y tipada de reseñas asociadas al usuario con toda la información necesaria para renderizar la tarjeta en "Mis Reseñas" sin sobrecargar la red ni requerir llamadas adicionales.

---

## 4. Integración de Google OAuth en Better Auth

### Configuración en Backend (`backend/src/lib/auth.ts`)
Better Auth soporta de forma nativa el proveedor social `google`. Para garantizar que la aplicación funcione en entornos de desarrollo donde aún no se hayan creado las credenciales de Google Cloud Console, se implementa una configuración resiliente:
```ts
socialProviders: {
  github: {
    clientId: process.env.GITHUB_CLIENT_ID || "",
    clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
  },
  ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        },
      }
    : {}),
},
account: {
  accountLinking: { trustedProviders: ["github", "google"] },
},
```
- **Callback URL de Google**: `http://localhost:3000/api/auth/callback/google` en desarrollo y `https://<backend-render>/api/auth/callback/google` en producción.
- **Account Linking**: Si un usuario se registra con email y luego entra con Google (o viceversa), Better Auth une las cuentas en la colección `account` sin conflictos.

---

## 5. Arquitectura Frontend & Sincronización de Estado (RTK Query)

### Tags de Caché y Mutaciones
Se extiende `frontend/src/store/api.ts` con tags específicos:
- `providesTags: (result, error, id) => [{ type: "Movies", id }]`
- `invalidatesTags: ["Movies", "MyReviews"]`
Al crear, editar o eliminar una reseña:
1. Se invalida el tag `Movies` (refrescando el detalle de la película y el catálogo con su nuevo promedio).
2. Se invalida el tag `MyReviews` (refrescando la vista "Mis Reseñas").

### Vista "Mis Reseñas"
- Ruta protegida: `/mis-reseñas` (o `/my-reviews` con enlace directo en la barra de navegación para usuarios logueados).
- Permite edición in-line o modal simple y eliminación con confirmación.

### Panel de Administración de Usuarios y Roles
- Se consolida la navegación en `/admin`:
  - Pestaña o acceso "Películas" (`/admin`)
  - Pestaña o acceso "Usuarios y Roles" (`/admin/usuarios`, reutilizando y refinando la vista existente de `Sessions.tsx`)
- Se mantiene la prevención de auto-degradación de rol del administrador con advertencia modal explícita.
