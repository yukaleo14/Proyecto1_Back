import { Test, TestingModule } from '@nestjs/testing';
import { LocalidadService } from './localidad.service';
import { ProvinciaService } from 'src/modules/gutil/provincia/application/services/provincia.service';

describe('LocalidadService', () => {
  let service: LocalidadService;

  const mockRepository = {
    findAll: jest.fn(),
    findByDenominacion: jest.fn(),
    findByDenominacionFiltered: jest.fn(),
    findAllFor: jest.fn(),
    findAllForProvincia: jest.fn(),
    findAllListado: jest.fn(),
    findByIdConAuditoria: jest.fn(),
    findBy: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockProvinciaService = {
    findOne: jest.fn(),
    findAllFor: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalidadService,
        { provide: 'ILocalidadRepository', useValue: mockRepository },
        { provide: ProvinciaService, useValue: mockProvinciaService },
      ],
    }).compile();

    service = module.get<LocalidadService>(LocalidadService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
