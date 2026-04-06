import GestorArchivos from '../classes/GestorArchivos.js';
import AnalizadorTexto from '../classes/AnalizadorTexto.js';
import ManejadorErrores from '../classes/ManejadorErrores.js';

/**
 * Clase ServicioCompilador
 * Servicio principal que coordina todas las operaciones del compilador.
 * Actúa como punto central para:
 * - Procesar archivos subidos
 * - Procesar texto ingresado
 * - Gestionar el análisis completo
 * - Obtener resultados y errores
 * - Guardar resultados del análisis
 */
class ServicioCompilador {
  constructor() {
    this.gestorArchivos = new GestorArchivos();
    this.analizadorTexto = new AnalizadorTexto();
    this.manejadorErrores = new ManejadorErrores();
  }

  /**
   * Procesa un archivo que ha sido subido al servidor
   * @param {Object} archivo - Archivo subido a procesar
   * @returns {Promise<Object>} Resultado del procesamiento
   */
  procesarArchivoSubido(archivo) {
    // Implementación pendiente
  }

  /**
   * Procesa texto que ha sido ingresado directamente
   * @param {string} texto - Texto a procesar
   * @returns {Object} Resultado del procesamiento
   */
  procesarTexto(texto) {
    // Implementación pendiente
  }

  /**
   * Obtiene el resultado del análisis realizado
   * @returns {Object} Resultado del análisis
   */
  obtenerResultadoAnalisis() {
    // Implementación pendiente
  }

  /**
   * Obtiene el AST generado durante el análisis
   * @returns {ArbolAST} Árbol de sintaxis abstracta generado
   */
  obtenerASTGenerado() {
    // Implementación pendiente
  }

  /**
   * Obtiene los errores encontrados durante el proceso
   * @returns {Array} Lista de errores
   */
  obtenerErrores() {
    // Implementación pendiente
  }

  /**
   * Guarda el resultado del análisis en un archivo
   * @param {Object} resultado - Resultado a guardar
   * @param {string} nombreArchivo - Nombre del archivo donde guardar
   * @returns {Promise<Object>} Resultado del guardado
   */
  guardarResultado(resultado, nombreArchivo) {
    // Implementación pendiente
  }
}

export default ServicioCompilador;