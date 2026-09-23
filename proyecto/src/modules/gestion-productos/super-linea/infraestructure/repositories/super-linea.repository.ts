import { Injectable } from '@nestjs/common';
import { ISuperLineaRepository } from '../../domain/interfaces/super-linea.repository.interface';
import { CreateSuperLineaDto } from '../../dto/create-super-linea.dto';
import { UpdateSuperLineaDto } from '../../dto/update-super-linea.dto';
import { SuperLinea } from '../../domain/entities/super-linea.entity';
import { SuperLineaPersistenceAdapter } from './super-linea.persistence-adapter';

@Injectable()
export class SuperLineaRepository implements ISuperLineaRepository {
  constructor(private readonly persistenceAdapter: SuperLineaPersistenceAdapter) {}

  async create(data: CreateSuperLineaDto): Promise<SuperLinea> {
    return this.persistenceAdapter.create(data);
  }

  async update(id: number, data: UpdateSuperLineaDto): Promise<SuperLinea> {
    return this.persistenceAdapter.update(id, data);
  }

  async findOne(id: number): Promise<SuperLinea | null> {
    return this.persistenceAdapter.findOne(id);
  }

  async findByNombre(nombre: string): Promise<SuperLinea | null> {
    return this.persistenceAdapter.findByNombre(nombre);
  }

  async findAll(): Promise<SuperLinea[]> {
    return this.persistenceAdapter.findAll();
  }

  async remove(superLinea: SuperLinea): Promise<SuperLinea> {
    return this.persistenceAdapter.remove(superLinea);
  }
}
