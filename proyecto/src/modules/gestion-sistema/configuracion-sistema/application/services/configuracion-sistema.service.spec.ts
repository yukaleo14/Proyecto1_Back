import { Test, TestingModule } from '@nestjs/testing';
import { ConfiguracionSistemaService } from './configuracion-sistema.service';

describe('ConfiguracionSistemaService', () => {
  let service: ConfiguracionSistemaService;

  const mockRepository = {
    findOne: jest.fn(),
    findByEmpresaId: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfiguracionSistemaService,
        { provide: 'IConfiguracionSistemaRepository', useValue: mockRepository },
      ],
    }).compile();

    service = module.get<ConfiguracionSistemaService>(ConfiguracionSistemaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
