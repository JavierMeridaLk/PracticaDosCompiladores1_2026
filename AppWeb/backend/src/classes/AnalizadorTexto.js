import { createRequire } from 'module';
import MotorLL from './MotorLL.js';

const require = createRequire(import.meta.url);
const jisonParser = require('./Analizador.cjs');

class AnalizadorTexto {

    // Analisis de la gramatica wison

    static analizar(contenido) {
        try {
            jisonParser.parser.limpiarErrores();
            const resultado = jisonParser.parse(contenido);
            const erroresJison = jisonParser.parser.getErrores();

            if (erroresJison.length > 0) {
                return { ok: false, mensaje: "Errores en la gramática", errores: erroresJison };
            }

            const validacionManual = this.validarGramaticaBasica(resultado);
            if (!validacionManual.ok) {
                return { ok: false, mensaje: "Gramática inválida", errores: validacionManual.errores };
            }

            const motor = this.inicializarMotor(resultado);
            if (motor.conflictos.length > 0) {
                return { 
                    ok: false, 
                    mensaje: "Gramática Ambigua", 
                    errores: motor.conflictos.map(c => ({ tipo: 'Semántico', descripcion: c, linea: 0, columna: 0 })) 
                };
            }

            return {
                ok: true,
                mensaje: "Gramática aceptada exitosamente",
                arbol: resultado,
                tablaM: motor.tablaM,
                lexico: resultado.lexico,
                simboloInicial: motor.simboloInicial
            };

        } catch (err) {
            return { ok: false, mensaje: "Error crítico", errores: [{ tipo: 'SISTEMA', descripcion: err.message }] };
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
                if (opcion[0] && opcion[0].id === p.lado_izquierdo) {
                    errores.push({ tipo: 'Semántico', descripcion: `Recursividad izquierda en: ${p.lado_izquierdo}` });
                }
            });
        });
        return { ok: errores.length === 0, errores };
    }

    // Análisis de la cadena de entrada usando la gramática Wison

    static analizarCadena(cadena, datosGramatica) {
        try {
            // Análisis Léxico generado por wison
            const tokens = this.tokenizar(cadena, datosGramatica.lexico);
            if (tokens.error) {
                return { ok: false, mensaje: "Error Léxico", errores: [tokens.error] };
            }

            // B. Análisis Sintáctico usando la Tabla M generada por wison
            const resultadoSintactico = this.parsearLL(tokens.lista, datosGramatica.tablaM, datosGramatica.simboloInicial);
            
            if (!resultadoSintactico.ok) {
                return { ok: false, mensaje: "Error Sintáctico", errores: [resultadoSintactico.error] };
            }

            return {
                ok: true,
                mensaje: "Cadena analizada correctamente",
                arbol: resultadoSintactico.arbol,
                tablaSimbolos: tokens.lista
            };

        } catch (error) {
            return { ok: false, mensaje: "Error en análisis de cadena", errores: [{ tipo: 'SISTEMA', descripcion: error.message }] };
        }
    }

    // Lxer de wison

    static tokenizar(cadena, definicionesLexicas) {
        let tokensEncontrados = [];
        let restante = cadena;
        let lineaActual = 1;
        let columnaActual = 1;

        // Construir regex para cada terminal

        const expresiones = definicionesLexicas.map(def => {
            return { id: def.identificador, regex: new RegExp("^(" + this.construirRegex(def.expresion) + ")") };
        });

        while (restante.length > 0) {
            // limpiar espacios y contar líneas
            const espacios = restante.match(/^[\s\n\r\t]+/);
            if (espacios) {
                const saltos = (espacios[0].match(/\n/g) || []).length;
                if (saltos > 0) {
                    lineaActual += saltos;
                    columnaActual = 1; 
                } else {
                    columnaActual += espacios[0].length;
                }
                restante = restante.slice(espacios[0].length);
                if (restante.length === 0) break;
            }

            let matchEncontrado = false;

            for (const def of expresiones) {
                const match = restante.match(def.regex);
                if (match && match[0].length > 0) {
                    tokensEncontrados.push({
                        id: def.id,
                        lexema: match[0],
                        linea: lineaActual,
                        columna: columnaActual
                    });
                    restante = restante.slice(match[0].length);
                    columnaActual += match[0].length;
                    matchEncontrado = true;
                    break; 
                }
            }

            if (!matchEncontrado) {
                return { 
                    error: { tipo: 'Léxico', descripcion: `Carácter no reconocido`, lexema: restante[0], linea: lineaActual, columna: columnaActual } 
                };
            }
        }
        return { ok: true, lista: tokensEncontrados };
    }

    static construirRegex(exp) {
        if (Array.isArray(exp)) return exp.map(e => this.construirRegex(e)).join("");
        
        switch (exp.tipo) {
            case 'Cadena': return exp.valor.replace(/'/g, "").replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escapar especiales
            case 'Rango_Letras': return "[a-zA-Z]";
            case 'Rango_Numeros': return "[0-9]";
            case 'Kleene': return `(${this.construirRegex(exp.expresion)})*`;
            case 'Cerradura_Positiva': return `(${this.construirRegex(exp.expresion)})+`;
            case 'Opcional': return `(${this.construirRegex(exp.expresion)})?`;
            case 'Agrupacion': return `(${this.construirRegex(exp.expresion)})`;
            default: return "";
        }
    }

    // parse dle wison

    static parsearLL(tokens, tablaM, simboloInicial) {

        let entrada = [...tokens, { id: '$', lexema: 'EOF', linea: -1, columna: -1 }];
        let pila = ['$', simboloInicial];
        let i = 0;

        let arbol = { id: simboloInicial, hijos: [] };
        let pilaNodos = [null, arbol];

        while (pila.length > 0) {
            let X = pila.pop();
            let nodoActual = pilaNodos.pop();
            let token = entrada[i];

            if (X === token.id || (X === '$' && token.id === '$')) {
                // Match exitoso 
                if (nodoActual) nodoActual.lexema = token.lexema; // Guardar el lexema en la hoja del árbol
                i++;
            } else if (X.startsWith('$_') || X === '$') {
                return { 
                    ok: false, 
                    error: { tipo: 'Sintáctico', descripcion: `Se esperaba el token '${X}'`, lexema: token.lexema, linea: token.linea, columna: token.columna } 
                };
            } else {

                // Expansión con Tabla M

                const produccion = tablaM[X] ? tablaM[X][token.id] : null;
                if (!produccion) {
                    return { 
                        ok: false, 
                        error: { tipo: 'Sintáctico', descripcion: `No hay regla para el No Terminal '${X}' con entrada '${token.lexema}'`, lexema: token.lexema, linea: token.linea, columna: token.columna } 
                    };
                }

                const reglaInversa = [...produccion.rhs].reverse();
                
                // Procesar regla

                reglaInversa.forEach(simbolo => {
                    pila.push(simbolo.id);
                    const nuevoNodo = { id: simbolo.id, hijos: [] };
                    nodoActual.hijos.unshift(nuevoNodo); // Insertar al inicio para mantener el orden de izquierda a derecha
                    pilaNodos.push(nuevoNodo);
                });
            }
        }

        return { ok: true, arbol: arbol };
    }
}

export default AnalizadorTexto;