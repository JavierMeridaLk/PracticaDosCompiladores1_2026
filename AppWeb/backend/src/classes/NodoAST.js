/**
 * Clase NodoAST
 * Representa un nodo en el Árbol de Sintaxis Abstracta (AST).
 * Cada nodo contiene información sobre un elemento del código analizado:
 * - Tipo de nodo (identificador, operador, expresión, etc.)
 * - Valor del nodo
 * - Posición en el código fuente (línea y columna)
 * - Lista de nodos hijos
 */
class NodoAST {
  /**
   * Constructor del nodo AST
   * @param {string} tipo - Tipo del nodo (ej: 'identificador', 'numero', 'operador')
   * @param {string|number} valor - Valor del nodo
   * @param {number} linea - Línea donde se encuentra el nodo
   * @param {number} columna - Columna donde se encuentra el nodo
   */
  constructor(tipo, valor, linea, columna) {
    this.tipo = tipo;
    this.valor = valor;
    this.linea = linea;
    this.columna = columna;
    this.hijos = [];
  }

  /**
   * Agrega un nodo hijo a este nodo
   * @param {NodoAST} hijo - Nodo hijo a agregar
   */
  agregarHijo(hijo) {
    // Implementación pendiente
  }

  /**
   * Obtiene la lista de nodos hijos
   * @returns {Array<NodoAST>} Lista de hijos
   */
  obtenerHijos() {
    // Implementación pendiente
  }

  /**
   * Obtiene el tipo del nodo
   * @returns {string} Tipo del nodo
   */
  obtenerTipo() {
    // Implementación pendiente
  }

  /**
   * Obtiene el valor del nodo
   * @returns {string|number} Valor del nodo
   */
  obtenerValor() {
    // Implementación pendiente
  }

  /**
   * Obtiene la posición del nodo en el código fuente
   * @returns {Object} Objeto con linea y columna
   */
  obtenerPosicion() {
    // Implementación pendiente
  }
}

export default NodoAST;