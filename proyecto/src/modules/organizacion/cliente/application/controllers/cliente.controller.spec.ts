import { Test, TestingModule } from '@nestjs/testing';
import { ClienteController } from './cliente.controller';
import { ClienteService } from '../services/cliente.service';
import { AuthGuard } from 'src/modules/gestion-usuario/auth/auth.guard';

describe('ClienteController', () => {
  let controller: ClienteController;

  const mockClienteService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findBy: jest.fn(),
    findDtoById: jest.fn(),
    findByIdConAuditoria: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClienteController],
      providers: [
        { provide: ClienteService, useValue: mockClienteService },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ClienteController>(ClienteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
