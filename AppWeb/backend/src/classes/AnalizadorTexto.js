import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const jisonParser = require('./Analizador.cjs');

class AnalizadorTexto {
    static analizar(contenido) {
        try {
            // Limpiar errores de ejecuciones previas
            jisonParser.parser.limpiarErrores();
            
            // Analizar
            const resultado = jisonParser.parse(contenido);
            const errores = jisonParser.parser.getErrores();

            return {
                ok: errores.length === 0,
                mensaje: errores.length === 0 ? "Gramática válida" : "Errores encontrados",
                arbol: resultado,
                errores: errores
            };
        } catch (err) {
            return {
                ok: false,
                mensaje: "Error crítico en el análisis",
                errores: jisonParser.parser.getErrores()
            };
        }
    }
}

export default AnalizadorTexto;