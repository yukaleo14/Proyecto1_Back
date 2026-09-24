export class PrecioModificadoEvent {
  constructor(
    public readonly productoId: number,
    public readonly precioNuevo: number,
    public readonly precioAnterior: number | null,
    public readonly tipoOperacion: string,
    public readonly motivo: string,
    public readonly usuarioId?: number,
  ) {}
}
