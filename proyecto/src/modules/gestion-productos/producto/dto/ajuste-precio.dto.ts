import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsPositive, Min } from 'class-validator';

/** DTO para ajuste porcentual (global o por SuperLínea) */
export class AjustePorcentualDto {
  @ApiProperty({
    description:
      'Porcentaje de ajuste. Valores positivos aumentan el precio, negativos lo reducen. ' +
      'Ej: 10 → +10%, -5 → -5%.',
    example: 10,
  })
  @IsNumber()
  porcentaje: number;

  @ApiProperty({ description: 'ID del usuario que realiza la operación', example: 1 })
  @IsInt()
  @IsPositive()
  usuarioId: number;
}

/** DTO para ajuste por monto fijo en una Línea */
export class AjusteMontoFijoDto {
  @ApiProperty({
    description:
      'Monto fijo a sumar al precio actual. Puede ser negativo para reducir. ' +
      'Ej: 100 → +$100, -50 → -$50.',
    example: 100,
  })
  @IsNumber()
  monto: number;

  @ApiProperty({ description: 'ID del usuario que realiza la operación', example: 1 })
  @IsInt()
  @IsPositive()
  usuarioId: number;
}
