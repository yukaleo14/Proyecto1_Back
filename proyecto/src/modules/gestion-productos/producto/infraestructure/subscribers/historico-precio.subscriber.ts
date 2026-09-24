import {
  EventSubscriber,
  EntitySubscriberInterface,
  UpdateEvent,
  InsertEvent,
} from 'typeorm';
import { Logger, Injectable, Inject } from '@nestjs/common';
import { Producto } from '../../domain/entities/producto.entity';
import { HistoricoPrecio } from '../../domain/entities/historico-precio.entity';
import { DataSource } from 'typeorm';

@EventSubscriber()
@Injectable()
export class HistoricoPrecioSubscriber implements EntitySubscriberInterface<Producto> {
  private readonly logger = new Logger(HistoricoPrecioSubscriber.name);

  constructor(dataSource: DataSource) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return Producto;
  }

  async afterInsert(event: InsertEvent<Producto>) {
    const { entity, manager } = event;
    if (!entity) return;

    if (entity.precio !== undefined && entity.precio !== null) {
      const historico = new HistoricoPrecio();
      historico.producto = entity;
      historico.precioAnterior = null;
      historico.precioNuevo = entity.precio;
      historico.tipoOperacion = 'CREACIÓN';
      historico.motivo = 'Precio inicial';
      if (entity.usuarioCreated) {
        historico.usuario = entity.usuarioCreated;
      }

      await manager.save(HistoricoPrecio, historico);
      this.logger.debug(`HistoricoPrecio creado para Producto ID ${entity.id}`);
    }
  }

  async afterUpdate(event: UpdateEvent<Producto>) {
    const { entity, databaseEntity, manager } = event;
    if (!entity || !databaseEntity) return;

    // Check if price has changed
    const precioAnterior = Number(databaseEntity.precio) || 0;
    const precioNuevo = Number(entity.precio) || 0;

    if (precioAnterior !== precioNuevo) {
      const historico = new HistoricoPrecio();
      historico.producto = entity as Producto;
      historico.precioAnterior = precioAnterior;
      historico.precioNuevo = precioNuevo;
      
      // We can infer the operation type if it was set temporarily, or just default to ACTUALIZACIÓN
      // Using generic update
      historico.tipoOperacion = (entity as any)._tipoOperacionTemporal || 'ACTUALIZACIÓN';
      historico.motivo = (entity as any)._motivoTemporal || 'Cambio de precio';
      
      if (entity.usuarioUpdated) {
        historico.usuario = entity.usuarioUpdated;
      }

      await manager.save(HistoricoPrecio, historico);
      this.logger.debug(`HistoricoPrecio registrado para Producto ID ${entity.id} (${precioAnterior} -> ${precioNuevo})`);
    }
  }
}
