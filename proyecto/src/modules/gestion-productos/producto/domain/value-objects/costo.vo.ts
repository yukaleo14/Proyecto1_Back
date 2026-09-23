import { DatosProductoInvalidosException } from '../exceptions/datos-producto-invalidos.exception';

export class Costo {
  private readonly _valor: number;

  constructor(valor: number) {
    if (valor === undefined || valor === null || typeof valor !== 'number' || isNaN(valor) || valor <= 0) {
      throw new DatosProductoInvalidosException('El costo debe ser un valor numérico mayor a 0.');
    }
    this._valor = valor;
  }

  get valor(): number {
    return this._valor;
  }

  getValue(): number {
    return this._valor;
  }

  equals(otro: Costo): boolean {
    if (!otro || !(otro instanceof Costo)) {
      return false;
    }
    return this._valor === otro._valor;
  }

  toString(): string {
    return this._valor.toString();
  }
}
