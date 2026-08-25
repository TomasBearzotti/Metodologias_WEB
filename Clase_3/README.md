# 🚀 API REST - Gestión de Estudiantes y Materias

Este proyecto es una API RESTful desarrollada con **Node.js, Express y TypeScript**, utilizando **MongoDB** (a través de Mongoose) como base de datos. El sistema permite gestionar dos entidades principales: Estudiantes y Materias, aplicando operaciones CRUD completas y filtrado avanzado.

---

## 🛠️ Tecnologías Utilizadas

- **Entorno de ejecución:** Node.js
- **Framework backend:** Express.js[cite: 10]
- **Lenguaje:** TypeScript[cite: 10]
- **Base de Datos:** MongoDB Atlas + Mongoose[cite: 10]
- **Seguridad y Configuración:** CORS, dotenv[cite: 10]
- **Desarrollo:** `tsx` (para ejecución rápida y recarga en caliente)[cite: 10]

---

## 📂 Estructura de Endpoints (Rutas)

La API cuenta con dos colecciones principales. El ruteo base se encuentra bajo el prefijo `/api`[cite: 10].

### 🎓 Estudiantes (`/api/students`)

- **`POST /`** : Crea un nuevo estudiante[cite: 10].
- **`QUERY /`** : Lista estudiantes con filtros avanzados (carrera, estado, búsqueda por nombre) y paginación enviada por el `body`[cite: 10].
- **`GET /:id`** : Obtiene los datos detallados de un estudiante específico[cite: 10].
- **`PUT /:id`** : Actualiza parcialmente los datos de un estudiante[cite: 10].
- **`DELETE /:id`** : Elimina a un estudiante de la base de datos[cite: 10].

### 📚 Materias (`/api/materias`)

- **`POST /`** : Crea una nueva materia y la vincula al ID de un estudiante.
- **`GET /`** : Lista las materias (permite usar el filtro `?studentId=` en la URL para ver las materias de un solo alumno).
- **`GET /:id`** : Trae la información de una materia específica por su ID.
- **`PUT /:id`** : Modifica los datos de una materia existente (ejemplo: cambiar el status a "aprobada").
- **`DELETE /:id`** : Borra una materia del sistema.
