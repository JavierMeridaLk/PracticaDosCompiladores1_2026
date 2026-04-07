import express from 'express';
import ServicioCompilador from '../services/ServicioCompilador.js';
import multer from 'multer';

const router = express.Router();
const servicioCompilador = new ServicioCompilador();

// Configurar multer para subir archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Mantener el nombre original temporalmente, GestorArchivos lo manejará
    cb(null, file.originalname);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Validar tipo de archivo
    if (file.mimetype === 'text/plain' || file.originalname.endsWith('.txt')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de texto (.txt)'), false);
    }
  },
  limits: {
    fileSize: 1024 * 1024 // 1MB límite
  }
});

// Ruta para subir y analizar archivo
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        exito: false,
        error: 'No se recibió ningún archivo'
      });
    }

    const resultado = await servicioCompilador.procesarArchivoSubido(req.file);

    if (resultado.exito) {
      res.json({
        exito: true,
        mensaje: 'Archivo subido exitosamente',
        archivo: {
          nombreOriginal: resultado.nombreOriginal,
          nombreUnico: resultado.nombreUnico,
          tamano: resultado.tamano
        }
      });
    } else {
      res.status(400).json({
        exito: false,
        error: resultado.error
      });
    }
  } catch (error) {
    console.error('Error al subir archivo:', error);
    res.status(500).json({
      exito: false,
      error: 'Error interno del servidor'
    });
  }
});

// Ruta para analizar texto
router.post('/analyze-text', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        exito: false,
        error: 'No se recibió texto para analizar'
      });
    }

    const resultado = await servicioCompilador.procesarTexto(text);
    res.json(resultado);
  } catch (error) {
    console.error('Error al analizar texto:', error);
    res.status(500).json({
      exito: false,
      error: 'Error interno del servidor'
    });
  }
});

// Ruta para obtener archivos guardados
router.get('/files', async (req, res) => {
  try {
    const resultado = await servicioCompilador.gestorArchivos.listarArchivos();
    res.json(resultado);
  } catch (error) {
    console.error('Error al listar archivos:', error);
    res.status(500).json({
      exito: false,
      error: 'Error interno del servidor'
    });
  }
});

// Ruta para descargar archivo
router.get('/files/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const resultado = await servicioCompilador.gestorArchivos.leerArchivo(filename);

    if (resultado.exito) {
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(resultado.contenido);
    } else {
      res.status(404).json({
        exito: false,
        error: resultado.error
      });
    }
  } catch (error) {
    console.error('Error al descargar archivo:', error);
    res.status(500).json({
      exito: false,
      error: 'Error interno del servidor'
    });
  }
});

export default router;