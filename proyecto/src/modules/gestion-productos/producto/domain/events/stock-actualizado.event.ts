import { TipoMovimientoStock } from '../enums/tipo-movimiento-stock.enum';

/**
 * Evento de Dominio: StockActualizado
 *
 * Se dispara cada vez que cambia el stock de un producto (por cualquier tipo de movimiento:
 * compra, venta, devolución de cliente, devolución a proveedor o ajuste manual).
 * Desacopla la mutación del stock de auditoría, integraciones o efectos secundarios.
 */
export class StockActualizadoEvent {
  constructor(
    public readonly productoId: number,
    public readonly denominacion: string,
    public readonly stockAnterior: number,
    public readonly stockActual: number,
    public readonly cantidad: number,
    public readonly tipoMovimiento: TipoMovimientoStock | string,
    public readonly motivo?: string,
    public readonly fecha: Date = new Date(),
  ) {}
}

export { StockActualizadoEvent as StockActualizado };
