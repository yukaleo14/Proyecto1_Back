import { Presentacion } from '../value-objects/presentacion.vo';
import { DatosProductoInvalidosException } from '../exceptions/datos-producto-invalidos.exception';
import { UnidadPresentacion } from '../enums/unidad-presentacion.enum';
import { Producto } from './producto.entity';
import { Marca } from '../../../marca/domain/entities/marca.entity';
import { Linea } from '../../../linea/domain/entities/linea.entity';

describe('Value Object: Presentacion', () => {
  // ========== INSTANCIACIÓN VÁLIDA ==========
  describe('Instanciación válida', () => {
    it('debe instanciarse correctamente con valor entero positivo y unidad de enum', () => {
      const p = new Presentacion(1, UnidadPresentacion.LITRO);
      expect(p.valor).toBe(1);
      expect(p.unidad).toBe('L');
      expect(p.getValue()).toBe(1);
      expect(p.getUnidad()).toBe('L');
    });

    it('debe instanciarse correctamente con valor decimal positivo', () => {
      const p = new Presentacion(1.5, UnidadPresentacion.LITRO);
      expect(p.valor).toBe(1.5);
      expect(p.unidad).toBe('L');
    });

    it('debe instanciarse con valor en mililitros', () => {
      const p = new Presentacion(354, UnidadPresentacion.MILILITRO);
      expect(p.valor).toBe(354);
      expect(p.unidad).toBe('ml');
      expect(p.descripcion()).toBe('354 ml');
    });

    it('debe instanciarse con valor de pack', () => {
      const p = new Presentacion(6, UnidadPresentacion.PACK);
      expect(p.descripcion()).toBe('6 pack');
    });

    it('debe instanciarse con una unidad de string personalizada no vacía', () => {
      const p = new Presentacion(500, 'cc');
      expect(p.valor).toBe(500);
      expect(p.unidad).toBe('cc');
    });

    it('debe limpiar espacios al inicio y final de la unidad', () => {
      const p = new Presentacion(1, '  L  ');
      expect(p.unidad).toBe('L');
    });

    it('descripcion() debe retornar el formato legible valor + unidad', () => {
      expect(new Presentacion(1.5, 'L').descripcion()).toBe('1.5 L');
      expect(new Presentacion(354, 'ml').descripcion()).toBe('354 ml');
      expect(new Presentacion(500, 'g').descripcion()).toBe('500 g');
    });

    it('toString() debe retornar la descripción legible', () => {
      const p = new Presentacion(2, UnidadPresentacion.KILOGRAMO);
      expect(p.toString()).toBe('2 kg');
    });
  });

  // ========== CRITERIOS DE ACEPTACIÓN: RECHAZO DE ESTADOS INVÁLIDOS ==========
  describe('Criterios de Aceptación: Rechazo de estados inválidos', () => {
    it('debe lanzar DatosProductoInvalidosException si el valor es 0 (Presentacion(0, "ml"))', () => {
      expect(() => new Presentacion(0, 'ml')).toThrow(DatosProductoInvalidosException);
      expect(() => new Presentacion(0, 'ml')).toThrow(
        'El valor de la presentación debe ser un número estrictamente mayor a 0.',
      );
    });

    it('debe lanzar DatosProductoInvalidosException si el valor es negativo', () => {
      expect(() => new Presentacion(-1, 'L')).toThrow(DatosProductoInvalidosException);
      expect(() => new Presentacion(-0.5, 'ml')).toThrow(DatosProductoInvalidosException);
    });

    it('debe lanzar DatosProductoInvalidosException si el valor es NaN', () => {
      expect(() => new Presentacion(NaN, 'L')).toThrow(DatosProductoInvalidosException);
    });

    it('debe lanzar DatosProductoInvalidosException si el valor es null o undefined', () => {
      expect(() => new Presentacion(null as any, 'L')).toThrow(DatosProductoInvalidosException);
      expect(() => new Presentacion(undefined as any, 'L')).toThrow(DatosProductoInvalidosException);
    });

    it('debe lanzar DatosProductoInvalidosException si la unidad es vacía', () => {
      expect(() => new Presentacion(1, '')).toThrow(DatosProductoInvalidosException);
      expect(() => new Presentacion(1, '')).toThrow(
        'La unidad de la presentación es obligatoria y no puede estar vacía.',
      );
    });

    it('debe lanzar DatosProductoInvalidosException si la unidad es solo espacios', () => {
      expect(() => new Presentacion(1, '   ')).toThrow(DatosProductoInvalidosException);
      expect(() => new Presentacion(1, '\t\n')).toThrow(DatosProductoInvalidosException);
    });

    it('debe lanzar DatosProductoInvalidosException si la unidad es null o undefined', () => {
      expect(() => new Presentacion(1, null as any)).toThrow(DatosProductoInvalidosException);
      expect(() => new Presentacion(1, undefined as any)).toThrow(DatosProductoInvalidosException);
    });

    it('debe lanzar DatosProductoInvalidosException si la unidad no es string', () => {
      expect(() => new Presentacion(1, 123 as any)).toThrow(DatosProductoInvalidosException);
    });
  });

  // ========== IGUALDAD ==========
  describe('Igualdad entre Value Objects', () => {
    it('equals() debe retornar true si dos Presentacion tienen mismo valor y unidad', () => {
      const p1 = new Presentacion(1.5, 'L');
      const p2 = new Presentacion(1.5, 'L');
      expect(p1.equals(p2)).toBe(true);
    });

    it('equals() debe retornar false si los valores difieren', () => {
      const p1 = new Presentacion(1.5, 'L');
      const p2 = new Presentacion(2, 'L');
      expect(p1.equals(p2)).toBe(false);
    });

    it('equals() debe retornar false si las unidades difieren', () => {
      const p1 = new Presentacion(500, 'ml');
      const p2 = new Presentacion(500, 'cc');
      expect(p1.equals(p2)).toBe(false);
    });

    it('equals() debe retornar false si se compara con null', () => {
      const p1 = new Presentacion(1, 'L');
      expect(p1.equals(null as any)).toBe(false);
    });

    it('equals() debe retornar false si se compara con un objeto que no es Presentacion', () => {
      const p1 = new Presentacion(1, 'L');
      expect(p1.equals({ valor: 1, unidad: 'L' } as any)).toBe(false);
    });
  });

  // ========== fromPersistence ==========
  describe('fromPersistence()', () => {
    it('debe crear correctamente una Presentacion desde valores de persistencia (string)', () => {
      const p = Presentacion.fromPersistence('1.500', 'L');
      expect(p.valor).toBe(1.5);
      expect(p.unidad).toBe('L');
    });

    it('debe crear correctamente una Presentacion desde valores de persistencia (number)', () => {
      const p = Presentacion.fromPersistence(354, 'ml');
      expect(p.valor).toBe(354);
      expect(p.unidad).toBe('ml');
    });
  });
});

