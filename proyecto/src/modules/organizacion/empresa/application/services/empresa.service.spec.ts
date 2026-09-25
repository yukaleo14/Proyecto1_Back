import { Test, TestingModule } from '@nestjs/testing';
import { EmpresaService } from './empresa.service';
import { CondicionIvaService } from 'src/modules/gutil/condicion-iva/application/services/condicion-iva.service';

describe('EmpresaService', () => {
  let service: EmpresaService;

  const mockEmpresaRepository = {
    findAll: jest.fn(),
    findByDenominacion: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockCondicionIvaRepository = {
    findAll: jest.fn(),
    findByDenominacion: jest.fn(),
    findByDenominacionFiltered: jest.fn(),
    findAllFor: jest.fn(),
    findAllListado: jest.fn(),
    findByIdConAuditoria: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmpresaService,
        { provide: 'IEmpresaRepository', useValue: mockEmpresaRepository },
        CondicionIvaService,
        { provide: 'ICondicionIvaRepository', useValue: mockCondicionIvaRepository },
      ],
    }).compile();

    service = module.get<EmpresaService>(EmpresaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
