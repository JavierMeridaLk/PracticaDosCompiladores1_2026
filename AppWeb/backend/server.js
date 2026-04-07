import express from 'express';
import cors from 'cors';
import multer from 'multer';
import apiRoutes from './src/routes/api.routes.js';

const app = express();
const PORT = process.env.PORT || 5000; // Puerto 5000

// Middleware
app.use(cors());
app.use(express.json());

// Configurar multer para subir archivos
const upload = multer({ dest: 'uploads/' });

// Rutas
app.use('/api', apiRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});