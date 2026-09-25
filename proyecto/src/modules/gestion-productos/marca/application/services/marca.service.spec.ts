import { Test, TestingModule } from '@nestjs/testing';
import { MarcaService } from './marca.service';
import { UsuarioService } from 'src/modules/gestion-usuario/usuario/application/services/usuario.service';
import { RolService } from 'src/modules/gestion-usuario/rol/application/services/rol.service';
import { PoliticaEliminacionMarca } from '../../domain/services/politica-eliminacion-marca.service';

describe('MarcaService', () => {
  let service: MarcaService;

  const mockMarcaRepository = {
    findAll: jest.fn(),
    findByDenominacion: jest.fn(),
    findByDenominacionWith: jest.fn(),
    findAllFor: jest.fn(),
    findAllSinSistemaFor: jest.fn(),
    findAllSistemaFor: jest.fn(),
    findBy: jest.fn(),
    findByIdConAuditoria: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
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

  const mockPoliticaEliminacionMarca = {
    tieneProductosActivosParaMarca: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MarcaService,
        { provide: 'IMarcaRepository', useValue: mockMarcaRepository },
        UsuarioService,
        { provide: 'IUsuarioRepository', useValue: mockUsuarioRepository },
        RolService,
        { provide: 'IRolRepository', useValue: mockRolRepository },
        { provide: PoliticaEliminacionMarca, useValue: mockPoliticaEliminacionMarca },
      ],
    }).compile();

    service = module.get<MarcaService>(MarcaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
