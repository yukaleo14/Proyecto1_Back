import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PrecioModificadoEvent } from '../../domain/events/precio-modificado.event';
import { HistoricoPrecio } from '../../domain/entities/historico-precio.entity';
import { Producto } from '../../domain/entities/producto.entity';
import { Usuario } from 'src/modules/gestion-usuario/usuario/domain/entities/usuario.entity';

@Injectable()
export class HistoricoPrecioEventHandler {
  private readonly logger = new Logger(HistoricoPrecioEventHandler.name);

  constructor(
    @InjectRepository(HistoricoPrecio)
    private readonly historicoRepository: Repository<HistoricoPrecio>,
  ) {}

  @OnEvent('producto.precio.modificado', { async: true })
  async handlePrecioModificadoEvent(event: PrecioModificadoEvent) {
    this.logger.debug(
      `Manejando evento de precio modificado para Producto ID: ${event.productoId}`,
    );

    try {
      const historico = new HistoricoPrecio();
      // Asignar el ID de la relación ManyToOne usando un objeto parcial
      historico.producto = { id: event.productoId } as Producto;
      historico.precioAnterior = event.precioAnterior;
      historico.precioNuevo = event.precioNuevo;
      historico.tipoOperacion = event.tipoOperacion;
      historico.motivo = event.motivo;
      
      if (event.usuarioId) {
        historico.usuario = { id: event.usuarioId } as Usuario;
      }

      await this.historicoRepository.save(historico);
      
      this.logger.log(
        `HistoricoPrecio registrado correctamente (Producto ${event.productoId}: $${event.precioAnterior ?? 0} -> $${event.precioNuevo})`,
      );
    } catch (error) {
      this.logger.error(
        `Error al guardar HistoricoPrecio para el Producto ID ${event.productoId}`,
        error,
      );
    }
  }
}
