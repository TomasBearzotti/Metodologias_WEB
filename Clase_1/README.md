# 🚀 Servidor Base: Node.js + Express + TypeScript

Este directorio contiene una plantilla base (boilerplate) configurada para levantar rápidamente un servidor backend. Está pensado para ser lo más simple posible, permitiendo copiar y pegar esta estructura para arrancar nuevos proyectos sin tener que reconfigurar todo desde cero.

## 🛠️ Tecnologías Utilizadas
- **Node.js & Express**: Framework principal para el manejo de rutas y servidor HTTP.
- **TypeScript**: Tipado estricto para un desarrollo más seguro (configurado en `tsconfig.json`).
- **CORS**: Middleware de seguridad configurado para permitir peticiones de distintos orígenes.
- **TSX**: Motor de ejecución para entorno de desarrollo (rápido y con recarga automática).

## 🚦 Comandos Disponibles

En el archivo `package.json` están configurados los siguientes scripts:

- `npm run dev`: Levanta el servidor en modo desarrollo usando `tsx`. Se reinicia automáticamente al guardar un cambio.
- `npm run build`: Elimina la compilación anterior y transpila todo el código TypeScript a JavaScript puro dentro de la carpeta `/dist`.
- `npm start`: Ejecuta el servidor desde el código ya compilado (`/dist/server.js`), ideal para producción.

## 📂 Contenido
Todo el código fuente se encuentra dentro de la carpeta `src/`. El archivo `server.ts` incluye:
- Configuración básica de Express.
- Middlewares de `cors` y parseo de `json`.
- Una base de datos simulada en memoria (Array).
- Rutas de ejemplo (GET, POST, PUT) listas para ser modificadas.