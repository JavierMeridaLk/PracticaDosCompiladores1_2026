import { createRequire } from 'module';
import MotorLL from './MotorLL.js'; // Importamos la nueva clase

const require = createRequire(import.meta.url);
const jisonParser = require('./Analizador.cjs');

class AnalizadorTexto {
    static analizar(contenido) {
        try {
            jisonParser.parser.limpiarErrores();
            const resultado = jisonParser.parse(contenido);
            const erroresJison = jisonParser.parser.getErrores();

            if (erroresJison.length > 0) {
                return { ok: false, mensaje: "Errores sintácticos o léxicos en la gramática", errores: erroresJison };
            }

            // 1. Validaciones manuales rápidas (Recursividad y Factorización)
            const validacionManual = this.validarGramaticaBasica(resultado);
            if (!validacionManual.ok) {
                return { ok: false, mensaje: "Gramática inválida para LL", errores: validacionManual.errores };
            }

            // 2. Procesamiento de Tabla M y Ambigüedad mediante MotorLL
            const motor = this.inicializarMotor(resultado);
            
            if (motor.conflictos.length > 0) {
                return { 
                    ok: false, 
                    mensaje: "Gramática Ambigua", 
                    errores: motor.conflictos.map(c => ({ tipo: 'Semántico', descripcion: c })) 
                };
            }

            // ÉXITO: Retornamos todo lo necesario para el Front y para el análisis de cadena
            return {
                ok: true,
                mensaje: "Gramática aceptada exitosamente",
                arbol: resultado,
                tablaM: motor.tablaM,
                first: motor.first,
                follow: motor.follow
            };

        } catch (err) {
            return { 
                ok: false, 
                mensaje: "Error crítico en el motor", 
                errores: [{ tipo: 'SISTEMA', descripcion: err.message }] 
            };
        }
    }

    static inicializarMotor(ast) {
        const producciones = ast.sintaxis.filter(i => i.tipo === 'Produccion');
        const noTerminales = [...new Set(producciones.map(p => p.lado_izquierdo))];
        const inicial = ast.sintaxis.find(i => i.tipo === 'Def_Simbolo_Inicial')?.id || noTerminales[0];
        
        const motor = new MotorLL(producciones, noTerminales, inicial);
        motor.calcularFirst();
        motor.calcularFollow();
        motor.construirTablaM();
        
        return motor;
    }

    static validarGramaticaBasica(ast) {
        let errores = [];
        const producciones = ast.sintaxis.filter(i => i.tipo === 'Produccion');

        producciones.forEach(p => {
            p.lado_derecho.forEach(opcion => {
                // Recursividad izquierda directa
                if (opcion[0] && opcion[0].id === p.lado_izquierdo) {
                    errores.push({ tipo: 'Semántico', descripcion: `Recursividad izquierda en: ${p.lado_izquierdo}` });
                }
            });
            
            // Factorización (primeros símbolos iguales en diferentes opciones)
            let primeros = p.lado_derecho.map(opcion => opcion[0]?.id);
            let duplicados = primeros.filter((s, i) => primeros.indexOf(s) !== i && s !== null);
            if (duplicados.length > 0) {
                errores.push({ tipo: 'Semántico', descripcion: `Requiere factorización en: ${p.lado_izquierdo}` });
            }
        });

        return { ok: errores.length === 0, errores };
    }
}

export default AnalizadorTexto;