/**
 * Excepción de dominio lanzada al intentar eliminar una SuperLinea
 * que aún posee líneas asociadas.
 *
 * Cumple con el criterio de aceptación:
 * "Intentar borrar una SuperLinea con líneas arroja error 'No se puede eliminar: existen X líneas asociadas a esta SuperLínea'".
 */
export class SuperLineaConLineasAsociadasException extends Error {
  readonly cantidadLineas: number;

  constructor(cantidadLineas: number) {
    super(`No se puede eliminar: existen ${cantidadLineas} líneas asociadas a esta SuperLínea.`);
    this.name = 'SuperLineaConLineasAsociadasException';
    this.cantidadLineas = cantidadLineas;
    Object.setPrototypeOf(this, SuperLineaConLineasAsociadasException.prototype);
  }
}
