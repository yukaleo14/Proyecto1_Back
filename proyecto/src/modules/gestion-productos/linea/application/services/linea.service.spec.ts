import { Test, TestingModule } from '@nestjs/testing';
import { LineaService } from './linea.service';
import { PoliticaEliminacionLinea } from '../../domain/services/politica-eliminacion-linea.service';
import { UsuarioService } from 'src/modules/gestion-usuario/usuario/application/services/usuario.service';
import { RolService } from 'src/modules/gestion-usuario/rol/application/services/rol.service';

describe('LineaService', () => {
  let service: LineaService;

  const mockLineaRepository = {
    findAll: jest.fn(),
    findByDenominacion: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockProductoRepository = {
    existsProductosActivosByLinea: jest.fn(),
  };

  const mockUsuarioRepository = {
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockRolRepository = {
    findOne: jest.fn(),
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LineaService,
        { provide: 'ILineaRepository', useValue: mockLineaRepository },
        PoliticaEliminacionLinea,
        { provide: 'IProductoRepository', useValue: mockProductoRepository },
        UsuarioService,
        { provide: 'IUsuarioRepository', useValue: mockUsuarioRepository },
        RolService,
        { provide: 'IRolRepository', useValue: mockRolRepository },
      ],
    }).compile();

    service = module.get<LineaService>(LineaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
