# Quickstart & Verification Guide: Reviews, Ownership & Google Auth (Fase 2)

**Feature**: `002-reviews-and-ownership` | **Date**: 2026-11-19 | **Phase**: 2

Esta guía define los procedimientos de verificación y prueba de integración para las funcionalidades incorporadas en la Fase 2: sistema de reseñas, control estricto de propiedad (Ownership), autenticación con Google y panel de administración de roles.

---

## 1. Configuración de Variables de Entorno

### Backend (`backend/.env`)
Asegurarse de que `backend/.env` incluya las nuevas variables de Google OAuth (en desarrollo pueden quedar vacías si no se requiere probar la API real de Google, el backend continuará funcionando normalmente):
```env
# Proveedor Google (opcional en local si no se cuenta con credenciales):
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```
En `backend/.env.example`, verificar que ambas variables se encuentren documentadas como referencia.

---

## 2. Escenarios de Validación End-to-End

### Escenario 1: Creación de Reseña y Cálculo de Promedio
1. Iniciar sesión con el usuario estándar de prueba: `user@movies.com` / `User123!`.
2. Navegar a cualquier película en el catálogo (ej. `/movies/:id`).
3. En la sección inferior de reseñas:
   - Comprobar que aparece el formulario de nueva reseña con selector de estrellas (1 a 5) y campo de comentario.
   - Seleccionar 5 estrellas y escribir: `"Una obra cinematográfica imprescindible."`.
   - Presionar "Publicar Reseña".
4. **Resultado Esperado**:
   - Código HTTP `201 Created`.
   - La reseña aparece en la lista con el nombre `Usuario Demo`, calificación 5 estrellas y fecha.
   - La película actualiza dinámicamente su calificación promedio (ej. de 0 a 5.0).
   - El formulario desaparece o muestra el estado "Ya has calificado esta película".

### Escenario 2: Restricción de Propiedad (Ownership) y Código 403 Forbidden
1. Cerrar sesión e iniciar sesión con otra cuenta o crear un nuevo usuario `tester@movies.com`.
2. Navegar a la misma película calificada por `user@movies.com`:
   - Verificar que la reseña de `user@movies.com` está visible, pero **NO** muestra los botones de "Editar" ni "Eliminar".
3. Simular una petición maliciosa con curl o Postman intentando modificar o borrar la reseña ajena con la cookie de `tester@movies.com`:
   - `PUT /api/v1/movies/<id>/reviews/<reviewId>` → **Resultado**: `403 Forbidden` (`No tienes permisos para modificar esta reseña`).
   - `DELETE /api/v1/movies/<id>/reviews/<reviewId>` → **Resultado**: `403 Forbidden` (`No tienes permisos para eliminar esta reseña`).

### Escenario 3: Moderación por Administrador (Eliminación con 204)
1. Iniciar sesión como `admin@movies.com` / `Admin123!`.
2. Navegar al detalle de la película que contiene la reseña de `user@movies.com`.
3. Comprobar que, por poseer rol `admin`, sí aparece el botón de "Eliminar reseña" (moderación).
4. Presionar "Eliminar" y confirmar.
5. **Resultado Esperado**:
   - Código HTTP `204 No Content`.
   - La reseña desaparece inmediatamente de la pantalla y el promedio de estrellas se actualiza.

### Escenario 4: Vista Personal "Mis Reseñas"
1. Iniciar sesión como `user@movies.com`.
2. Publicar reseñas en 2 películas distintas.
3. Hacer clic en "Mis Reseñas" en la barra de navegación superior (o en la pestaña de `/perfil`).
4. **Resultado Esperado**:
   - Aparece la lista con las 2 reseñas creadas por `user@movies.com`.
   - Cada tarjeta muestra el póster, título de la película, calificación y comentario.
   - Cada tarjeta dispone de botón "Editar" y "Eliminar".
   - Al editar una reseña, se abre el formulario, se guarda con `PUT` (código 200) y se actualiza de inmediato.

### Escenario 5: Login Social con Google OAuth
1. Acceder a `/login` o `/register`.
2. Verificar la presencia del botón **"Continuar con Google"** junto al botón existente de GitHub.
3. Presionar el botón:
   - En entorno configurado con credenciales de Google, redirige al flujo de consentimiento de cuentas de Google.
   - En entorno local sin claves, captura el estado y mantiene la interfaz reactiva sin caídas del servidor.

### Escenario 6: Panel de Administración de Roles y Salvaguarda
1. Con sesión de `admin@movies.com`, acceder a `/admin/usuarios` (o pestaña "Usuarios y Roles" en `/admin`).
2. Comprobar la tabla con los usuarios registrados (`admin@movies.com`, `user@movies.com`, etc.).
3. Pulsar "Promover a Admin" en `user@movies.com`:
   - Confirmar en el modal.
   - El rol se actualiza a `admin` en la interfaz y en MongoDB.
4. Pulsar el botón para degradar la propia cuenta de `admin@movies.com`:
   - **Resultado Esperado**: Se despliega una advertencia preventiva explícita alertando sobre la pérdida inmediata de privilegios de administración.
