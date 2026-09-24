import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { Producto } from '../../domain/entities/producto.entity';
import { HistoricoPrecio } from '../../domain/entities/historico-precio.entity';
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
 * optimizadas con filtros dinámicos combinados bajo lógica AND y búsqueda global OR.
 *
 * Capacidades de Grilla:
 *  - Búsqueda global por término (OR entre denominación, línea y superlínea)
 *  - Filtros por denominación, línea, superlínea (texto parcial, insensible a mayúsculas)
 *  - Filtros por ID exacto de marca, línea, superLínea
 *  - Filtro de alerta de stock bajo
 *  - Ordenamiento configurable por campo y dirección
 *  - Enriquecimiento con datos del historial de precios (precio anterior y fecha último cambio)
 *  - Margen calculado en el read model
 */
@Injectable()
export class ProductoQueryService {
  private readonly logger = new Logger(ProductoQueryService.name);

  constructor(
    @InjectRepository(Producto)
    private readonly repository: Repository<Producto>,
    @InjectRepository(HistoricoPrecio)
    private readonly historicoRepository: Repository<HistoricoPrecio>,
  ) {}

  /**
   * Ejecuta búsqueda dinámica de productos combinando filtros con lógica AND
   * y búsqueda parcial insensible a mayúsculas/minúsculas (LOWER contains).
   * Si se especifica 'termino', busca con OR entre producto, línea y superlínea.
   *
   * @param query DTO con los filtros opcionales de búsqueda, ordenamiento y paginación.
   */
  async buscar(query: BuscarProductosQueryDto): Promise<BuscarProductosResponseDto> {
    const {
      termino,
      denominacion,
      lineaNombre,
      superLineaNombre,
      superlinea,
      marcaId,
      lineaId,
      superLineaId,
      conAlertaStock,
      orderBy = 'denominacion',
      order = 'ASC',
      skip = 0,
      take = 50,
    } = query;

    this.logger.log(
      `[CQRS Query] Buscando productos - filtros: ${JSON.stringify({
        termino, denominacion, lineaNombre, superLineaNombre: superLineaNombre || superlinea,
        marcaId, lineaId, superLineaId, conAlertaStock, orderBy, order,
      })}`,
    );

    const qb = this.repository
      .createQueryBuilder('producto')
      .leftJoinAndSelect('producto.linea', 'linea', 'linea.deletedAt IS NULL')
      .leftJoinAndSelect('linea.superLinea', 'superLinea', 'superLinea.deletedAt IS NULL')
      .leftJoinAndSelect('producto.marca', 'marca', 'marca.deletedAt IS NULL')
      .where('producto.deletedAt IS NULL');

    // Filtro Global Único (para barra de búsqueda única): OR entre producto, línea y superlínea
    if (termino && termino.trim().length > 0) {
      const terminoVal = `%${termino.trim().toLowerCase()}%`;
      qb.andWhere(
        new Brackets((subQb) => {
          subQb
            .where('LOWER(producto.denominacion) LIKE :termino', { termino: terminoVal })
            .orWhere('LOWER(linea.denominacion) LIKE :termino', { termino: terminoVal })
            .orWhere('LOWER(superLinea.nombre) LIKE :termino', { termino: terminoVal });
        }),
      );
    }

    // Filtro 1: Denominación (insensible a mayúsculas/minúsculas)
    if (denominacion && denominacion.trim().length > 0) {
      qb.andWhere('LOWER(producto.denominacion) LIKE :denominacion', {
        denominacion: `%${denominacion.trim().toLowerCase()}%`,
      });
    }

    // Filtro 2: Línea por nombre (insensible a mayúsculas/minúsculas)
    if (lineaNombre && lineaNombre.trim().length > 0) {
      qb.andWhere('LOWER(linea.denominacion) LIKE :lineaNombre', {
        lineaNombre: `%${lineaNombre.trim().toLowerCase()}%`,
      });
    }

    // Filtro 3: SuperLínea por nombre (soporta superLineaNombre y alias superlinea)
    const superLineaFiltro = superLineaNombre || superlinea;
    if (superLineaFiltro && superLineaFiltro.trim().length > 0) {
      qb.andWhere('LOWER(superLinea.nombre) LIKE :superLineaNombre', {
        superLineaNombre: `%${superLineaFiltro.trim().toLowerCase()}%`,
      });
    }

    // Filtro 4: Marca por ID exacto
    if (marcaId) {
      qb.andWhere('marca.id = :marcaId', { marcaId });
    }

    // Filtro 5: Línea por ID exacto
    if (lineaId) {
      qb.andWhere('linea.id = :lineaId', { lineaId });
    }

    // Filtro 6: SuperLínea por ID exacto
    if (superLineaId) {
      qb.andWhere('superLinea.id = :superLineaId', { superLineaId });
    }

    // Filtro 7: Alerta de stock bajo (stock <= stockMinimo)
    if (conAlertaStock === true) {
      qb.andWhere('producto.stock <= producto.stockMinimo');
    }

    // Ordenamiento configurable
    const camposOrdenables: Record<string, string> = {
      denominacion: 'producto.denominacion',
      precio: 'producto.precio',
      stock: 'producto.stock',
      costo: 'producto.costo',
    };
    const campoOrden = camposOrdenables[orderBy] ?? 'producto.denominacion';
    qb.orderBy(campoOrden, order as 'ASC' | 'DESC');

    qb.skip(skip).take(take);

    const [productos, total] = await qb.getManyAndCount();

    // Obtener historial de último precio para todos los productos retornados
    const productosIds = productos.map((p) => p.id);
    const ultimosPreciosMap = await this.obtenerUltimosPrecios(productosIds);

    // Mapeo al Read Model
    const data: ProductoReadModelDto[] = productos.map((p) =>
      this.mapToReadModel(p, ultimosPreciosMap.get(p.id)),
    );

    return { data, total };
  }

