import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

/**
 * DTO para la solicitud de Ajuste Manual de Stock (5.3).
 * Requiere indicar obligatoriamente una cantidad (+/-) y el motivo (rotura, pérdida, error de carga, etc.).
 */
export class AjusteStockDto {
  @ApiProperty({
    description:
      'Cantidad a modificar sobre el stock actual. Positivo para aumento, negativo para disminución.',
    example: -2,
  })
  @IsNumber({}, { message: 'La cantidad debe ser un número válido.' })
  cantidad: number;

  @ApiProperty({
    description:
      'Motivo obligatorio del ajuste (ej: rotura, pérdida, error de carga, inventario físico).',
    example: 'rotura',
  })
  @IsString({ message: 'El motivo debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El motivo del ajuste es obligatorio.' })
  motivo: string;
}
