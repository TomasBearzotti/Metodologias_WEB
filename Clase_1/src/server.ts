import express, { Request, Response } from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

// --- MIDDLEWARES ---
// Módulo de seguridad "CORS" para permitir peticiones externas
app.use(cors());
// Fundamental para que Express entienda el body de las peticiones en formato JSON
app.use(express.json());

// --- BASE DE DATOS SIMULADA ---
let items = [{ id: 1, name: "Item inicial" }];

// --- RUTAS ---

// GET: Ruta principal de bienvenida
app.get('/', (req: Request, res: Response) => {
  res.send('¡Servidor funcionando correctamente!');
});

// GET: Obtener todos los registros
app.get("/api/items", (req: Request, res: Response) => {
  res.status(200).json(items);
});

// POST: Crear un nuevo registro
app.post("/api/items", (req: Request, res: Response) => {
  const newItem = {
    id: items.length > 0 ? items[items.length - 1].id + 1 : 1,
    name: req.body.name || "Sin nombre",
  };

  items.push(newItem);
  res.status(201).json({ message: "Ítem creado con éxito", data: newItem });
});

// PUT: Actualizar un registro existente por ID
// Le avisamos a Request que va a recibir un parámetro por URL llamado "id"
app.put('/api/items/:id', (req: Request<{ id: string }>, res: Response): any => {
  
  // Ahora TypeScript sabe perfectamente que req.params.id existe y es un string
  const itemId = parseInt(req.params.id);
  const itemIndex = items.findIndex(i => i.id === itemId);

  if (itemIndex === -1) {
    return res.status(404).json({ message: 'Ítem no encontrado' });
  }

  // Actualizamos los datos
  items[itemIndex].name = req.body.name || items[itemIndex].name;
  
  res.status(200).json({ message: 'Ítem actualizado', data: items[itemIndex] });
});

// --- INICIAR SERVIDOR ---
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
