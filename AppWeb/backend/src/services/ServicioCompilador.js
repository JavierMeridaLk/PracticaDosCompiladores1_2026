import GestorArchivos from '../classes/GestorArchivos.js';
import AnalizadorTexto from '../classes/AnalizadorTexto.js';
import ManejadorErrores from '../classes/ManejadorErrores.js';
import EvaluadorCadena from '../classes/EvaluadorCadena.js';

/**
 * Servicio principal que coordina todas las operaciones del compilador.
 */
class ServicioCompilador {
  constructor() {
    this.gestorArchivos = new GestorArchivos();
    this.analizadorTexto = new AnalizadorTexto();
    this.manejadorErrores = new ManejadorErrores();
  }

  /**
   * Procesa un archivo que ha sido subido al servidor
   * @param {Object}
   * @returns {Promise<Object>} 
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
   * @param {string} 
   * @returns {Object}
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
}

// Dentro de ServicioCompilador.js
  async procesarEntradaCadena(cadena, datosGramatica) {
    // Llamamos al método estático que acabamos de crear
    return AnalizadorTexto.analizarCadena(cadena, datosGramatica);
  }

export default ServicioCompilador;