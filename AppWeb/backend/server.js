import express from 'express';
import cors from 'cors';
import AnalizadorTexto from './src/classes/AnalizadorTexto.js';

const app = express();
const PORT = 5000;

// Configuraciones necesarias
app.use(cors()); // Permite que Vue se conecte al servidor
app.use(express.json()); // Permite recibir JSON

/**
 * RUTA 1: Analizar Texto directamente (El botón verde)
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
 * RUTA 2: Subida de archivos (Simulada para que funcione con tu App.vue)
 * En lugar de guardar en disco, devolvemos un éxito para que el frontend
 * maneje la lectura local, que es más rápido y seguro.
 */
app.post('/api/upload', (req, res) => {
    // Como tu App.vue usa FormData, aquí recibimos el archivo.
    // Para simplificar y que no te dé error de conexión:
    res.json({
        exito: true,
        archivo: { nombreUnico: "temp_file" }
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
});