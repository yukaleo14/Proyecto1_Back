import { Linea } from './linea.entity';
import { SuperLinea } from '../../../super-linea/domain/entities/super-linea.entity';
import { LineaSinSuperLineaException } from '../exceptions/linea-sin-super-linea.exception';
import { validate } from 'class-validator';
import { CreateLineaDto } from '../../dto/create-linea.dto';

describe('Aggregate Linea: Invariante de Existencia de SuperLínea', () => {
  let superLineaValida: SuperLinea;

  beforeEach(() => {
    superLineaValida = new SuperLinea('Alimentos', 'Categoría de alimentos');
    superLineaValida.id = 5;
  });

  describe('Instanciación válida', () => {
    it('debe crear una Línea correctamente con superLineaId válido por parámetros', () => {
      const linea = new Linea('Gaseosas', 5, 'Línea de bebidas gaseosas');
      expect(linea.denominacion).toBe('Gaseosas');
      expect(linea.superLineaId).toBe(5);
      expect(linea.observacion).toBe('Línea de bebidas gaseosas');
    });

    it('debe crear una Línea correctamente mediante props con superLineaId', () => {
      const linea = new Linea({
        denominacion: 'Aguas',
        superLineaId: 5,
        utilizaStockMinimo: true,
        stockMinimo: 10,
      });
      expect(linea.denominacion).toBe('Aguas');
      expect(linea.superLineaId).toBe(5);
      expect(linea.utilizaStockMinimo).toBe(true);
      expect(linea.stockMinimo).toBe(10);
    });

    it('debe crear una Línea asociando la entidad SuperLinea directamente en props', () => {
      const linea = new Linea({
        denominacion: 'Jugos',
        superLineaId: superLineaValida.id,
        superLinea: superLineaValida,
      });
      expect(linea.superLineaId).toBe(5);
      expect(linea.superLinea).toBe(superLineaValida);
    });

    it('debe permitir instanciación sin argumentos para hidratación de TypeORM', () => {
      const linea = new Linea();
      expect(linea).toBeDefined();
    });
  });

  describe('Criterio de Aceptación: Invariante de obligatoriedad de SuperLínea', () => {
    it('debe arrojar LineaSinSuperLineaException si superLineaId es undefined', () => {
      expect(() => new Linea('Gaseosas', undefined as any)).toThrow(
        LineaSinSuperLineaException,
      );
    });

    it('debe arrojar LineaSinSuperLineaException si superLineaId es null', () => {
      expect(() => new Linea('Gaseosas', null as any)).toThrow(
        LineaSinSuperLineaException,
      );
    });

    it('debe arrojar LineaSinSuperLineaException si superLineaId es 0', () => {
      expect(() => new Linea('Gaseosas', 0)).toThrow(LineaSinSuperLineaException);
      expect(() => new Linea('Gaseosas', 0)).toThrow(
        'La SuperLínea es obligatoria para toda Línea',
      );
    });

    it('debe arrojar LineaSinSuperLineaException si superLineaId es negativo', () => {
      expect(() => new Linea('Gaseosas', -1)).toThrow(LineaSinSuperLineaException);
    });

    it('debe arrojar LineaSinSuperLineaException si en props no se pasa superLineaId ni superLinea', () => {
      expect(
        () =>
          new Linea({
            denominacion: 'Gaseosas',
          } as any),
      ).toThrow(LineaSinSuperLineaException);
    });

    it('cambiarSuperLinea() debe permitir actualizar a un ID válido mayor a 0', () => {
      const linea = new Linea('Gaseosas', 5);
      linea.cambiarSuperLinea(8);
      expect(linea.superLineaId).toBe(8);
    });

    it('cambiarSuperLinea() debe rechazar IDs menores o iguales a 0 o nulos', () => {
      const linea = new Linea('Gaseosas', 5);
      expect(() => linea.cambiarSuperLinea(0)).toThrow(LineaSinSuperLineaException);
      expect(() => linea.cambiarSuperLinea(-2)).toThrow(LineaSinSuperLineaException);
      expect(() => linea.cambiarSuperLinea(null as any)).toThrow(
        LineaSinSuperLineaException,
      );
    });
  });

  describe('Validación de DTO: CreateLineaDto exige superLineaId', () => {
    it('debe fallar la validación si superLineaId no está presente en CreateLineaDto', async () => {
      const dto = new CreateLineaDto();
      dto.denominacion = 'Línea de prueba';
      dto.usuarioCreatedId = 1;
      dto.utilizaStockMinimo = false;
      // superLineaId no definido

      const errors = await validate(dto);
      const superLineaError = errors.find((e) => e.property === 'superLineaId');
      expect(superLineaError).toBeDefined();
      expect(superLineaError?.constraints).toHaveProperty('isNotEmpty');
    });

    it('debe ser válido si superLineaId está presente y es entero', async () => {
      const dto = new CreateLineaDto();
      dto.denominacion = 'Línea de prueba';
      dto.usuarioCreatedId = 1;
      dto.utilizaStockMinimo = false;
      dto.superLineaId = 2;

      const errors = await validate(dto);
      const superLineaError = errors.find((e) => e.property === 'superLineaId');
      expect(superLineaError).toBeUndefined();
    });
  });
});
