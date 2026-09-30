import { Test, TestingModule } from '@nestjs/testing';
import { RolService } from './rol.service';

describe('RolService', () => {
  let service: RolService;

  const mockRepository = {
    findAll: jest.fn(),
    findByDenominacion: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolService,
        { provide: 'IRolRepository', useValue: mockRepository },
      ],
    }).compile();

    service = module.get<RolService>(RolService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
