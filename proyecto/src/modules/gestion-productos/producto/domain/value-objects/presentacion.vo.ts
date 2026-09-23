import { DatosProductoInvalidosException } from '../exceptions/datos-producto-invalidos.exception';
import { UnidadPresentacion } from '../enums/unidad-presentacion.enum';

/**
 * Value Object: Presentacion
 *
 * Encapsula el formato comercial de un producto (ej. "1.5 L", "pack x 6", "354 ml").
 * Inmutable y definido únicamente por sus atributos (valor + unidad).
 *
 * Invariantes del dominio:
 *  - El valor debe ser un número estrictamente mayor a cero.
 *  - La unidad debe ser un string no vacío de la lista aceptada (UnidadPresentacion).
 *
 * Ejemplo de uso:
 *   new Presentacion(1.5, UnidadPresentacion.LITRO)   →  "1.5 L"
 *   new Presentacion(354, UnidadPresentacion.MILILITRO) →  "354 ml"
 *   new Presentacion(0, 'ml')   → lanza DatosProductoInvalidosException
 */
export class Presentacion {
  private readonly _valor: number;
  private readonly _unidad: string;

  /**
   * @param valor  Cantidad numérica (decimal o entero) estrictamente mayor a 0.
   * @param unidad Unidad de medida. Acepta valores del enum UnidadPresentacion
   *               o cualquier string corto no vacío para compatibilidad futura.
   */
  constructor(valor: number, unidad: string) {
    // Validar valor
    if (
      valor === undefined ||
      valor === null ||
      typeof valor !== 'number' ||
      isNaN(valor) ||
      valor <= 0
    ) {
      throw new DatosProductoInvalidosException(
        'El valor de la presentación debe ser un número estrictamente mayor a 0.',
      );
    }

    // Validar unidad
    if (
      unidad === undefined ||
      unidad === null ||
      typeof unidad !== 'string' ||
      unidad.trim().length === 0
    ) {
      throw new DatosProductoInvalidosException(
        'La unidad de la presentación es obligatoria y no puede estar vacía.',
      );
    }

    this._valor = valor;
    this._unidad = unidad.trim();
  }

  /**
   * Crea una Presentacion a partir del valor almacenado en base de datos
   * (convierte string a número).
   */
  static fromPersistence(valor: string | number, unidad: string): Presentacion {
    const valorNumerico = typeof valor === 'string' ? parseFloat(valor) : valor;
    return new Presentacion(valorNumerico, unidad);
  }

  // ========== GETTERS ==========
  get valor(): number {
    return this._valor;
  }

  get unidad(): string {
    return this._unidad;
  }

  getValue(): number {
    return this._valor;
  }

  getUnidad(): string {
    return this._unidad;
  }

  // ========== COMPORTAMIENTO ==========
  /**
   * Retorna la descripción legible del formato de presentación.
   * Ej: "1.5 L", "354 ml", "6 pack"
   */
  descripcion(): string {
    return `${this._valor} ${this._unidad}`;
  }

  /**
   * Dos presentaciones son iguales si tienen el mismo valor y la misma unidad.
   */
  equals(otra: Presentacion): boolean {
    if (!otra || !(otra instanceof Presentacion)) {
      return false;
    }
    return this._valor === otra._valor && this._unidad === otra._unidad;
  }

  toString(): string {
    return this.descripcion();
  }
}
