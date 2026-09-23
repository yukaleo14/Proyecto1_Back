import {
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ISuperLineaRepository } from '../../domain/interfaces/super-linea.repository.interface';
import { PoliticaEliminacionSuperLinea } from '../../domain/services/politica-eliminacion-super-linea.service';
import { CreateSuperLineaDto } from '../../dto/create-super-linea.dto';
import { UpdateSuperLineaDto } from '../../dto/update-super-linea.dto';
import { SuperLineaDto } from '../../dto/super-linea.dto';
import { SuperLineaMapper } from '../../mappers/super-linea.mapper';
import { MessageFrontUtils } from 'src/modules/common/utils/message/message-front.util';

@Injectable()
export class SuperLineaService {
  private readonly logger = new Logger(SuperLineaService.name);
  private readonly ENTITY_NAME = 'SuperLínea';

  constructor(
    @Inject('ISuperLineaRepository')
    private readonly repository: ISuperLineaRepository,
    private readonly politicaEliminacion: PoliticaEliminacionSuperLinea,
  ) {}

  async create(dto: CreateSuperLineaDto) {
    this.logger.log(`Creando una nueva ${this.ENTITY_NAME}: ${dto.nombre}`);
    const exists = await this.repository.findByNombre(dto.nombre);
    if (exists) {
      throw new ConflictException(`La SuperLínea con nombre "${dto.nombre}" ya existe.`);
    }

    const entity = await this.repository.create(dto);
    return MessageFrontUtils.createSimple(this.ENTITY_NAME, entity.nombre, 'creada');
  }

  async update(id: number, dto: UpdateSuperLineaDto) {
    this.logger.log(`Actualizando ${this.ENTITY_NAME} con ID: ${id}`);
    const entity = await this.repository.findOne(id);
    if (!entity) {
      throw new NotFoundException(`${this.ENTITY_NAME} con ID ${id} no encontrada.`);
    }

    if (dto.nombre && dto.nombre.toLowerCase() !== entity.nombre.toLowerCase()) {
      const exists = await this.repository.findByNombre(dto.nombre);
      if (exists && exists.id !== id) {
        throw new ConflictException(`La SuperLínea con nombre "${dto.nombre}" ya existe.`);
      }
    }

    const updated = await this.repository.update(id, dto);
    return MessageFrontUtils.createSimple(this.ENTITY_NAME, updated.nombre, 'editada');
  }

  async findDtoById(id: number): Promise<SuperLineaDto> {
    const entity = await this.repository.findOne(id);
    if (!entity) {
      throw new NotFoundException(`${this.ENTITY_NAME} con ID ${id} no encontrada.`);
    }
    return SuperLineaMapper.toDto(entity);
  }

  async findAll(): Promise<SuperLineaDto[]> {
    const list = await this.repository.findAll();
    return list.map((item) => SuperLineaMapper.toDto(item));
  }

  /**
   * Elimina una SuperLínea garantizando que no posea líneas vinculadas activas.
   *
   * @param id ID de la SuperLínea a eliminar.
   * @throws NotFoundException si la SuperLínea no existe.
   * @throws SuperLineaConLineasAsociadasException si posee líneas asociadas.
   */
  async remove(id: number) {
    this.logger.warn(`Intentando eliminar ${this.ENTITY_NAME} con ID: ${id}`);
    const entity = await this.repository.findOne(id);
    if (!entity) {
      throw new NotFoundException(`${this.ENTITY_NAME} con ID ${id} no encontrada.`);
    }

    // Regla de negocio: validar que no existan líneas vinculadas
    await this.politicaEliminacion.validarEliminacion(entity);

    await this.repository.remove(entity);
    return MessageFrontUtils.createSimple(this.ENTITY_NAME, entity.nombre, 'eliminada');
  }
}
