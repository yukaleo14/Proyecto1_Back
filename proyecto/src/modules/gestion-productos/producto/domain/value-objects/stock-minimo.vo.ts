import { DatosProductoInvalidosException } from '../exceptions/datos-producto-invalidos.exception';

export class StockMinimo {
  private readonly _valor: number;

  constructor(valor: number) {
    if (
      valor === undefined ||
      valor === null ||
      typeof valor !== 'number' ||
      isNaN(valor) ||
      !Number.isInteger(valor) ||
      valor < 0
    ) {
      throw new DatosProductoInvalidosException('El stock mínimo debe ser un número entero mayor o igual a 0.');
    }
    this._valor = valor;
  }

  get valor(): number {
    return this._valor;
  }

  getValue(): number {
    return this._valor;
  }

  equals(otro: StockMinimo): boolean {
    if (!otro || !(otro instanceof StockMinimo)) {
      return false;
    }
    return this._valor === otro._valor;
  }

  toString(): string {
    return this._valor.toString();
  }
}
