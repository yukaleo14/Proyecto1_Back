import { Test, TestingModule } from '@nestjs/testing';
import { RolController } from './rol.controller';
import { RolService } from '../services/rol.service';
import { AuthGuard } from '../../../auth/auth.guard';

describe('RolController', () => {
  let controller: RolController;

  const mockRolService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolController],
      providers: [
        {
          provide: RolService,
          useValue: mockRolService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<RolController>(RolController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
