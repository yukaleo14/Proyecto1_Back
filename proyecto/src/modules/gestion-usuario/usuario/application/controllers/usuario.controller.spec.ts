import { Test, TestingModule } from '@nestjs/testing';
import { UsuarioService } from '../services/usuario.service';
import { UsuarioController } from './usuario.controller';
import { AuthGuard } from '../../../auth/auth.guard';

describe('UsuarioController', () => {
  let controller: UsuarioController;

  const mockUsuarioService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsuarioController],
      providers: [
        { provide: UsuarioService, useValue: mockUsuarioService },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UsuarioController>(UsuarioController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
