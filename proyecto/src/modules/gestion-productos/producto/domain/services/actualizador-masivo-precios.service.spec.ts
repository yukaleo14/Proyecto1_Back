import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { ActualizadorMasivoPreciosService } from './actualizador-masivo-precios.service';
import { IProductoRepository } from '../interfaces/producto.repository-interface';
import { OperacionInvalidaException } from '../exceptions/operacion-invalida.exception';
import { Producto } from '../entities/producto.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Crea un Producto mínimo con solo los campos necesarios para la prueba. */
function makeProducto(overrides: Partial<Producto> = {}): Producto {
  const p = new Producto();
  p.id = overrides.id ?? 1;
  p.denominacion = overrides.denominacion ?? 'Producto de prueba';
  p.precio = overrides.precio ?? 100;
  p.lineaId = overrides.lineaId ?? 1;
  return p;
}

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockRepository: Partial<IProductoRepository> = {
  findTodosActivos: jest.fn(),
  findActivosByLineaId: jest.fn(),
  findActivosBySuperLineaId: jest.fn(),
  actualizarPrecioMasivo: jest.fn(),
};

const mockDataSource = {
  transaction: jest.fn().mockImplementation(async (cb: (manager: any) => Promise<void>) => {
    await cb({} as any);
  }),
} as unknown as DataSource;

// ── Suite ─────────────────────────────────────────────────────────────────────

