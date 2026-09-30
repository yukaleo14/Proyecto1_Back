import { Test, TestingModule } from '@nestjs/testing';
import { AlicuotaIvaService } from './alicuota-iva.service';
import { UsuarioService } from 'src/modules/gestion-usuario/usuario/application/services/usuario.service';

describe('AlicuotaIvaService', () => {
  let service: AlicuotaIvaService;

  const mockRepository = {
    findAll: jest.fn(),
    findByDenominacionWith: jest.fn(),
    findByDenominacion: jest.fn(),
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

  const mockUsuarioService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlicuotaIvaService,
        { provide: 'IAlicuotaIvaRepository', useValue: mockRepository },
        { provide: UsuarioService, useValue: mockUsuarioService },
      ],
    }).compile();

    service = module.get<AlicuotaIvaService>(AlicuotaIvaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
