/**
 * Evento de Dominio: StockBajo
 *
 * Se dispara cuando, tras un movimiento, un producto queda con stockActual <= stockMinimo.
 * Desacopla la detección del problema (regla que vive en la entidad Producto mediante estaBajoMinimo())
 * de la reacción ante él (alertar, notificar, enviar email o registrar auditoría en la capa de aplicación).
 */
export class StockBajoEvent {
  constructor(
    public readonly productoId: number,
    public readonly denominacion: string,
    public readonly stockActual: number,
    public readonly stockMinimo: number,
    public readonly fecha: Date = new Date(),
  ) {}
}

export { StockBajoEvent as StockBajo };
