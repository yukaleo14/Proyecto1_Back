export class DatosProductoInvalidosException extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = 'DatosProductoInvalidosException';
    Object.setPrototypeOf(this, DatosProductoInvalidosException.prototype);
  }
}
