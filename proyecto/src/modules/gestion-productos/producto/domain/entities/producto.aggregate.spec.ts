import { Producto } from './producto.entity';
import { Costo, StockMinimo, Margen } from '../value-objects';
import { DatosProductoInvalidosException } from '../exceptions/datos-producto-invalidos.exception';
import { Marca } from '../../../marca/domain/entities/marca.entity';
import { Linea } from '../../../linea/domain/entities/linea.entity';

describe('Agregado Producto y Value Objects (DDD)', () => {
  let marcaValida: Marca;
  let lineaValida: Linea;

  beforeEach(() => {
    marcaValida = new Marca();
    marcaValida.id = 1;
    marcaValida.denominacion = 'Coca-Cola';

    lineaValida = new Linea();
    lineaValida.id = 1;
    lineaValida.denominacion = 'Gaseosas';
  });

  describe('Value Object: Costo', () => {
    it('debe instanciarse correctamente con un valor mayor a 0', () => {
      const costo = new Costo(150.5);
      expect(costo.getValue()).toBe(150.5);
      expect(costo.valor).toBe(150.5);
      expect(costo.toString()).toBe('150.5');
    });

    it('debe lanzar DatosProductoInvalidosException si el costo es 0', () => {
      expect(() => new Costo(0)).toThrow(DatosProductoInvalidosException);
      expect(() => new Costo(0)).toThrow('El costo debe ser un valor numérico mayor a 0.');
    });

    it('debe lanzar DatosProductoInvalidosException si el costo es negativo', () => {
      expect(() => new Costo(-10)).toThrow(DatosProductoInvalidosException);
      expect(() => new Costo(-10)).toThrow('El costo debe ser un valor numérico mayor a 0.');
    });

    it('debe lanzar DatosProductoInvalidosException si el costo no es numérico o es NaN', () => {
      expect(() => new Costo(NaN)).toThrow(DatosProductoInvalidosException);
      expect(() => new Costo(null as any)).toThrow(DatosProductoInvalidosException);
      expect(() => new Costo(undefined as any)).toThrow(DatosProductoInvalidosException);
    });

    it('debe comparar igualdad con otro Costo mediante equals()', () => {
      const costo1 = new Costo(100);
      const costo2 = new Costo(100);
      const costo3 = new Costo(200);

      expect(costo1.equals(costo2)).toBe(true);
      expect(costo1.equals(costo3)).toBe(false);
      expect(costo1.equals(null as any)).toBe(false);
    });
  });

  describe('Value Object: StockMinimo', () => {
    it('debe instanciarse correctamente con un entero mayor o igual a 0', () => {
      const stockCero = new StockMinimo(0);
      const stockPositivo = new StockMinimo(10);

      expect(stockCero.getValue()).toBe(0);
      expect(stockPositivo.getValue()).toBe(10);
    });

    it('debe lanzar DatosProductoInvalidosException si es negativo', () => {
      expect(() => new StockMinimo(-1)).toThrow(DatosProductoInvalidosException);
      expect(() => new StockMinimo(-1)).toThrow(
        'El stock mínimo debe ser un número entero mayor o igual a 0.',
      );
    });

    it('debe lanzar DatosProductoInvalidosException si tiene decimales (no es entero)', () => {
      expect(() => new StockMinimo(2.5)).toThrow(DatosProductoInvalidosException);
      expect(() => new StockMinimo(2.5)).toThrow(
        'El stock mínimo debe ser un número entero mayor o igual a 0.',
      );
    });

    it('debe lanzar DatosProductoInvalidosException si es NaN, null o undefined', () => {
      expect(() => new StockMinimo(NaN)).toThrow(DatosProductoInvalidosException);
      expect(() => new StockMinimo(null as any)).toThrow(DatosProductoInvalidosException);
      expect(() => new StockMinimo(undefined as any)).toThrow(DatosProductoInvalidosException);
    });

    it('debe comparar igualdad mediante equals()', () => {
      const sm1 = new StockMinimo(5);
      const sm2 = new StockMinimo(5);
      const sm3 = new StockMinimo(10);

      expect(sm1.equals(sm2)).toBe(true);
      expect(sm1.equals(sm3)).toBe(false);
    });
  });

  describe('Value Object: Margen', () => {
    it('debe instanciarse correctamente con un valor numérico mayor o igual a 0', () => {
      const margenCero = new Margen(0);
      const margenPositivo = new Margen(21.5);

      expect(margenCero.getValue()).toBe(0);
      expect(margenPositivo.getValue()).toBe(21.5);
    });

    it('debe lanzar DatosProductoInvalidosException si el margen es negativo', () => {
      expect(() => new Margen(-0.01)).toThrow(DatosProductoInvalidosException);
      expect(() => new Margen(-15)).toThrow('El margen debe ser un valor numérico mayor o igual a 0.');
    });

    it('debe lanzar DatosProductoInvalidosException si es NaN, null o undefined', () => {
      expect(() => new Margen(NaN)).toThrow(DatosProductoInvalidosException);
      expect(() => new Margen(null as any)).toThrow(DatosProductoInvalidosException);
      expect(() => new Margen(undefined as any)).toThrow(DatosProductoInvalidosException);
    });

    it('debe comparar igualdad mediante equals()', () => {
      const m1 = new Margen(15);
      const m2 = new Margen(15);
      const m3 = new Margen(20);

      expect(m1.equals(m2)).toBe(true);
      expect(m1.equals(m3)).toBe(false);
    });
  });

  describe('Agregado: Producto (Aggregate Root)', () => {
    it('debe permitir instanciación vacía para compatibilidad con TypeORM', () => {
      const prod = new Producto();
      expect(prod).toBeDefined();
      expect(prod.id).toBeUndefined();
    });

    it('debe instanciarse exitosamente con parámetros válidos mediante objeto', () => {
      const prod = new Producto({
        marca: marcaValida,
        linea: lineaValida,
        denominacion: 'Coca-Cola 2L',
        costo: 1000,
        margen: 15,
        stockMinimo: 5,
        stock: 20,
      });

      expect(prod.denominacion).toBe('Coca-Cola 2L');
      expect(prod.costo).toBe(1000);
      expect(prod.margen).toBe(15);
      expect(prod.stockMinimo).toBe(5);
      expect(prod.stock).toBe(20);
      expect(prod.precio).toBe(1150); // 1000 * 1.15
    });

    it('debe instanciarse exitosamente con parámetros posicionales (marca, linea, denominacion, costo, margen, stockMinimo)', () => {
      const prod = new Producto(
        marcaValida,
        lineaValida,
        'Coca-Cola Zero 1.5L',
        800,
        25,
        10,
        15,
      );

      expect(prod.denominacion).toBe('Coca-Cola Zero 1.5L');
      expect(prod.costo).toBe(800);
      expect(prod.margen).toBe(25);
      expect(prod.stockMinimo).toBe(10);
      expect(prod.stock).toBe(15);
      expect(prod.precio).toBe(1000); // 800 * 1.25
    });

    it('debe instanciarse exitosamente aceptando instancias de Value Objects', () => {
      const costoVo = new Costo(500);
      const margenVo = new Margen(10);
      const stockMinimoVo = new StockMinimo(2);

      const prod = new Producto({
        marca: marcaValida,
        linea: lineaValida,
        denominacion: 'Sprite 500ml',
        costo: costoVo,
        margen: margenVo,
        stockMinimo: stockMinimoVo,
      });

      expect(prod.costo).toBe(500);
      expect(prod.margen).toBe(10);
      expect(prod.stockMinimo).toBe(2);
      expect(prod.stock).toBe(0); // Valor por defecto
      expect(prod.precio).toBe(550);
    });

    // ========== CRITERIOS DE ACEPTACIÓN ==========
    describe('Criterios de Aceptación: Rechazo de estados inválidos', () => {
      it('debe rechazar instanciación con costo <= 0 (costo = 0)', () => {
        expect(
          () =>
            new Producto({
              marca: marcaValida,
              linea: lineaValida,
              denominacion: 'Producto Test',
              costo: 0,
              margen: 15,
              stockMinimo: 5,
            }),
        ).toThrow(DatosProductoInvalidosException);
      });

      it('debe rechazar instanciación con costo <= 0 (costo negativo)', () => {
        expect(
          () =>
            new Producto({
              marca: marcaValida,
              linea: lineaValida,
              denominacion: 'Producto Test',
              costo: -150,
              margen: 15,
              stockMinimo: 5,
            }),
        ).toThrow(DatosProductoInvalidosException);
      });

      it('debe rechazar instanciación con stock negativo', () => {
        expect(
          () =>
            new Producto({
              marca: marcaValida,
              linea: lineaValida,
              denominacion: 'Producto Test',
              costo: 100,
              margen: 10,
              stockMinimo: 5,
              stock: -3,
            }),
        ).toThrow(DatosProductoInvalidosException);

        expect(
          () =>
            new Producto({
              marca: marcaValida,
              linea: lineaValida,
              denominacion: 'Producto Test',
              costo: 100,
              margen: 10,
              stockMinimo: 5,
              stock: -1,
            }),
        ).toThrow('El stock no puede ser negativo.');
      });

      it('debe rechazar instanciación con denominación vacía', () => {
        expect(
          () =>
            new Producto({
              marca: marcaValida,
              linea: lineaValida,
              denominacion: '',
              costo: 100,
              margen: 10,
              stockMinimo: 5,
            }),
        ).toThrow(DatosProductoInvalidosException);

        expect(
          () =>
            new Producto({
              marca: marcaValida,
              linea: lineaValida,
              denominacion: '',
              costo: 100,
              margen: 10,
              stockMinimo: 5,
            }),
        ).toThrow('El campo denominación no puede estar vacío o contener solo espacios en blanco.');
      });

      it('debe rechazar instanciación con denominación de solo espacios en blanco', () => {
        expect(
          () =>
            new Producto({
              marca: marcaValida,
              linea: lineaValida,
              denominacion: '    ',
              costo: 100,
              margen: 10,
              stockMinimo: 5,
            }),
        ).toThrow(DatosProductoInvalidosException);

        expect(
          () =>
            new Producto({
              marca: marcaValida,
              linea: lineaValida,
              denominacion: '   \t  \n ',
              costo: 100,
              margen: 10,
              stockMinimo: 5,
            }),
        ).toThrow('El campo denominación no puede estar vacío o contener solo espacios en blanco.');
      });

      it('debe rechazar instanciación con marca en blanco o vacía', () => {
        expect(
          () =>
            new Producto({
              marca: '   ',
              linea: lineaValida,
              denominacion: 'Producto Test',
              costo: 100,
              margen: 10,
              stockMinimo: 5,
            }),
        ).toThrow(DatosProductoInvalidosException);
      });

      it('debe rechazar instanciación con línea en blanco o vacía', () => {
        expect(
          () =>
            new Producto({
              marca: marcaValida,
              linea: '   ',
              denominacion: 'Producto Test',
              costo: 100,
              margen: 10,
              stockMinimo: 5,
            }),
        ).toThrow(DatosProductoInvalidosException);
      });

      it('debe rechazar instanciación con strings opcionales que contengan solo espacios en blanco', () => {
        expect(
          () =>
            new Producto({
              marca: marcaValida,
              linea: lineaValida,
              denominacion: 'Producto Test',
              costo: 100,
              margen: 10,
              stockMinimo: 5,
              codigoProveedor: '   ',
            }),
        ).toThrow(DatosProductoInvalidosException);
      });

      it('debe rechazar instanciación con stock mínimo negativo', () => {
        expect(
          () =>
            new Producto({
              marca: marcaValida,
              linea: lineaValida,
              denominacion: 'Producto Test',
              costo: 100,
              margen: 10,
              stockMinimo: -5,
            }),
        ).toThrow(DatosProductoInvalidosException);
      });

      it('debe rechazar instanciación con margen negativo', () => {
        expect(
          () =>
            new Producto({
              marca: marcaValida,
              linea: lineaValida,
              denominacion: 'Producto Test',
              costo: 100,
              margen: -10,
              stockMinimo: 5,
            }),
        ).toThrow(DatosProductoInvalidosException);
      });

      it('debe rechazar instanciación cuando faltan campos obligatorios', () => {
        expect(
          () =>
            new Producto({
              marca: null as any,
              linea: lineaValida,
              denominacion: 'Producto',
              costo: 100,
              margen: 10,
              stockMinimo: 5,
            }),
        ).toThrow('El campo marca es obligatorio.');

        expect(
          () =>
            new Producto({
              marca: marcaValida,
              linea: null as any,
              denominacion: 'Producto',
              costo: 100,
              margen: 10,
              stockMinimo: 5,
            }),
        ).toThrow('El campo linea es obligatorio.');

        expect(
          () =>
            new Producto({
              marca: marcaValida,
              linea: lineaValida,
              denominacion: null as any,
              costo: 100,
              margen: 10,
              stockMinimo: 5,
            }),
        ).toThrow('El campo denominacion es obligatorio.');

        expect(
          () =>
            new Producto({
              marca: marcaValida,
              linea: lineaValida,
              denominacion: 'Producto',
              costo: null as any,
              margen: 10,
              stockMinimo: 5,
            }),
        ).toThrow('El campo costo es obligatorio.');

        expect(
          () =>
            new Producto({
              marca: marcaValida,
              linea: lineaValida,
              denominacion: 'Producto',
              costo: 100,
              margen: null as any,
              stockMinimo: 5,
            }),
        ).toThrow('El campo margen es obligatorio.');

        expect(
          () =>
            new Producto({
              marca: marcaValida,
              linea: lineaValida,
              denominacion: 'Producto',
              costo: 100,
              margen: 10,
              stockMinimo: null as any,
            }),
        ).toThrow('El campo stockMinimo es obligatorio.');
      });
    });

    // ========== MÉTODOS DE COMPORTAMIENTO DE DOMINIO ==========
    describe('Comportamiento y reglas de negocio del Agregado', () => {
      it('calcularPrecio() debe calcular correctamente Costo + Margen', () => {
        const prod = new Producto({
          marca: marcaValida,
          linea: lineaValida,
          denominacion: 'Producto Test',
          costo: 1000,
          margen: 15,
          stockMinimo: 5,
        });

        expect(prod.calcularPrecio()).toBe(1150);
        expect(prod.precio).toBe(1150);

        prod.actualizarMargen(25);
        expect(prod.precio).toBe(1250);
      });

      it('estaBajoMinimo() debe retornar true si stock <= stockMinimo y false en caso contrario', () => {
        const prod = new Producto({
          marca: marcaValida,
          linea: lineaValida,
          denominacion: 'Producto Alerta',
          costo: 500,
          margen: 10,
          stockMinimo: 10,
          stock: 5,
        });

        expect(prod.estaBajoMinimo()).toBe(true);

        prod.stock = 10;
        expect(prod.estaBajoMinimo()).toBe(true);

        prod.stock = 11;
        expect(prod.estaBajoMinimo()).toBe(false);
      });

      it('actualizarCosto() debe validar y recalcular precio', () => {
        const prod = new Producto({
          marca: marcaValida,
          linea: lineaValida,
          denominacion: 'Test',
          costo: 100,
          margen: 20,
          stockMinimo: 5,
        });

        prod.actualizarCosto(200);
        expect(prod.costo).toBe(200);
        expect(prod.precio).toBe(240); // 200 * 1.20
        expect(prod.fechaCosto).toBeInstanceOf(Date);

        expect(() => prod.actualizarCosto(0)).toThrow(DatosProductoInvalidosException);
        expect(() => prod.actualizarCosto(-50)).toThrow(DatosProductoInvalidosException);
      });

      it('actualizarMargen() debe validar y recalcular precio', () => {
        const prod = new Producto({
          marca: marcaValida,
          linea: lineaValida,
          denominacion: 'Test',
          costo: 100,
          margen: 10,
          stockMinimo: 5,
        });

        prod.actualizarMargen(50);
        expect(prod.margen).toBe(50);
        expect(prod.porcentaje).toBe(50);
        expect(prod.precio).toBe(150);

        expect(() => prod.actualizarMargen(-10)).toThrow(DatosProductoInvalidosException);
      });

      it('actualizarStockMinimo() debe validar entero no negativo', () => {
        const prod = new Producto({
          marca: marcaValida,
          linea: lineaValida,
          denominacion: 'Test',
          costo: 100,
          margen: 10,
          stockMinimo: 5,
        });

        prod.actualizarStockMinimo(12);
        expect(prod.stockMinimo).toBe(12);

        expect(() => prod.actualizarStockMinimo(-1)).toThrow(DatosProductoInvalidosException);
        expect(() => prod.actualizarStockMinimo(3.5)).toThrow(DatosProductoInvalidosException);
      });

      it('actualizarDenominacion() debe validar que no esté vacía ni en blanco', () => {
        const prod = new Producto({
          marca: marcaValida,
          linea: lineaValida,
          denominacion: 'Original',
          costo: 100,
          margen: 10,
          stockMinimo: 5,
        });

        prod.actualizarDenominacion('Modificado');
        expect(prod.denominacion).toBe('Modificado');

        expect(() => prod.actualizarDenominacion('')).toThrow(DatosProductoInvalidosException);
        expect(() => prod.actualizarDenominacion('    ')).toThrow(DatosProductoInvalidosException);
      });

      it('ajustarStock() debe incrementar o decrementar el stock y registrar motivo', () => {
        const prod = new Producto({
          marca: marcaValida,
          linea: lineaValida,
          denominacion: 'Test',
          costo: 100,
          margen: 10,
          stockMinimo: 5,
          stock: 10,
        });

        prod.ajustarStock(5, 'Compra de reposición');
        expect(prod.stock).toBe(15);

        prod.ajustarStock(-2, 'Rotura de envase');
        expect(prod.stock).toBe(13);

        expect(() => prod.ajustarStock(-20, 'Venta')).toThrow(
          DatosProductoInvalidosException,
        );
        expect(() => prod.ajustarStock(5, '')).toThrow(DatosProductoInvalidosException);
        expect(() => prod.ajustarStock(5, '   ')).toThrow(DatosProductoInvalidosException);
      });
    });
  });
});
