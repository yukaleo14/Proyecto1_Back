import { Test, TestingModule } from '@nestjs/testing';
import { UsuarioService } from './usuario.service';
import { RolService } from '../../../rol/application/services/rol.service';

describe('UsuarioService', () => {
  let service: UsuarioService;

  const mockUsuarioRepository = {
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findByMail: jest.fn(),
    updateContrasena: jest.fn(),
  };

  const mockRolRepository = {
    findOne: jest.fn(),
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuarioService,
        { provide: 'IUsuarioRepository', useValue: mockUsuarioRepository },
        RolService,
        { provide: 'IRolRepository', useValue: mockRolRepository },
      ],
    }).compile();

    service = module.get<UsuarioService>(UsuarioService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
