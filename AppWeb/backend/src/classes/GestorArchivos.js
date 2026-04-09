import fs from 'fs';
import path from 'path';
import { validarExtensionArchivo, generarNombreUnicoArchivo, asegurarDirectorioExiste, leerArchivoAsync, escribirArchivoAsync } from '../utils/fileUtils.js';

/**
 * Maneja todas las operaciones relacionadas con archivos de texto:
 */
class GestorArchivos {
  constructor() {
    this.directorioUploads = path.join(process.cwd(), 'uploads');
    this.directorioResultados = path.join(process.cwd(), 'results');
    this.inicializarDirectorios();
  }

  inicializarDirectorios() {
    asegurarDirectorioExiste(this.directorioUploads);
    asegurarDirectorioExiste(this.directorioResultados);
  }

  /**
   * Sube un archivo de texto al servidor
   * @param {Object} 
   * @returns {Promise<Object>} 
   */
  async subirArchivo(archivo) {
    try {
      // Validar que sea un archivo .txt
      if (!this.validarTipoArchivo(archivo.originalname)) {
        throw new Error('Solo se permiten archivos .txt');
      }

      // Generar nombre único
      const nombreUnico = generarNombreUnicoArchivo(archivo.originalname);
      const rutaDestino = path.join(this.directorioUploads, nombreUnico);

      // Mover archivo a la ubicación final
      await fs.promises.rename(archivo.path, rutaDestino);

      return {
        exito: true,
        nombreOriginal: archivo.originalname,
        nombreUnico: nombreUnico,
        ruta: rutaDestino,
        tamano: archivo.size
      };
    } catch (error) {
      return {
        exito: false,
        error: error.message
      };
    }
  }

  /**
   * Guarda un archivo de texto creado en el servidor
   * @param {string} 
   * @param {string} 
   * @returns {Promise<Object>}
   */
  async guardarArchivo(contenido, nombreArchivo) {
    try {
      const nombreUnico = generarNombreUnicoArchivo(nombreArchivo);
      const rutaArchivo = path.join(this.directorioResultados, nombreUnico);

      await escribirArchivoAsync(rutaArchivo, contenido);

      return {
        exito: true,
        nombreArchivo: nombreUnico,
        ruta: rutaArchivo
      };
    } catch (error) {
      return {
        exito: false,
        error: error.message
      };
    }
  }

  /**
   * Lee un archivo existente del servidor
   * @param {string}
   * @returns {Promise<Object>}
   */
  async leerArchivo(nombreArchivo) {
    try {
      const rutaArchivo = path.join(this.directorioUploads, nombreArchivo);

      // Verificar que el archivo existe
      if (!fs.existsSync(rutaArchivo)) {
        throw new Error('Archivo no encontrado');
      }

      const contenido = await leerArchivoAsync(rutaArchivo);

      return {
        exito: true,
        contenido: contenido,
        nombreArchivo: nombreArchivo
      };
    } catch (error) {
      return {
        exito: false,
        error: error.message
      };
    }
  }

  /**
   * Valida que el archivo sea de tipo texto
   * @param {string} nombreArchivo - Nombre del archivo a validar
   * @returns {boolean} True si es válido, false si no
   */
  validarTipoArchivo(nombreArchivo) {
    return validarExtensionArchivo(nombreArchivo);
  }

  /**
   * Lista todos los archivos guardados
   * @returns {Promise<Array>} Lista de archivos
   */
  async listarArchivos() {
    try {
      const archivosUploads = await fs.promises.readdir(this.directorioUploads);
      const archivosResultados = await fs.promises.readdir(this.directorioResultados);

      const archivos = [];

      // Procesar archivos de uploads
      for (const archivo of archivosUploads) {
        const rutaCompleta = path.join(this.directorioUploads, archivo);
        const stats = await fs.promises.stat(rutaCompleta);
        archivos.push({
          nombre: archivo,
          tipo: 'upload',
          tamano: stats.size,
          fechaModificacion: stats.mtime,
          ruta: rutaCompleta
        });
      }

      // Procesar archivos de resultados
      for (const archivo of archivosResultados) {
        const rutaCompleta = path.join(this.directorioResultados, archivo);
        const stats = await fs.promises.stat(rutaCompleta);
        archivos.push({
          nombre: archivo,
          tipo: 'resultado',
          tamano: stats.size,
          fechaModificacion: stats.mtime,
          ruta: rutaCompleta
        });
      }

      return {
        exito: true,
        archivos: archivos
      };
    } catch (error) {
      return {
        exito: false,
        error: error.message,
        archivos: []
      };
    }
  }
}

export default GestorArchivos;