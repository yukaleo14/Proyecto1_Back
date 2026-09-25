import { Test, TestingModule } from '@nestjs/testing';
import { ProvinciaController } from './provincia.controller';
import { ProvinciaService } from '../services/provincia.service';
import { AuthGuard } from 'src/modules/gestion-usuario/auth/auth.guard';

describe('ProvinciaController', () => {
  let controller: ProvinciaController;

  const mockProvinciaService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProvinciaController],
      providers: [
        {
          provide: ProvinciaService,
          useValue: mockProvinciaService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ProvinciaController>(ProvinciaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
