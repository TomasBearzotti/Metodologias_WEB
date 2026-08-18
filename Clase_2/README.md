# 🚀 API REST - Gestión de Estudiantes y Equipos

Este proyecto es una API RESTful desarrollada con **Node.js, Express y TypeScript**, utilizando **MongoDB** (a través de Mongoose) como base de datos. El sistema permite gestionar dos entidades principales: Estudiantes y Equipos Deportivos, aplicando operaciones CRUD completas y filtrado avanzado.

---

## 🛠️ Tecnologías Utilizadas

- **Entorno de ejecución:** Node.js
- **Framework backend:** Express.js (v5)
- **Lenguaje:** TypeScript
- **Base de Datos:** MongoDB Atlas + Mongoose
- **Seguridad y Configuración:** CORS, dotenv
- **Desarrollo:** `tsx` (para ejecución rápida y recarga en caliente)

---

## 📂 Estructura de Endpoints (Rutas)

La API cuenta con dos colecciones principales. El ruteo base se encuentra bajo el prefijo `/api`.

### 🎓 Estudiantes (`/api/students`)

- **`POST /`** : Crea un nuevo estudiante.
- **`QUERY /`** : Lista estudiantes con filtros avanzados (carrera, estado, búsqueda por nombre) y paginación enviada por el `body`.
- **`GET /:id`** : Obtiene los datos detallados de un estudiante específico.
- **`PUT /:id`** : Actualiza parcialmente los datos de un estudiante.
- **`DELETE /:id`** : Elimina a un estudiante de la base de datos.

### ⚽ Equipos (`/api/teams`)

- **`POST /`** : Crea un nuevo equipo deportivo.
- **`QUERY /`** : Lista equipos con opciones de búsqueda (deporte, estado, texto) y ordenamiento dinámico.
- **`GET /:id`** : Trae la información de un equipo específico por su ID.
- **`PUT /:id`** : Modifica los datos de un equipo existente.
- **`DELETE /:id`** : Borra un equipo del sistema.