describe('ActualizadorMasivoPreciosService', () => {
  let service: ActualizadorMasivoPreciosService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActualizadorMasivoPreciosService,
        { provide: 'IProductoRepository', useValue: mockRepository },
        { provide: DataSource, useValue: mockDataSource },
        { provide: EventEmitter2, useValue: { emit: jest.fn(), emitAsync: jest.fn() } },
      ],
    }).compile();

    service = module.get<ActualizadorMasivoPreciosService>(ActualizadorMasivoPreciosService);
  });

  // ──────────────────────────────────────────────────────────────────────────
  // PREVIEW — sin persistencia
  // ──────────────────────────────────────────────────────────────────────────

  describe('simularAjustePorcentajeGlobal', () => {
    it('calcula correctamente el precio proyectado con +10%', async () => {
      const productos = [makeProducto({ id: 1, precio: 100 })];
      (mockRepository.findTodosActivos as jest.Mock).mockResolvedValue(productos);

      const resultado = await service.simularAjustePorcentajeGlobal(10);

      expect(resultado).toHaveLength(1);
      expect(resultado[0].precioActual).toBe(100);
      expect(resultado[0].precioProyectado).toBe(110); // 100 * 1.10
    });

    it('calcula correctamente el precio proyectado con -5%', async () => {
      const productos = [makeProducto({ id: 1, precio: 200 })];
      (mockRepository.findTodosActivos as jest.Mock).mockResolvedValue(productos);

      const resultado = await service.simularAjustePorcentajeGlobal(-5);

      expect(resultado[0].precioProyectado).toBe(190); // 200 * 0.95
    });

    it('no llama a actualizarPrecioMasivo (no persiste)', async () => {
      (mockRepository.findTodosActivos as jest.Mock).mockResolvedValue([makeProducto()]);

      await service.simularAjustePorcentajeGlobal(10);

      expect(mockRepository.actualizarPrecioMasivo).not.toHaveBeenCalled();
    });
  });

  describe('simularAjusteMontoFijoPorLinea', () => {
    it('suma el monto fijo correctamente', async () => {
      const productos = [makeProducto({ precio: 500, lineaId: 3 })];
      (mockRepository.findActivosByLineaId as jest.Mock).mockResolvedValue(productos);

      const resultado = await service.simularAjusteMontoFijoPorLinea(3, 100);

      expect(resultado[0].precioProyectado).toBe(600);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // EJECUCIÓN — Criterio de Aceptación: ajuste del 10% global
  // ──────────────────────────────────────────────────────────────────────────

  describe('ejecutarAjustePorcentajeGlobal', () => {
    it('CRITERIO: ajuste del 10% modifica correctamente todos los productos', async () => {
      const productos = [
        makeProducto({ id: 1, precio: 100 }),
        makeProducto({ id: 2, precio: 200 }),
        makeProducto({ id: 3, precio: 50 }),
      ];
      (mockRepository.findTodosActivos as jest.Mock).mockResolvedValue(productos);

      const resultado = await service.ejecutarAjustePorcentajeGlobal(10, 1);

      expect(resultado).toHaveLength(3);
      expect(resultado[0].precioProyectado).toBe(110);  // 100 * 1.10
      expect(resultado[1].precioProyectado).toBe(220);  // 200 * 1.10
      expect(resultado[2].precioProyectado).toBe(55);   // 50 * 1.10
      expect(mockRepository.actualizarPrecioMasivo).toHaveBeenCalledTimes(1);
    });

    it('llama a actualizarPrecioMasivo con los precios proyectados', async () => {
      const productos = [makeProducto({ id: 1, precio: 100 })];
      (mockRepository.findTodosActivos as jest.Mock).mockResolvedValue(productos);

      await service.ejecutarAjustePorcentajeGlobal(10, 1);

      expect(mockRepository.actualizarPrecioMasivo).toHaveBeenCalledWith(
        [expect.objectContaining({ id: 1, precio: 110 })],
        expect.anything(),
      );
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // INVARIANTE: precio resultante ≤ 0 → OperacionInvalidaException
  // ──────────────────────────────────────────────────────────────────────────

  describe('validación de invariante', () => {
    it('CRITERIO: lanza OperacionInvalidaException si un producto resultaría con precio $0', async () => {
      const productos = [
        makeProducto({ id: 1, precio: 100 }),
        makeProducto({ id: 2, denominacion: 'Producto barato', precio: 50 }),
      ];
      (mockRepository.findTodosActivos as jest.Mock).mockResolvedValue(productos);

      // Un descuento del 200% llevaría el precio a negativo
      await expect(service.ejecutarAjustePorcentajeGlobal(-200, 1)).rejects.toThrow(
        OperacionInvalidaException,
      );
    });

    it('NO persiste nada si la invariante falla', async () => {
      const productos = [makeProducto({ id: 1, precio: 10 })];
      (mockRepository.findTodosActivos as jest.Mock).mockResolvedValue(productos);

      try {
        await service.ejecutarAjustePorcentajeGlobal(-200, 1);
      } catch {
        // Esperado
      }

      expect(mockRepository.actualizarPrecioMasivo).not.toHaveBeenCalled();
    });

    it('el mensaje de error identifica al producto inválido', async () => {
      const productos = [makeProducto({ id: 5, denominacion: 'ProductoX', precio: 10 })];
      (mockRepository.findActivosByLineaId as jest.Mock).mockResolvedValue(productos);

      let error: OperacionInvalidaException | undefined;
      try {
        await service.ejecutarAjusteMontoFijoPorLinea(1, -500, 1);
      } catch (e) {
        error = e as OperacionInvalidaException;
      }

      expect(error).toBeInstanceOf(OperacionInvalidaException);
      expect(error?.message).toContain('ProductoX');
      expect(error?.productosConError[0].id).toBe(5);
    });

    it('lanza excepción si precio resultante es exactamente 0', async () => {
      // precio actual 100, monto -100 → precio = 0, debe fallar
      const productos = [makeProducto({ id: 1, precio: 100 })];
      (mockRepository.findActivosByLineaId as jest.Mock).mockResolvedValue(productos);

      await expect(service.ejecutarAjusteMontoFijoPorLinea(1, -100, 1)).rejects.toThrow(
        OperacionInvalidaException,
      );
    });

    it('NO lanza excepción si todos los precios resultantes son mayores a 0', async () => {
      const productos = [
        makeProducto({ id: 1, precio: 100 }),
        makeProducto({ id: 2, precio: 200 }),
      ];
      (mockRepository.findTodosActivos as jest.Mock).mockResolvedValue(productos);

      await expect(service.ejecutarAjustePorcentajeGlobal(5, 1)).resolves.not.toThrow();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // AJUSTE POR SUPER LÍNEA
  // ──────────────────────────────────────────────────────────────────────────

  describe('ejecutarAjustePorcentajePorSuperLinea', () => {
    it('ajusta correctamente los productos de la super-línea', async () => {
      const productos = [
        makeProducto({ id: 10, precio: 300 }),
        makeProducto({ id: 11, precio: 150 }),
      ];
      (mockRepository.findActivosBySuperLineaId as jest.Mock).mockResolvedValue(productos);

      const resultado = await service.ejecutarAjustePorcentajePorSuperLinea(2, 20, 1);

      expect(resultado[0].precioProyectado).toBe(360); // 300 * 1.20
      expect(resultado[1].precioProyectado).toBe(180); // 150 * 1.20
    });
  });
});
