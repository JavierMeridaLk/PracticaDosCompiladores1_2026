import express from 'express';
import ServicioCompilador from '../services/ServicioCompilador.js';
import multer from 'multer';

const router = express.Router();
const servicioCompilador = new ServicioCompilador();
const upload = multer({ dest: 'uploads/' });

// Ruta para subir y analizar archivo
router.post('/upload', upload.single('file'), (req, res) => {
  // Implementación pendiente
});

// Ruta para analizar texto
router.post('/analyze-text', (req, res) => {
  // Implementación pendiente
});

// Ruta para obtener archivos guardados
router.get('/files', (req, res) => {
  // Implementación pendiente
});

// Ruta para descargar archivo
router.get('/files/:filename', (req, res) => {
  // Implementación pendiente
});

export default router;