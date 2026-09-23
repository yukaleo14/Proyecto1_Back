import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from '../../domain/entities/producto.entity';
import { BuscarProductosQueryDto } from '../../dto/buscar-productos-query.dto';
import {
  BuscarProductosResponseDto,
  ProductoReadModelDto,
} from '../../dto/producto-read-model.dto';

/**
 * Servicio de Lectura Optimizado (CQRS Read Model) para Productos.
 *
 * Desacoplado del agregado de escritura Producto: no valida invariantes ni hidrata
 * el Aggregate Root completo, sino que realiza proyecciones directas de lectura
 * optimizadas con filtros dinámicos combinados bajo lógica AND.
 */
@Injectable()
export class ProductoQueryService {
  private readonly logger = new Logger(ProductoQueryService.name);

  constructor(
    @InjectRepository(Producto)
    private readonly repository: Repository<Producto>,
  ) {}

  /**
   * Ejecuta búsqueda dinámica de productos combinando filtros con lógica AND
   * y búsqueda parcial insensible a mayúsculas/minúsculas (ILIKE / LOWER contains).
   *
   * Criterios de Aceptación:
   * 1. Búsqueda por denominación="coca" devuelve todas las coincidencias parciales sin importar mayúsculas.
   * 2. Filtro combinado denominación="cola" + superlinea="beb" devuelve solo los registros que cumplen ambas condiciones.
   *
   * @param query DTO con los filtros opcionales de búsqueda y paginación.
   */
  async buscar(query: BuscarProductosQueryDto): Promise<BuscarProductosResponseDto> {
    const {
      denominacion,
      lineaNombre,
      superLineaNombre,
      superlinea,
      skip = 0,
      take = 50,
    } = query;

    this.logger.log(
      `[CQRS Query] Buscando productos - filtros: ${JSON.stringify({
        denominacion,
        lineaNombre,
        superLineaNombre: superLineaNombre || superlinea,
      })}`,
    );

    const qb = this.repository
      .createQueryBuilder('producto')
      .leftJoinAndSelect('producto.linea', 'linea', 'linea.deletedAt IS NULL')
      .leftJoinAndSelect('linea.superLinea', 'superLinea', 'superLinea.deletedAt IS NULL')
      .leftJoinAndSelect('producto.marca', 'marca', 'marca.deletedAt IS NULL')
      .where('producto.deletedAt IS NULL');

    // Filtro 1: Denominación (insensible a mayúsculas/minúsculas)
    if (denominacion && denominacion.trim().length > 0) {
      qb.andWhere('LOWER(producto.denominacion) LIKE :denominacion', {
        denominacion: `%${denominacion.trim().toLowerCase()}%`,
      });
    }

    // Filtro 2: Línea (insensible a mayúsculas/minúsculas)
    if (lineaNombre && lineaNombre.trim().length > 0) {
      qb.andWhere('LOWER(linea.denominacion) LIKE :lineaNombre', {
        lineaNombre: `%${lineaNombre.trim().toLowerCase()}%`,
      });
    }

    // Filtro 3: SuperLínea (insensible a mayúsculas/minúsculas, soporta superLineaNombre y alias superlinea)
    const superLineaFiltro = superLineaNombre || superlinea;
    if (superLineaFiltro && superLineaFiltro.trim().length > 0) {
      qb.andWhere('LOWER(superLinea.nombre) LIKE :superLineaNombre', {
        superLineaNombre: `%${superLineaFiltro.trim().toLowerCase()}%`,
      });
    }

    qb.orderBy('producto.denominacion', 'ASC');
    qb.skip(skip).take(take);

    const [productos, total] = await qb.getManyAndCount();

    // Mapeo directo y plano al Read Model
    const data: ProductoReadModelDto[] = productos.map((p) => this.mapToReadModel(p));

    return {
      data,
      total,
    };
  }

  /**
   * Mapea la entidad proyectada a la estructura plana de lectura (Read Model).
   */
  private mapToReadModel(p: Producto): ProductoReadModelDto {
    return {
      id: p.id,
      denominacion: p.denominacion,
      codigoProveedor: p.codigoProveedor ?? null,
      codigoBarra: p.codigoBarra ?? null,
      costo: Number(p.costo ?? 0),
      precio: Number(p.precio ?? 0),
      stock: Number(p.stock ?? 0),
      stockMinimo: Number(p.stockMinimo ?? 0),
      lineaId: p.linea?.id ?? p.lineaId ?? 0,
      lineaNombre: p.linea?.denominacion ?? '',
      superLineaId: p.linea?.superLinea?.id ?? p.linea?.superLineaId ?? 0,
      superLineaNombre: p.linea?.superLinea?.nombre ?? '',
      marcaId: p.marca?.id ?? p.marcaId ?? null,
      marcaNombre: p.marca?.denominacion ?? null,
      presentacionValor: p.presentacionValor != null ? Number(p.presentacionValor) : null,
      presentacionUnidad: p.presentacionUnidad ?? null,
      presentacionDescripcion:
        p.presentacionValor != null && p.presentacionUnidad != null
          ? `${p.presentacionValor} ${p.presentacionUnidad}`
          : null,
    };
  }
}
