/**
 * Resultado de la simulación/preview para un producto individual.
 * Permite al llamador conocer el impacto del ajuste antes de persistir.
 */
export interface ResultadoSimulacionDto {
  productoId: number;
  denominacion: string;
  lineaId: number | undefined;
  superLineaId: number | undefined;
  precioActual: number;
  precioProyectado: number;
}
