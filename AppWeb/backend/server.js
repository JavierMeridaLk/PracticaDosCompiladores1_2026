import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';

// Importamos la lógica de análisis
// Asegúrate de que esta ruta sea la correcta en tu estructura de carpetas
import AnalizadorTexto from './src/classes/AnalizadorTexto.js';

const app = express();
const PORT = 5000;

// Configuración para obtener rutas en módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(cors()); // Permite que Vue se conecte sin bloqueos
app.use(express.json()); // Permite recibir JSON en el body

// 1. Crear carpeta 'uploads' si no existe
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// 2. Servir archivos estáticos
app.use('/api/files', express.static(uploadDir));

// 3. Configuración de Multer para archivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage });

/**
 * RUTA 1: Analizar Gramática (Panel Izquierdo)
 * Se encarga de validar la gramática Wison y generar la Tabla M.
 */
app.post('/api/analizar', (req, res) => {
    try {
        const { entrada } = req.body;
        
        if (!entrada) {
            return res.status(400).json({ ok: false, mensaje: "No hay texto para analizar" });
        }

        const respuesta = AnalizadorTexto.analizar(entrada);
        res.json(respuesta);
    } catch (error) {
        console.error("Error en /api/analizar:", error);
        res.status(500).json({ ok: false, mensaje: "Error crítico en el análisis de gramática" });
    }
});

/**
 * RUTA 2: Analizar Cadena de Entrada (Panel Derecho)
 * Esta es la ruta que tu App.vue estaba buscando y no encontraba.
 */
app.post('/api/analizar-cadena', (req, res) => {
    try {
        const { cadena, datosGramatica } = req.body;

        if (!datosGramatica) {
            return res.status(400).json({ 
                ok: false, 
                mensaje: "Faltan los datos de la gramática procesada." 
            });
        }

        // Ejecutamos el análisis de la cadena usando los datos de la gramática previa
        const resultado = AnalizadorTexto.analizarCadena(cadena, datosGramatica);
        
        res.json(resultado);
    } catch (error) {
        console.error("Error en /api/analizar-cadena:", error);
        res.status(500).json({ 
            ok: false, 
            mensaje: "Error interno al procesar la cadena",
            errores: [{ tipo: 'SISTEMA', descripcion: error.message }]
        });
    }
});

/**
 * RUTA 3: Subida de archivos
 */
app.post('/api/upload', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ exito: false, mensaje: "No se subió ningún archivo" });
        }

        res.json({
            exito: true,
            archivo: { 
                nombreUnico: req.file.filename 
            }
        });
    } catch (error) {
        res.status(500).json({ exito: false, mensaje: "Error interno al subir el archivo" });
    }
});

// Inicio del servidor
app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
    console.log(`📂 Archivos servidos en http://localhost:${PORT}/api/files/`);
    console.log(`====================================================`);
});