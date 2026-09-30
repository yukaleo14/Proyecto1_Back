import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ProductoService } from './producto.service';
import { LineaService } from 'src/modules/gestion-productos/linea/application/services/linea.service';
import { MarcaService } from 'src/modules/gestion-productos/marca/application/services/marca.service';
import { ProveedorService } from 'src/modules/organizacion/proveedor/application/services/proveedor.service';
import { UsuarioService } from 'src/modules/gestion-usuario/usuario/application/services/usuario.service';
import { ProductoIntrinsicValidationService } from '../../domain/services/producto-intrinsic-validation.service';
import { ProductoValidationService } from '../../domain/services/producto-validation.service';
import { ProductoRelatedEntitiesValidator } from '../../infraestructure/validators/producto-related-entities.validator';
import { ProductoUniquenessValidator } from '../../infraestructure/validators/producto-uniqueness.validator';
import { UsuarioValidator } from 'src/modules/common/utils/validation/usuario-validator';
import { ProductoDeletePolicy } from '../policies/producto-delete.policy';
import { Producto } from '../../domain/entities/producto.entity';
import { MovimientoStock } from '../../domain/entities/movimiento-stock.entity';

describe('ProductoService', () => {
  let service: ProductoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductoService,
        { provide: 'IProductoRepository', useValue: {} },
        { provide: LineaService, useValue: {} },
        { provide: MarcaService, useValue: {} },
        { provide: ProveedorService, useValue: {} },
        { provide: UsuarioService, useValue: {} },
        { provide: ProductoIntrinsicValidationService, useValue: {} },
        { provide: ProductoValidationService, useValue: {} },
        { provide: ProductoRelatedEntitiesValidator, useValue: {} },
        { provide: ProductoUniquenessValidator, useValue: {} },
        { provide: UsuarioValidator, useValue: {} },
        { provide: ProductoDeletePolicy, useValue: {} },
        { provide: getRepositoryToken(Producto), useValue: {} },
        { provide: getRepositoryToken(MovimientoStock), useValue: {} },
        { provide: DataSource, useValue: {} },
        { provide: EventEmitter2, useValue: { emit: jest.fn(), emitAsync: jest.fn() } },
      ],
    }).compile();

    service = module.get<ProductoService>(ProductoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
