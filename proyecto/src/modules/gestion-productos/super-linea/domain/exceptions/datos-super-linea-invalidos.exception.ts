/**
 * Excepción de dominio para capturar invariantes inválidas de SuperLinea
 * (nombre en blanco, strings vacíos, etc.).
 */
export class DatosSuperLineaInvalidosException extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = 'DatosSuperLineaInvalidosException';
    Object.setPrototypeOf(this, DatosSuperLineaInvalidosException.prototype);
  }
}
