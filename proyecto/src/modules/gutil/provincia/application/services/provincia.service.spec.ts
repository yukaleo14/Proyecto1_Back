import { Test, TestingModule } from '@nestjs/testing';
import { ProvinciaService } from './provincia.service';

describe('ProvinciaService', () => {
  let service: ProvinciaService;

  const mockRepository = {
    findAll: jest.fn(),
    findByDenominacion: jest.fn(),
    findByDenominacionFiltered: jest.fn(),
    findAllFor: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProvinciaService,
        { provide: 'IProvinciaRepository', useValue: mockRepository },
      ],
    }).compile();

    service = module.get<ProvinciaService>(ProvinciaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
