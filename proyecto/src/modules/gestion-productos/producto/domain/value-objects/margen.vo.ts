import { DatosProductoInvalidosException } from '../exceptions/datos-producto-invalidos.exception';

export class Margen {
  private readonly _valor: number;

  constructor(valor: number) {
    if (
      valor === undefined ||
      valor === null ||
      typeof valor !== 'number' ||
      isNaN(valor) ||
      valor < 0
    ) {
      throw new DatosProductoInvalidosException('El margen debe ser un valor numérico mayor o igual a 0.');
    }
    this._valor = valor;
  }

  get valor(): number {
    return this._valor;
  }

  getValue(): number {
    return this._valor;
  }

  equals(otro: Margen): boolean {
    if (!otro || !(otro instanceof Margen)) {
      return false;
    }
    return this._valor === otro._valor;
  }

  toString(): string {
    return this._valor.toString();
  }
}
