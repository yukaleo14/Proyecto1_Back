import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SuperLinea } from '../../domain/entities/super-linea.entity';
import { CreateSuperLineaDto } from '../../dto/create-super-linea.dto';
import { UpdateSuperLineaDto } from '../../dto/update-super-linea.dto';
import { ISuperLineaRepository } from '../../domain/interfaces/super-linea.repository.interface';
import { DatabaseConnectionException } from 'src/modules/common/exceptions/database-connection.exception';

@Injectable()
export class SuperLineaPersistenceAdapter implements ISuperLineaRepository {
  private readonly logger = new Logger(SuperLineaPersistenceAdapter.name);

  constructor(
    @InjectRepository(SuperLinea)
    private readonly repository: Repository<SuperLinea>,
  ) {}

  async create(data: CreateSuperLineaDto): Promise<SuperLinea> {
    try {
      const entity = new SuperLinea(data.nombre, data.descripcion);
      return await this.repository.save(entity);
    } catch (error) {
      this.logger.error(`Error al crear SuperLinea: ${error}`);
      throw new DatabaseConnectionException('Error al guardar SuperLinea en la base de datos.');
    }
  }

  async update(id: number, data: UpdateSuperLineaDto): Promise<SuperLinea> {
    const entity = await this.findOne(id);
    if (!entity) {
      throw new NotFoundException(`SuperLínea con ID ${id} no encontrada.`);
    }

    if (data.nombre) {
      entity.actualizarNombre(data.nombre);
    }
    if (data.descripcion !== undefined) {
      entity.actualizarDescripcion(data.descripcion);
    }

    return await this.repository.save(entity);
  }

  async findOne(id: number): Promise<SuperLinea | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['lineas'],
    });
  }

  async findByNombre(nombre: string): Promise<SuperLinea | null> {
    return await this.repository
      .createQueryBuilder('superLinea')
      .where('LOWER(superLinea.nombre) = LOWER(:nombre)', { nombre: nombre.trim() })
      .andWhere('superLinea.deletedAt IS NULL')
      .getOne();
  }

  async findAll(): Promise<SuperLinea[]> {
    return await this.repository.find({
      order: { nombre: 'ASC' },
    });
  }

  async remove(superLinea: SuperLinea): Promise<SuperLinea> {
    return await this.repository.softRemove(superLinea);
  }
}
