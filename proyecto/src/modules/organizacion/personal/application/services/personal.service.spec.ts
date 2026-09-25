import { Test, TestingModule } from '@nestjs/testing';
import { PersonalService } from './personal.service';
import { UsuarioService } from 'src/modules/gestion-usuario/usuario/application/services/usuario.service';
import { RolService } from 'src/modules/gestion-usuario/rol/application/services/rol.service';

describe('PersonalService', () => {
  let service: PersonalService;

  const mockPersonalRepository = {
    findAll: jest.fn(),
    findByDenominacion: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockUsuarioRepository = {
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockRolRepository = {
    findOne: jest.fn(),
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PersonalService,
        { provide: 'IPersonalRepository', useValue: mockPersonalRepository },
        UsuarioService,
        { provide: 'IUsuarioRepository', useValue: mockUsuarioRepository },
        RolService,
        { provide: 'IRolRepository', useValue: mockRolRepository },
      ],
    }).compile();

    service = module.get<PersonalService>(PersonalService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
