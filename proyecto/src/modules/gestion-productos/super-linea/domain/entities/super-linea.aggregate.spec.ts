import { SuperLinea } from './super-linea.entity';
import { SuperLineaConLineasAsociadasException } from '../exceptions/super-linea-con-lineas-asociadas.exception';
import { DatosSuperLineaInvalidosException } from '../exceptions/datos-super-linea-invalidos.exception';
import { PoliticaEliminacionSuperLinea } from '../services/politica-eliminacion-super-linea.service';
import { ILineaRepository } from '../../../linea/domain/interfaces/linea.repository.interface';

describe('Aggregate SuperLinea: Invariantes y Reglas de Dominio', () => {
  describe('Instanciación válida', () => {
    it('debe crear una SuperLínea con nombre y descripción válidos', () => {
      const superLinea = new SuperLinea('Bebidas', 'Categoría general de bebidas');
      expect(superLinea.nombre).toBe('Bebidas');
      expect(superLinea.descripcion).toBe('Categoría general de bebidas');
      expect(superLinea.sistema).toBe(0);
    });

    it('debe permitir instanciación mediante objeto de propiedades', () => {
      const superLinea = new SuperLinea({
        nombre: 'Limpieza',
        descripcion: 'Artículos de higiene y desinfección',
        sistema: 1,
      });
      expect(superLinea.nombre).toBe('Limpieza');
      expect(superLinea.descripcion).toBe('Artículos de higiene y desinfección');
      expect(superLinea.sistema).toBe(1);
    });

    it('debe limpiar espacios en blanco alrededor del nombre', () => {
      const superLinea = new SuperLinea('   Golosinas   ');
      expect(superLinea.nombre).toBe('Golosinas');
    });

    it('debe permitir instanciación sin argumentos para hidratación de TypeORM', () => {
      const superLinea = new SuperLinea();
      expect(superLinea).toBeDefined();
    });
  });

  describe('Invariantes de creación y modificación', () => {
    it('debe arrojar DatosSuperLineaInvalidosException si el nombre es vacío', () => {
      expect(() => new SuperLinea('')).toThrow(DatosSuperLineaInvalidosException);
      expect(() => new SuperLinea('')).toThrow(
        'El nombre de la SuperLínea es obligatorio y no puede estar vacío.',
      );
    });

    it('debe arrojar DatosSuperLineaInvalidosException si el nombre es solo espacios en blanco', () => {
      expect(() => new SuperLinea('    ')).toThrow(DatosSuperLineaInvalidosException);
    });

    it('debe arrojar DatosSuperLineaInvalidosException si el nombre es null o undefined', () => {
      expect(() => new SuperLinea(null as any)).toThrow(DatosSuperLineaInvalidosException);
      expect(() => new SuperLinea(undefined as any)).toThrow(DatosSuperLineaInvalidosException);
    });

    it('actualizarNombre() debe rechazar nombres inválidos', () => {
      const superLinea = new SuperLinea('Almacén');
      expect(() => superLinea.actualizarNombre('')).toThrow(DatosSuperLineaInvalidosException);
      expect(() => superLinea.actualizarNombre('   ')).toThrow(DatosSuperLineaInvalidosException);
    });

    it('actualizarNombre() debe actualizar correctamente si es válido', () => {
      const superLinea = new SuperLinea('Almacén');
      superLinea.actualizarNombre('Comestibles');
      expect(superLinea.nombre).toBe('Comestibles');
    });
  });

  describe('Criterio de Aceptación: Regla restrictiva de eliminación', () => {
    it('validarPuedeEliminarse() debe permitir la eliminación si la cantidad de líneas asociadas es 0', () => {
      const superLinea = new SuperLinea('Lácteos');
      expect(() => superLinea.validarPuedeEliminarse(0)).not.toThrow();
    });

    it('validarPuedeEliminarse() debe arrojar SuperLineaConLineasAsociadasException si existen líneas asociadas (X = 3)', () => {
      const superLinea = new SuperLinea('Lácteos');
      expect(() => superLinea.validarPuedeEliminarse(3)).toThrow(
        SuperLineaConLineasAsociadasException,
      );
      expect(() => superLinea.validarPuedeEliminarse(3)).toThrow(
        'No se puede eliminar: existen 3 líneas asociadas a esta SuperLínea.',
      );
    });

    it('validarPuedeEliminarse() debe reflejar la cantidad exacta de líneas en el mensaje (X = 1)', () => {
      const superLinea = new SuperLinea('Bebidas');
      expect(() => superLinea.validarPuedeEliminarse(1)).toThrow(
        'No se puede eliminar: existen 1 líneas asociadas a esta SuperLínea.',
      );
    });

    it('validarPuedeEliminarse() debe reflejar la cantidad exacta de líneas en el mensaje (X = 5)', () => {
      const superLinea = new SuperLinea('Bebidas');
      expect(() => superLinea.validarPuedeEliminarse(5)).toThrow(
        'No se puede eliminar: existen 5 líneas asociadas a esta SuperLínea.',
      );
    });
  });

  describe('Servicio de Dominio: PoliticaEliminacionSuperLinea', () => {
    let mockLineaRepository: jest.Mocked<ILineaRepository>;
    let politica: PoliticaEliminacionSuperLinea;

    beforeEach(() => {
      mockLineaRepository = {
        countBySuperLineaId: jest.fn(),
      } as unknown as jest.Mocked<ILineaRepository>;

      politica = new PoliticaEliminacionSuperLinea(mockLineaRepository);
    });

    it('debe arrojar SuperLineaConLineasAsociadasException si el repositorio reporta líneas asociadas', async () => {
      const superLinea = new SuperLinea('Bebidas');
      superLinea.id = 10;
      mockLineaRepository.countBySuperLineaId.mockResolvedValue(4);

      await expect(politica.validarEliminacion(superLinea)).rejects.toThrow(
        SuperLineaConLineasAsociadasException,
      );
      await expect(politica.validarEliminacion(superLinea)).rejects.toThrow(
        'No se puede eliminar: existen 4 líneas asociadas a esta SuperLínea.',
      );
      expect(mockLineaRepository.countBySuperLineaId).toHaveBeenCalledWith(10);
    });

    it('debe permitir la eliminación si no hay líneas asociadas', async () => {
      const superLinea = new SuperLinea('Bebidas');
      superLinea.id = 10;
      mockLineaRepository.countBySuperLineaId.mockResolvedValue(0);

      await expect(politica.validarEliminacion(superLinea)).resolves.toBeUndefined();
      expect(mockLineaRepository.countBySuperLineaId).toHaveBeenCalledWith(10);
    });
  });
});
