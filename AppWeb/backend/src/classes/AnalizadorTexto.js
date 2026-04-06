import ArbolAST from './ArbolAST.js';
import ManejadorErrores from './ManejadorErrores.js';

/**
 * Clase AnalizadorTexto
 * Coordina el análisis léxico y sintáctico del texto de entrada.
 * Utiliza Jison para el análisis y construye el Árbol de Sintaxis Abstracta:
 * - Análisis de cadenas de texto
 * - Análisis de archivos
 * - Integración con el analizador Jison
 * - Construcción del AST
 * - Gestión de errores durante el análisis
 */
class AnalizadorTexto {
  constructor() {
    this.arbolAST = new ArbolAST();
    this.manejadorErrores = new ManejadorErrores();
  }

  /**
   * Analiza una cadena de texto
   * @param {string} texto - Texto a analizar
   * @returns {Object} Resultado del análisis
   */
  analizarTexto(texto) {
    // Implementación pendiente
  }

  /**
   * Analiza un archivo de texto
   * @param {string} nombreArchivo - Nombre del archivo a analizar
   * @returns {Object} Resultado del análisis
   */
  analizarArchivo(nombreArchivo) {
    // Implementación pendiente
  }

  /**
   * Utiliza Jison para analizar el texto
   * @param {string} texto - Texto a analizar con Jison
   * @returns {Object} Resultado del análisis de Jison
   */
  analizarConJison(texto) {
    // Implementación pendiente
  }

  /**
   * Construye el AST a partir del resultado del análisis
   * @param {Object} resultadoAnalisis - Resultado del analizador
   */
  construirAST(resultadoAnalisis) {
    // Implementación pendiente
  }

  /**
   * Obtiene el AST construido
   * @returns {ArbolAST} Árbol de sintaxis abstracta
   */
  obtenerAST() {
    // Implementación pendiente
  }

  /**
   * Obtiene los errores encontrados durante el análisis
   * @returns {Array} Lista de errores
   */
  obtenerErrores() {
    // Implementación pendiente
  }
}

export default AnalizadorTexto;