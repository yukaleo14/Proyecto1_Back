import { Test, TestingModule } from '@nestjs/testing';
import { CondicionIvaService } from './condicion-iva.service';

describe('CondicionIvaService', () => {
  let service: CondicionIvaService;

  const mockRepository = {
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
        CondicionIvaService,
        { provide: 'ICondicionIvaRepository', useValue: mockRepository },
      ],
    }).compile();

    service = module.get<CondicionIvaService>(CondicionIvaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
