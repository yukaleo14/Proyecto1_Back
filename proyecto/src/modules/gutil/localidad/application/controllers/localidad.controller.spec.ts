import { Test, TestingModule } from '@nestjs/testing';
import { LocalidadController } from './localidad.controller';
import { LocalidadService } from '../services/localidad.service';
import { AuthGuard } from 'src/modules/gestion-usuario/auth/auth.guard';

describe('LocalidadController', () => {
  let controller: LocalidadController;

  const mockLocalidadService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LocalidadController],
      providers: [
        {
          provide: LocalidadService,
          useValue: mockLocalidadService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<LocalidadController>(LocalidadController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