describe('Aggregate Producto: cambiarPresentacion()', () => {
  let marcaValida: Marca;
  let lineaValida: Linea;
  let producto: Producto;

  beforeEach(() => {
    marcaValida = new Marca();
    marcaValida.id = 1;
    marcaValida.denominacion = 'Coca-Cola';

    lineaValida = new Linea();
    lineaValida.id = 1;
    lineaValida.denominacion = 'Gaseosas';

    producto = new Producto({
      marca: marcaValida,
      linea: lineaValida,
      denominacion: 'Coca-Cola 2L',
      costo: 1000,
      margen: 15,
      stockMinimo: 5,
      stock: 20,
    });
  });

  it('getPresentacion() debe retornar null si el producto no tiene presentación asignada', () => {
    expect(producto.getPresentacion()).toBeNull();
  });

  it('cambiarPresentacion() debe asignar correctamente una nueva presentación', () => {
    const nuevaPresentacion = new Presentacion(2, UnidadPresentacion.LITRO);
    producto.cambiarPresentacion(nuevaPresentacion);

    expect(producto.presentacionValor).toBe(2);
    expect(producto.presentacionUnidad).toBe('L');
    expect(producto.getPresentacion()?.descripcion()).toBe('2 L');
  });

  it('cambiarPresentacion() debe actualizar la presentación si cambia a otra diferente', () => {
    const p1 = new Presentacion(1.5, 'L');
    const p2 = new Presentacion(354, 'ml');

    producto.cambiarPresentacion(p1);
    expect(producto.presentacionValor).toBe(1.5);

    producto.cambiarPresentacion(p2);
    expect(producto.presentacionValor).toBe(354);
    expect(producto.presentacionUnidad).toBe('ml');
  });

  it('cambiarPresentacion() debe ser no-op si se asigna la misma presentación', () => {
    const p1 = new Presentacion(1.5, 'L');
    producto.cambiarPresentacion(p1);
    const valorAntes = producto.presentacionValor;

    const p2 = new Presentacion(1.5, 'L'); // mismo valor y unidad
    producto.cambiarPresentacion(p2);

    expect(producto.presentacionValor).toBe(valorAntes); // sin cambio
  });

  it('cambiarPresentacion() debe lanzar DatosProductoInvalidosException si se pasa null', () => {
    expect(() => producto.cambiarPresentacion(null as any)).toThrow(
      DatosProductoInvalidosException,
    );
    expect(() => producto.cambiarPresentacion(null as any)).toThrow(
      'La presentación es obligatoria.',
    );
  });

  it('cambiarPresentacion() debe lanzar DatosProductoInvalidosException si se pasa undefined', () => {
    expect(() => producto.cambiarPresentacion(undefined as any)).toThrow(
      DatosProductoInvalidosException,
    );
  });

  it('cambiarPresentacion() debe lanzar DatosProductoInvalidosException si se pasa un objeto que no es Presentacion', () => {
    expect(() =>
      producto.cambiarPresentacion({ valor: 1, unidad: 'L' } as any),
    ).toThrow(DatosProductoInvalidosException);
    expect(() =>
      producto.cambiarPresentacion({ valor: 1, unidad: 'L' } as any),
    ).toThrow('El argumento debe ser una instancia válida de Presentacion.');
  });

  it('getPresentacion() debe reconstruir el VO Presentacion desde la persistencia correctamente', () => {
    producto.presentacionValor = 1.5;
    producto.presentacionUnidad = 'L';

    const voReconstituido = producto.getPresentacion();
    expect(voReconstituido).not.toBeNull();
    expect(voReconstituido!.valor).toBe(1.5);
    expect(voReconstituido!.unidad).toBe('L');
    expect(voReconstituido!.descripcion()).toBe('1.5 L');
  });

  it('Criterio de Aceptación: Intentar crear Presentacion(0, "ml") lanza excepción', () => {
    expect(() => new Presentacion(0, 'ml')).toThrow(DatosProductoInvalidosException);
    expect(() => new Presentacion(0, 'ml')).toThrow(
      'El valor de la presentación debe ser un número estrictamente mayor a 0.',
    );
  });

  it('Criterio de Aceptación: producto.cambiarPresentacion() modifica el estado del agregado', () => {
    expect(producto.getPresentacion()).toBeNull();

    const presentacion = new Presentacion(354, UnidadPresentacion.MILILITRO);
    producto.cambiarPresentacion(presentacion);

    expect(producto.getPresentacion()).not.toBeNull();
    expect(producto.presentacionValor).toBe(354);
    expect(producto.presentacionUnidad).toBe('ml');
    expect(producto.getPresentacion()!.equals(presentacion)).toBe(true);
  });
});
