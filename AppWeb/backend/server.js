import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';
import AnalizadorTexto from './src/classes/AnalizadorTexto.js';

const app = express();
const PORT = 5000;

// Configuración para obtener rutas en módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuraciones necesarias
app.use(cors());
app.use(express.json());

// 1. Crear carpeta 'uploads' si no existe para evitar errores
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// 2. Hacer que la carpeta sea accesible mediante URL (Soluciona el error Cannot GET)
app.use('/api/files', express.static(uploadDir));

// 3. Configurar Multer para guardar archivos con su nombre original
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // Mantenemos el nombre original para que coincida con lo que pide el front
        cb(null, file.originalname);
    }
});
const upload = multer({ storage });

/**
 * RUTA 1: Analizar Texto (Mantiene tu lógica actual)
 */
app.post('/api/analizar', (req, res) => {
    const { entrada } = req.body;
    
    if (!entrada) {
        return res.status(400).json({ ok: false, mensaje: "No hay texto para analizar" });
    }

    const respuesta = AnalizadorTexto.analizar(entrada);
    res.json(respuesta);
});

/**
 * RUTA 2: Subida de archivos (Real, no simulada)
 */
app.post('/api/upload', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ exito: false, mensaje: "No se subió ningún archivo" });
        }

        // Devolvemos el nombre con el que se guardó para que el front lo pida
        res.json({
            exito: true,
            archivo: { 
                nombreUnico: req.file.filename 
            }
        });
    } catch (error) {
        res.status(500).json({ exito: false, mensaje: "Error interno al subir" });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
    console.log(`Archivos servidos en http://localhost:${PORT}/api/files/`);
});