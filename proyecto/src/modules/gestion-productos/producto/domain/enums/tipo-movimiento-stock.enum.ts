/**
 * Tipos de movimiento de stock admitidos por el dominio.
 * Aportan trazabilidad e historial sobre los cambios de stock.
 */
export enum TipoMovimientoStock {
  COMPRA = 'Compra',
  VENTA = 'Venta',
  DEVOLUCION_CLIENTE = 'Devolución de cliente',
  DEVOLUCION_PROVEEDOR = 'Devolución a proveedor',
  AJUSTE = 'Ajuste',
}
