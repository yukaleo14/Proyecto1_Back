/**
 * Excepción de dominio lanzada cuando una operación en lote viola
 * la invariante de negocio: ningún precio resultante puede ser ≤ 0.
 * Su lanzamiento cancela la transacción completa.
 */
export class OperacionInvalidaException extends Error {
  /** Lista de productos que generarían un precio inválido */
  readonly productosConError: { id: number; denominacion: string; precioProyectado: number }[];

  constructor(
    mensaje: string,
    productosConError: { id: number; denominacion: string; precioProyectado: number }[] = [],
  ) {
    super(mensaje);
    this.name = 'OperacionInvalidaException';
    this.productosConError = productosConError;
    Object.setPrototypeOf(this, OperacionInvalidaException.prototype);
  }
}
