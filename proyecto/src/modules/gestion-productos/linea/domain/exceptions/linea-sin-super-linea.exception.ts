/**
 * Excepción de dominio lanzada cuando se intenta crear o instanciar una Línea
 * sin estar asociada a una SuperLínea obligatoria.
 *
 * Invariante de existencia: Toda Línea debe pertenecer a una SuperLínea.
 */
export class LineaSinSuperLineaException extends Error {
  constructor(mensaje: string = 'La SuperLínea es obligatoria para toda Línea.') {
    super(mensaje);
    this.name = 'LineaSinSuperLineaException';
    Object.setPrototypeOf(this, LineaSinSuperLineaException.prototype);
  }
}
