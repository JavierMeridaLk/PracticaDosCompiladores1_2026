/**
 * Utilidades para manejo de archivos
 * Funciones auxiliares para operaciones comunes con archivos
 */

import fs from 'fs';
import path from 'path';

/**
 * Valida que la extensión del archivo sea de texto
 * @param {string} nombreArchivo - Nombre del archivo a validar
 * @returns {boolean} True si la extensión es válida (.txt, .text)
 */
export function validarExtensionArchivo(nombreArchivo) {
  const extensionesValidas = ['.txt', '.text'];
  const extension = path.extname(nombreArchivo).toLowerCase();
  return extensionesValidas.includes(extension);
}

/**
 * Genera un nombre único para un archivo
 * @param {string} nombreOriginal - Nombre original del archivo
 * @returns {string} Nombre único generado
 */
export function generarNombreUnicoArchivo(nombreOriginal) {
  const timestamp = Date.now();
  const extension = path.extname(nombreOriginal);
  const nombreSinExtension = path.basename(nombreOriginal, extension);
  const nombreUnico = `${nombreSinExtension}_${timestamp}${extension}`;
  return nombreUnico;
}

/**
 * Crea un directorio si no existe
 * @param {string} rutaDirectorio - Ruta del directorio a crear
 */
export function asegurarDirectorioExiste(rutaDirectorio) {
  if (!fs.existsSync(rutaDirectorio)) {
    fs.mkdirSync(rutaDirectorio, { recursive: true });
  }
}

/**
 * Lee un archivo de forma asíncrona
 * @param {string} rutaArchivo - Ruta del archivo a leer
 * @returns {Promise<string>} Contenido del archivo
 */
export async function leerArchivoAsync(rutaArchivo) {
  return await fs.promises.readFile(rutaArchivo, 'utf8');
}

/**
 * Escribe en un archivo de forma asíncrona
 * @param {string} rutaArchivo - Ruta del archivo a escribir
 * @param {string} contenido - Contenido a escribir
 * @returns {Promise<void>}
 */
export async function escribirArchivoAsync(rutaArchivo, contenido) {
  await fs.promises.writeFile(rutaArchivo, contenido, 'utf8');
}

/**
 * Elimina un archivo
 * @param {string} rutaArchivo - Ruta del archivo a eliminar
 * @returns {Promise<void>}
 */
export async function eliminarArchivo(rutaArchivo) {
  if (fs.existsSync(rutaArchivo)) {
    await fs.promises.unlink(rutaArchivo);
  }
}