import { ApiProperty } from '@nestjs/swagger';
import { TipoMovimientoStock } from '../domain/enums/tipo-movimiento-stock.enum';

export class MovimientoStockResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 10 })
  productoId: number;

  @ApiProperty({ enum: TipoMovimientoStock, example: TipoMovimientoStock.AJUSTE })
  tipoMovimiento: TipoMovimientoStock;

  @ApiProperty({ example: -2 })
  cantidad: number;

  @ApiProperty({ example: 'rotura', nullable: true })
  motivo?: string | null;

  @ApiProperty({ example: '2026-09-24T12:00:00.000Z' })
  fecha: Date;
}

export class AjusteStockResponseDto {
  @ApiProperty({ example: 8, description: 'Stock resultante tras el ajuste' })
  nuevoStock: number;

  @ApiProperty({ example: 10, description: 'Stock que tenía el producto antes del ajuste' })
  stockAnterior: number;

  @ApiProperty({ example: false, description: 'Indica si el producto quedó en estado de alerta de stock bajo' })
  alertaStockBajo: boolean;

  @ApiProperty({ type: MovimientoStockResponseDto })
  movimiento: MovimientoStockResponseDto;
}
