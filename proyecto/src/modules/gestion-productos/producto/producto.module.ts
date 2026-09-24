import { forwardRef, Module } from '@nestjs/common';
import { ProductoController } from './application/controllers/producto.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NormalizeDenominacionPipe } from 'src/modules/common/pipes/normalize-denominations.pipe';
import { Producto } from './domain/entities/producto.entity';
import { ProductoRepository } from './infraestructure/repositories/producto.repository';
import { LineaModule } from '../linea/linea.module';
import { MarcaModule } from '../marca/marca.module';
import { TypeOrmUnitOfWork } from 'src/modules/common/unit-of-work/type-orm-unit-of-works1';
import { DataSource } from 'typeorm';
import { IUnitOfWork } from 'src/modules/common/unit-of-work/iunit-of-work.';
import { ProveedorModule } from 'src/modules/organizacion/proveedor/proveedor.module';
import { UsuarioModule } from 'src/modules/gestion-usuario/usuario/usuario.module';
import { CommonModule } from 'src/modules/common/common.module';
import { ProductoService } from './application/services/producto.service';
import { ProductoPersistenceAdapter } from './infraestructure/repositories/producto.persistence-adapters';
import { ProductoUniquenessValidator } from './infraestructure/validators/producto-uniqueness.validator';
import { ProductoRelatedEntitiesValidator } from './infraestructure/validators/producto-related-entities.validator';
import { ProductoValidationService } from './domain/services/producto-validation.service';
import { ProductoIntrinsicValidationService } from './domain/services/producto-intrinsic-validation.service';
import { HistoricoPrecio } from './domain/entities/historico-precio.entity';
import { MovimientoStock } from './domain/entities/movimiento-stock.entity';
import { HistoricoPrecioEventHandler } from './application/handlers/historico-precio.handler';
import { StockEventsHandler } from './application/handlers/stock-events.handler';
import { ProductoDeletePolicy } from './application/policies/producto-delete.policy';
import { ActualizadorMasivoPreciosService } from './domain/services/actualizador-masivo-precios.service';
import { ActualizadorMasivoPreciosController } from './application/controllers/actualizador-masivo-precios.controller';


import { ProductoQueryController } from './application/controllers/producto-query.controller';
import { ProductoQueryService } from './application/services/producto-query.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Producto, HistoricoPrecio, MovimientoStock]),
    CommonModule,
    forwardRef(() => LineaModule),
    forwardRef(() => MarcaModule),
    ProveedorModule,
    UsuarioModule,
  ],

  controllers: [ProductoController, ProductoQueryController, ActualizadorMasivoPreciosController],
  
  providers: [
    ProductoService,
    ProductoQueryService,
    ProductoIntrinsicValidationService,
    ProductoValidationService,
    ProductoRelatedEntitiesValidator,
    ProductoUniquenessValidator,
    ProductoDeletePolicy,
    ActualizadorMasivoPreciosService,
    HistoricoPrecioEventHandler,
    StockEventsHandler,

    {
      provide: 'IProductoRepository',
      useClass: ProductoRepository,
    },
    {
      provide: 'UnitOfWork',
      useFactory: (dataSource: DataSource): IUnitOfWork => {
        return new TypeOrmUnitOfWork(dataSource);
      },
      inject: [DataSource],
    },
    NormalizeDenominacionPipe,
    ProductoPersistenceAdapter,
  ],
  
  exports: [
    TypeOrmModule,
    ProductoService,
    ProductoQueryService,
    ProductoPersistenceAdapter,
    'IProductoRepository',
  ],
})
export class ProductoModule {}