import GestorArchivos from '../classes/GestorArchivos.js';
import AnalizadorTexto from '../classes/AnalizadorTexto.js';
import ManejadorErrores from '../classes/ManejadorErrores.js';
import EvaluadorCadena from '../classes/EvaluadorCadena.js';

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
  async procesarArchivoSubido(archivo) {
    try {
      // Subir el archivo usando GestorArchivos
      const resultadoSubida = await this.gestorArchivos.subirArchivo(archivo);

      if (!resultadoSubida.exito) {
        return resultadoSubida;
      }

      // Leer el contenido del archivo subido
      const resultadoLectura = await this.gestorArchivos.leerArchivo(resultadoSubida.nombreUnico);

      if (!resultadoLectura.exito) {
        return resultadoLectura;
      }

      // Procesar el texto del archivo
      const resultadoAnalisis = await this.procesarTexto(resultadoLectura.contenido);

      return {
        ...resultadoSubida,
        analisis: resultadoAnalisis
      };
    } catch (error) {
      return {
        exito: false,
        error: error.message
      };
    }
  }

  /**
   * Procesa texto que ha sido ingresado directamente
   * @param {string} texto - Texto a procesar
   * @returns {Object} Resultado del procesamiento
   */
  async procesarTexto(texto) {
    try {
      const resultadoAnalisis = this.analizadorTexto.analizarTexto(texto);
      return resultadoAnalisis;
    } catch (error) {
      return {
        exito: false,
        error: error.message
      };
    }
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

// Dentro de ServicioCompilador.js
  async procesarEntradaCadena(cadena, datosGramatica) {
    // Llamamos al método estático que acabamos de crear
    return AnalizadorTexto.analizarCadena(cadena, datosGramatica);
  }

export default ServicioCompilador;