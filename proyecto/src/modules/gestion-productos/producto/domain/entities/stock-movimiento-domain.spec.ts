jest.mock('@nestjs/event-emitter', () => ({
  OnEvent: () => () => {},
  EventEmitter2: class {},
}));

import { Producto } from './producto.entity';
import { MovimientoStock } from './movimiento-stock.entity';
import { TipoMovimientoStock } from '../enums/tipo-movimiento-stock.enum';
import { StockActualizadoEvent, StockActualizado } from '../events/stock-actualizado.event';
import { StockBajoEvent, StockBajo } from '../events/stock-bajo.event';
import { StockEventsHandler } from '../../application/handlers/stock-events.handler';
import { DatosProductoInvalidosException } from '../exceptions/datos-producto-invalidos.exception';
import { BuscarProductosQueryDto } from '../../dto/buscar-productos-query.dto';
import { ProductoQueryService } from '../../application/services/producto-query.service';

describe('Dominio de Stock, Movimientos y Eventos (DDD)', () => {
  const crearProductoEjemplo = (stock = 10, stockMinimo = 5): Producto => {
    const prod = new Producto({
      marca: 'Coca-Cola',
      linea: 'Gaseosas',
      denominacion: 'Coca-Cola 2L',
      costo: 1000,
      margen: 20,
      stockMinimo,
      stock,
    });
    prod.id = 1;
    return prod;
  };

  describe('5.2 Regla de stock bajo y método estaBajoMinimo()', () => {
    it('debe detectar stock bajo cuando stockActual <= stockMinimo (ejemplo: stock=5, minimo=5)', () => {
      const prod = crearProductoEjemplo(5, 5);
      expect(prod.estaBajoMinimo()).toBe(true);
    });

    it('debe detectar stock bajo cuando stockActual < stockMinimo (ejemplo: stock=2, minimo=5)', () => {
      const prod = crearProductoEjemplo(2, 5);
      expect(prod.estaBajoMinimo()).toBe(true);
    });

    it('debe retornar false cuando stockActual > stockMinimo (ejemplo: stock=6, minimo=5)', () => {
      const prod = crearProductoEjemplo(6, 5);
      expect(prod.estaBajoMinimo()).toBe(false);
    });

    it('debe considerar stock bajo cuando stockActual es 0 y stockMinimo es 0 o mayor', () => {
      const prodCero = crearProductoEjemplo(0, 0);
      expect(prodCero.estaBajoMinimo()).toBe(true);
    });
  });

  describe('4.2 Entidad MovimientoStock', () => {
    it('debe instanciarse correctamente con todos los atributos requeridos', () => {
      const fecha = new Date();
      const movimiento = new MovimientoStock({
        productoId: 1,
        tipoMovimiento: TipoMovimientoStock.AJUSTE,
        cantidad: -2,
        motivo: 'rotura',
        fecha,
      });

      expect(movimiento.productoId).toBe(1);
      expect(movimiento.tipoMovimiento).toBe(TipoMovimientoStock.AJUSTE);
      expect(movimiento.cantidad).toBe(-2);
      expect(movimiento.motivo).toBe('rotura');
      expect(movimiento.fecha).toBe(fecha);
    });

    it('debe admitir todos los tipos de movimiento del dominio', () => {
      expect(TipoMovimientoStock.COMPRA).toBe('Compra');
      expect(TipoMovimientoStock.VENTA).toBe('Venta');
      expect(TipoMovimientoStock.DEVOLUCION_CLIENTE).toBe('Devolución de cliente');
      expect(TipoMovimientoStock.DEVOLUCION_PROVEEDOR).toBe('Devolución a proveedor');
      expect(TipoMovimientoStock.AJUSTE).toBe('Ajuste');
    });

    it('debe exigir motivo obligatorio para movimientos de tipo Ajuste', () => {
      expect(
        () =>
          new MovimientoStock({
            productoId: 1,
            tipoMovimiento: TipoMovimientoStock.AJUSTE,
            cantidad: -2,
            motivo: '',
          }),
      ).toThrow(DatosProductoInvalidosException);

      expect(
        () =>
          new MovimientoStock({
            productoId: 1,
            tipoMovimiento: TipoMovimientoStock.AJUSTE,
            cantidad: -2,
            motivo: '   ',
          }),
      ).toThrow(DatosProductoInvalidosException);
    });

    it('debe rechazar cantidad igual a cero o inválida', () => {
      expect(
        () =>
          new MovimientoStock({
            productoId: 1,
            tipoMovimiento: TipoMovimientoStock.COMPRA,
            cantidad: 0,
          }),
      ).toThrow(DatosProductoInvalidosException);

      expect(
        () =>
          new MovimientoStock({
            productoId: 1,
            tipoMovimiento: TipoMovimientoStock.COMPRA,
            cantidad: NaN,
          }),
      ).toThrow(DatosProductoInvalidosException);
    });
  });

  describe('5.3 Regla de Ajuste de stock en Producto', () => {
    it('Ejemplo de ajuste: Stock actual: 10 -> Ajuste: -2 (motivo: rotura) -> Nuevo stock: 8', () => {
      const prod = crearProductoEjemplo(10, 5);

      const movimiento = prod.ajustarStock(-2, 'rotura');

      expect(prod.stock).toBe(8);
      expect(movimiento).toBeInstanceOf(MovimientoStock);
      expect(movimiento.tipoMovimiento).toBe(TipoMovimientoStock.AJUSTE);
      expect(movimiento.cantidad).toBe(-2);
      expect(movimiento.motivo).toBe('rotura');
      expect(prod.movimientosStock).toContain(movimiento);
    });

    it('debe permitir ajustes positivos (aumento de stock, ej: inventario físico)', () => {
      const prod = crearProductoEjemplo(10, 5);

      const movimiento = prod.ajustarStock(5, 'inventario físico sobrante');

      expect(prod.stock).toBe(15);
      expect(movimiento.cantidad).toBe(5);
      expect(movimiento.motivo).toBe('inventario físico sobrante');
    });

    it('debe rechazar un ajuste si deja el stock resultante negativo', () => {
      const prod = crearProductoEjemplo(10, 5);

      expect(() => prod.ajustarStock(-11, 'pérdida')).toThrow(DatosProductoInvalidosException);
      expect(prod.stock).toBe(10); // Invariante protegida
    });

    it('debe rechazar un ajuste sin motivo o con motivo en blanco', () => {
      const prod = crearProductoEjemplo(10, 5);

      expect(() => prod.ajustarStock(-2, '')).toThrow(DatosProductoInvalidosException);
      expect(() => prod.ajustarStock(-2, '   ')).toThrow(DatosProductoInvalidosException);
    });

    it('debe rechazar un ajuste con delta cero', () => {
      const prod = crearProductoEjemplo(10, 5);

      expect(() => prod.ajustarStock(0, 'error de carga')).toThrow(
        DatosProductoInvalidosException,
      );
    });
  });

  describe('Movimientos Tipificados en Producto (Compra, Venta, Devoluciones)', () => {
    it('Compra debe incrementar el stock y registrar MovimientoStock COMPRA', () => {
      const prod = crearProductoEjemplo(10, 5);
      const mov = prod.registrarMovimiento(TipoMovimientoStock.COMPRA, 10, 'Factura Compra 001');

      expect(prod.stock).toBe(20);
      expect(mov.tipoMovimiento).toBe(TipoMovimientoStock.COMPRA);
      expect(mov.cantidad).toBe(10);
    });

    it('Venta debe decrementar el stock y registrar MovimientoStock VENTA', () => {
      const prod = crearProductoEjemplo(10, 5);
      const mov = prod.registrarMovimiento(TipoMovimientoStock.VENTA, 4, 'Ticket Venta 123');

      expect(prod.stock).toBe(6);
      expect(mov.tipoMovimiento).toBe(TipoMovimientoStock.VENTA);
      expect(mov.cantidad).toBe(-4);
    });

    it('Venta que supera el stock disponible debe arrojar excepción', () => {
      const prod = crearProductoEjemplo(5, 5);
      expect(() =>
        prod.registrarMovimiento(TipoMovimientoStock.VENTA, 10, 'Venta excesiva'),
      ).toThrow(DatosProductoInvalidosException);
    });

    it('Devolución de cliente debe aumentar el stock', () => {
      const prod = crearProductoEjemplo(5, 5);
      const mov = prod.registrarMovimiento(
        TipoMovimientoStock.DEVOLUCION_CLIENTE,
        2,
        'Devolución cliente',
      );
      expect(prod.stock).toBe(7);
      expect(mov.cantidad).toBe(2);
    });

    it('Devolución a proveedor debe disminuir el stock', () => {
      const prod = crearProductoEjemplo(5, 5);
      const mov = prod.registrarMovimiento(
        TipoMovimientoStock.DEVOLUCION_PROVEEDOR,
        2,
        'Devolución a proveedor mercadería defectuosa',
      );
      expect(prod.stock).toBe(3);
      expect(mov.cantidad).toBe(-2);
    });
  });

  describe('Eventos de Dominio: StockActualizado y StockBajo', () => {
    it('StockActualizadoEvent debe almacenar correctamente los datos del cambio de stock', () => {
      const event = new StockActualizadoEvent(
        1,
        'Coca-Cola 2L',
        10,
        8,
        -2,
        TipoMovimientoStock.AJUSTE,
        'rotura',
      );

      expect(event.productoId).toBe(1);
      expect(event.denominacion).toBe('Coca-Cola 2L');
      expect(event.stockAnterior).toBe(10);
      expect(event.stockActual).toBe(8);
      expect(event.cantidad).toBe(-2);
      expect(event.tipoMovimiento).toBe(TipoMovimientoStock.AJUSTE);
      expect(event.motivo).toBe('rotura');
      expect(event.fecha).toBeInstanceOf(Date);
    });

    it('StockBajoEvent debe almacenar los datos del producto cuando stockActual <= stockMinimo', () => {
      const event = new StockBajoEvent(1, 'Coca-Cola 2L', 5, 5);

      expect(event.productoId).toBe(1);
      expect(event.denominacion).toBe('Coca-Cola 2L');
      expect(event.stockActual).toBe(5);
      expect(event.stockMinimo).toBe(5);
      expect(event.fecha).toBeInstanceOf(Date);
    });

    it('StockEventsHandler debe manejar eventos sin fallar', () => {
      const handler = new StockEventsHandler();
      const warnSpy = jest.spyOn((handler as any).logger, 'warn').mockImplementation(() => {});
      const logSpy = jest.spyOn((handler as any).logger, 'log').mockImplementation(() => {});

      const bajoEvent = new StockBajoEvent(1, 'Coca-Cola 2L', 4, 5);
      handler.handleStockBajoEvent(bajoEvent);
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[ALERTA DE STOCK BAJO]'),
      );

      const actualizaEvent = new StockActualizadoEvent(
        1,
        'Coca-Cola 2L',
        10,
        8,
        -2,
        TipoMovimientoStock.AJUSTE,
        'rotura',
      );
      handler.handleStockActualizadoEvent(actualizaEvent);
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('[STOCK ACTUALIZADO]'),
      );
    });
  });

  describe('Búsqueda con término único OR (Solución a lo que planteó la compañera)', () => {
    it('BuscarProductosQueryDto debe aceptar el parámetro termino', () => {
      const dto = new BuscarProductosQueryDto();
      dto.termino = 'coca';
      expect(dto.termino).toBe('coca');
    });

    it('ProductoQueryService debe aplicar búsqueda OR entre denominación, línea y superlínea cuando se envía termino', async () => {
      const andWhereMock = jest.fn().mockReturnThis();
      const whereMock = jest.fn().mockReturnThis();
      const leftJoinMock = jest.fn().mockReturnThis();
      const orderByMock = jest.fn().mockReturnThis();
      const skipMock = jest.fn().mockReturnThis();
      const takeMock = jest.fn().mockReturnThis();
      const getManyAndCountMock = jest.fn().mockResolvedValue([[], 0]);

      const mockQueryBuilder: any = {
        leftJoinAndSelect: leftJoinMock,
        where: whereMock,
        andWhere: andWhereMock,
        orderBy: orderByMock,
        skip: skipMock,
        take: takeMock,
        getManyAndCount: getManyAndCountMock,
      };

      const mockRepository: any = {
        createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
      };

      const mockHistoricoRepo: any = {
        find: jest.fn(),
        createQueryBuilder: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          getMany: jest.fn().mockResolvedValue([]),
        }),
      };

      const service = new ProductoQueryService(mockRepository, mockHistoricoRepo);

      await service.buscar({
        termino: 'coca',
      });

      // Verificar que se invocó andWhere con un Brackets
      expect(andWhereMock).toHaveBeenCalled();
      const bracketsCall = andWhereMock.mock.calls.find((call) => typeof call[0] === 'object');
      expect(bracketsCall).toBeDefined();

      // Ejecutar la función interna del Brackets para verificar los ORs
      const subQbMock = {
        where: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
      };
      bracketsCall[0].whereFactory(subQbMock);

      expect(subQbMock.where).toHaveBeenCalledWith(
        'LOWER(producto.denominacion) LIKE :termino',
        { termino: '%coca%' },
      );
      expect(subQbMock.orWhere).toHaveBeenCalledWith(
        'LOWER(linea.denominacion) LIKE :termino',
        { termino: '%coca%' },
      );
      expect(subQbMock.orWhere).toHaveBeenCalledWith(
        'LOWER(superLinea.nombre) LIKE :termino',
        { termino: '%coca%' },
      );
    });
  });
});
