import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { StockBajoEvent } from '../../domain/events/stock-bajo.event';
import { StockActualizadoEvent } from '../../domain/events/stock-actualizado.event';

/**
 * Handler de Aplicación para Eventos de Dominio de Stock.
 *
 * Separa la detección del problema (regla de negocio que vive en el dominio / Producto.estaBajoMinimo())
 * de la reacción ante él (alertar, notificar, auditar o integrar), desacoplando el dominio.
 */
@Injectable()
export class StockEventsHandler {
  private readonly logger = new Logger(StockEventsHandler.name);

  /**
   * Reacciona ante la detección de stock bajo disparada por el evento de dominio StockBajo.
   * Genera alertas, notificaciones y logs para el área operativa.
   */
  @OnEvent('producto.stock.bajo', { async: true })
  handleStockBajoEvent(event: StockBajoEvent) {
    this.logger.warn(
      `[ALERTA DE STOCK BAJO] Producto '${event.denominacion}' (ID: ${event.productoId}) ha entrado en estado de alerta: stockActual (${event.stockActual}) <= stockMinimo (${event.stockMinimo}).`,
    );
  }

  /**
   * Reacciona ante cualquier cambio de stock (StockActualizado).
   * Registra auditoría y trazabilidad en la capa de aplicación.
   */
  @OnEvent('producto.stock.actualizado', { async: true })
  handleStockActualizadoEvent(event: StockActualizadoEvent) {
    this.logger.log(
      `[STOCK ACTUALIZADO] Producto '${event.denominacion}' (ID: ${event.productoId}) - Movimiento: ${event.tipoMovimiento} (${event.cantidad > 0 ? '+' : ''}${event.cantidad}). Stock anterior: ${event.stockAnterior} -> Stock nuevo: ${event.stockActual}. Motivo: ${event.motivo ?? 'N/A'}.`,
    );
  }
}