  /**
   * Retorna el historial completo de precios de un producto ordenado por fecha descendente.
   */
  async obtenerHistorialPrecios(productoId: number): Promise<HistoricoPrecio[]> {
    return this.historicoRepository.find({
      where: { productoId },
      order: { fechaHora: 'DESC' },
      relations: ['usuario'],
    });
  }

  // ─── PRIVADOS ───────────────────────────────────────────────────────────────

  /**
   * Consulta el último registro de historico_precios para cada producto en el listado.
   * Retorna un Map de productoId → HistoricoPrecio.
   */
  private async obtenerUltimosPrecios(productoIds: number[]): Promise<Map<number, HistoricoPrecio>> {
    if (productoIds.length === 0) return new Map();

    // Subconsulta: para cada producto, obtenemos el registro con la fecha más reciente
    const ultimosHistoricos = await this.historicoRepository
      .createQueryBuilder('hp')
      .where('hp.producto_id IN (:...ids)', { ids: productoIds })
      .andWhere(
        'hp.fecha_hora = (SELECT MAX(hp2.fecha_hora) FROM historico_precios hp2 WHERE hp2.producto_id = hp.producto_id)',
      )
      .getMany();

    const map = new Map<number, HistoricoPrecio>();
    ultimosHistoricos.forEach((h) => map.set(h.productoId, h));
    return map;
  }

  /**
   * Mapea la entidad proyectada + historial al Read Model plano enriquecido.
   */
  private mapToReadModel(p: Producto, ultimoHistorico?: HistoricoPrecio): ProductoReadModelDto {
    const costo = Number(p.costo ?? 0);
    const precio = Number(p.precio ?? 0);
    const margenCalculado = costo > 0 ? +((precio / costo - 1) * 100).toFixed(2) : null;
    const stock = Number(p.stock ?? 0);
    const stockMinimo = Number(p.stockMinimo ?? 0);

    return {
      id: p.id,
      denominacion: p.denominacion,
      codigoProveedor: p.codigoProveedor ?? null,
      codigoBarra: p.codigoBarra ?? null,
      costo,
      precio,
      stock,
      stockMinimo,
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
      // Campos enriquecidos
      margenCalculado,
      alertaStockBajo: stock <= stockMinimo,
      precioAnterior: ultimoHistorico?.precioAnterior ?? null,
      fechaUltimoCambioPrecio: ultimoHistorico?.fechaHora ?? null,
    };
  }
}
