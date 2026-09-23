import { CreateSuperLineaDto } from '../../dto/create-super-linea.dto';
import { UpdateSuperLineaDto } from '../../dto/update-super-linea.dto';
import { SuperLinea } from '../entities/super-linea.entity';

export interface ISuperLineaRepository {
  create(data: CreateSuperLineaDto): Promise<SuperLinea>;
  update(id: number, data: UpdateSuperLineaDto): Promise<SuperLinea>;
  findOne(id: number): Promise<SuperLinea | null>;
  findByNombre(nombre: string): Promise<SuperLinea | null>;
  findAll(): Promise<SuperLinea[]>;
  remove(superLinea: SuperLinea): Promise<SuperLinea>;
}
