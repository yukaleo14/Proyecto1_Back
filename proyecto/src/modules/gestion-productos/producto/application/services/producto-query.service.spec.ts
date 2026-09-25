import { Repository, SelectQueryBuilder } from 'typeorm';
import { ProductoQueryService } from './producto-query.service';
import { Producto } from '../../domain/entities/producto.entity';
import { Linea } from '../../../linea/domain/entities/linea.entity';
import { SuperLinea } from '../../../super-linea/domain/entities/super-linea.entity';
import { Marca } from '../../../marca/domain/entities/marca.entity';

describe('ProductoQueryService: CQRS Read Model & Consultas Dinámicas Combinadas', () => {
  let service: ProductoQueryService;
  let mockRepository: jest.Mocked<Repository<Producto>>;
  let mockQueryBuilder: any;

  // Dataset simulado para pruebas de comportamiento
  const mockDataset: Partial<Producto>[] = [
    {
      id: 1,
      denominacion: 'Coca-Cola 2L',
      costo: 1000,
      precio: 1500,
      stock: 50,
      stockMinimo: 10,
      linea: { id: 1, denominacion: 'Gaseosas', superLinea: { id: 1, nombre: 'Bebidas' } as SuperLinea } as Linea,
      marca: { id: 1, denominacion: 'The Coca-Cola Company' } as Marca,
      presentacionValor: 2,
      presentacionUnidad: 'L',
    },
    {
      id: 2,
      denominacion: 'COCA-COLA ZERO 500ml',
      costo: 600,
      precio: 900,
      stock: 30,
      stockMinimo: 5,
      linea: { id: 1, denominacion: 'Gaseosas', superLinea: { id: 1, nombre: 'Bebidas' } as SuperLinea } as Linea,
      marca: { id: 1, denominacion: 'The Coca-Cola Company' } as Marca,
      presentacionValor: 500,
      presentacionUnidad: 'ml',
    },
    {
      id: 3,
      denominacion: 'Pepsi Cola 1.5L',
      costo: 800,
      precio: 1200,
      stock: 40,
      stockMinimo: 10,
      linea: { id: 1, denominacion: 'Gaseosas', superLinea: { id: 1, nombre: 'Bebidas' } as SuperLinea } as Linea,
      marca: { id: 2, denominacion: 'PepsiCo' } as Marca,
      presentacionValor: 1.5,
      presentacionUnidad: 'L',
    },
    {
      id: 4,
      denominacion: 'Cola de Carpintero (Pegamento)',
      costo: 300,
      precio: 500,
      stock: 15,
      stockMinimo: 2,
      linea: { id: 2, denominacion: 'Adhesivos', superLinea: { id: 2, nombre: 'Ferretería y Librería' } as SuperLinea } as Linea,
      marca: { id: 3, denominacion: 'Fortex' } as Marca,
      presentacionValor: 250,
      presentacionUnidad: 'g',
    },
    {
      id: 5,
      denominacion: 'Cerveza Quilmes Cristal 1L',
      costo: 1100,
      precio: 1600,
      stock: 60,
      stockMinimo: 12,
      linea: { id: 3, denominacion: 'Cervezas', superLinea: { id: 1, nombre: 'Bebidas' } as SuperLinea } as Linea,
      marca: { id: 4, denominacion: 'Quilmes' } as Marca,
      presentacionValor: 1,
      presentacionUnidad: 'L',
    },
  ];

  beforeEach(() => {
    const whereConditions: { sql: string; params: any }[] = [];

    mockQueryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockImplementation((sql, params) => {
        whereConditions.push({ sql, params });
        return mockQueryBuilder;
      }),
      andWhere: jest.fn().mockImplementation((sql, params) => {
        whereConditions.push({ sql, params });
        return mockQueryBuilder;
      }),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
      getManyAndCount: jest.fn().mockImplementation(async () => {
        // Filtrado real en memoria simulando SQL
        let filtered = [...mockDataset];

        for (const condition of whereConditions) {
          if (condition.sql.includes('producto.denominacion')) {
            const rawParam = condition.params.denominacion.replace(/%/g, '').toLowerCase();
            filtered = filtered.filter((p) =>
              p.denominacion?.toLowerCase().includes(rawParam),
            );
          }
          if (condition.sql.includes('linea.denominacion')) {
            const rawParam = condition.params.lineaNombre.replace(/%/g, '').toLowerCase();
            filtered = filtered.filter((p) =>
              p.linea?.denominacion?.toLowerCase().includes(rawParam),
            );
          }
          if (condition.sql.includes('superLinea.nombre')) {
            const rawParam = condition.params.superLineaNombre.replace(/%/g, '').toLowerCase();
            filtered = filtered.filter((p) =>
              p.linea?.superLinea?.nombre?.toLowerCase().includes(rawParam),
            );
          }
        }

        return [filtered, filtered.length];
      }),
    };

    mockRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    } as unknown as jest.Mocked<Repository<Producto>>;

    const mockHistoricoRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    } as unknown as jest.Mocked<Repository<any>>;

    service = new ProductoQueryService(mockRepository, mockHistoricoRepository);
  });

  describe('Criterio de Aceptación 1: Búsqueda insensible a mayúsculas/minúsculas', () => {
    it('búsqueda por denominación="coca" devuelve todas las coincidencias parciales sin importar mayúsculas', async () => {
      const result = await service.buscar({ denominacion: 'coca' });

      // Verificación en QueryBuilder
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'LOWER(producto.denominacion) LIKE :denominacion',
        { denominacion: '%coca%' },
      );

      // Verificación de resultados simulados (encuentra 'Coca-Cola 2L' y 'COCA-COLA ZERO 500ml')
      expect(result.total).toBe(2);
      expect(result.data.length).toBe(2);
      expect(result.data.map((d) => d.id)).toEqual([1, 2]);
      expect(result.data[0].denominacion).toBe('Coca-Cola 2L');
      expect(result.data[1].denominacion).toBe('COCA-COLA ZERO 500ml');
    });

    it('búsqueda por denominación="COCA" devuelve los mismos resultados (insensibilidad a mayúsculas)', async () => {
      const result = await service.buscar({ denominacion: 'COCA' });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'LOWER(producto.denominacion) LIKE :denominacion',
        { denominacion: '%coca%' },
      );
      expect(result.total).toBe(2);
      expect(result.data.map((d) => d.id)).toEqual([1, 2]);
    });
  });

  describe('Criterio de Aceptación 2: Filtro combinado AND (denominación + superlínea)', () => {
    it('filtro combinado denominación="cola" + superlinea="beb" devuelve solo los registros que cumplen ambas condiciones', async () => {
      const result = await service.buscar({
        denominacion: 'cola',
        superlinea: 'beb',
      });

      // Debe haber aplicado ambos andWhere
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'LOWER(producto.denominacion) LIKE :denominacion',
        { denominacion: '%cola%' },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'LOWER(superLinea.nombre) LIKE :superLineaNombre',
        { superLineaNombre: '%beb%' },
      );

      // 'Cola de Carpintero' tiene 'cola' en denominación pero superlínea 'Ferretería y Librería',
      // por lo que DEBE SER EXCLUIDO bajo lógica AND.
      // Coincidencias válidas: 'Coca-Cola 2L', 'COCA-COLA ZERO 500ml', 'Pepsi Cola 1.5L'.
      expect(result.total).toBe(3);
      expect(result.data.map((d) => d.id)).toEqual([1, 2, 3]);
      expect(result.data.every((p) => p.superLineaNombre === 'Bebidas')).toBe(true);
      expect(result.data.some((p) => p.denominacion.includes('Carpintero'))).toBe(false);
    });

    it('soporta superLineaNombre como parámetro equivalente a superlinea', async () => {
      const result = await service.buscar({
        denominacion: 'cola',
        superLineaNombre: 'beb',
      });

      expect(result.total).toBe(3);
      expect(result.data.map((d) => d.id)).toEqual([1, 2, 3]);
    });

    it('si ninguna superlínea coincide con el término, el resultado es vacío aunque la denominación coincida', async () => {
      const result = await service.buscar({
        denominacion: 'cola',
        superlinea: 'textil',
      });

      expect(result.total).toBe(0);
      expect(result.data).toHaveLength(0);
    });
  });

  describe('Filtros combinados con Línea', () => {
    it('filtro por lineaNombre="gaseosas" filtra correctamente', async () => {
      const result = await service.buscar({ lineaNombre: 'gaseosas' });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'LOWER(linea.denominacion) LIKE :lineaNombre',
        { lineaNombre: '%gaseosas%' },
      );
      expect(result.total).toBe(3);
      expect(result.data.map((d) => d.id)).toEqual([1, 2, 3]);
    });

    it('combinación AND de denominacion + lineaNombre + superLineaNombre', async () => {
      const result = await service.buscar({
        denominacion: 'quilmes',
        lineaNombre: 'cervezas',
        superlinea: 'bebidas',
      });

      expect(result.total).toBe(1);
      expect(result.data[0].id).toBe(5);
      expect(result.data[0].denominacion).toBe('Cerveza Quilmes Cristal 1L');
    });
  });

  describe('Estructura del Read Model DTO', () => {
    it('debe proyectar correctamente campos de presentación y relaciones planas', async () => {
      const result = await service.buscar({ denominacion: 'coca-cola 2l' });

      expect(result.total).toBe(1);
      const dto = result.data[0];
      expect(dto.id).toBe(1);
      expect(dto.denominacion).toBe('Coca-Cola 2L');
      expect(dto.lineaId).toBe(1);
      expect(dto.lineaNombre).toBe('Gaseosas');
      expect(dto.superLineaId).toBe(1);
      expect(dto.superLineaNombre).toBe('Bebidas');
      expect(dto.marcaNombre).toBe('The Coca-Cola Company');
      expect(dto.presentacionValor).toBe(2);
      expect(dto.presentacionUnidad).toBe('L');
      expect(dto.presentacionDescripcion).toBe('2 L');
    });
  });
});
