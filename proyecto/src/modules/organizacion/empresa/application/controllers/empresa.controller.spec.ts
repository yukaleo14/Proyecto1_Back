import { Test, TestingModule } from '@nestjs/testing';
import { EmpresaController } from './empresa.controller';
import { EmpresaService } from '../services/empresa.service';
import { AuthGuard } from 'src/modules/gestion-usuario/auth/auth.guard';

describe('EmpresaController', () => {
  let controller: EmpresaController;

  const mockEmpresaService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmpresaController],
      providers: [
        {
          provide: EmpresaService,
          useValue: mockEmpresaService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<EmpresaController>(EmpresaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
