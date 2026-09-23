import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class SuperLineaDto {
  @ApiProperty({ example: 1, description: 'Identificador único de la SuperLínea.' })
  @Type(() => Number)
  @IsInt()
  id: number;

  @ApiProperty({ example: 'Bebidas', description: 'Nombre de la SuperLínea.' })
  @IsString()
  nombre: string;

  @ApiPropertyOptional({
    example: 'Categoría de bebidas y líquidos.',
    description: 'Descripción detallada de la SuperLínea.',
  })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiProperty({ example: 0, description: 'Indica si es una entidad protegida del sistema.' })
  @Type(() => Number)
  @IsInt()
  sistema: number;

  @ApiPropertyOptional({ example: null, description: 'Fecha de baja lógica.' })
  @IsOptional()
  deletedAt?: Date | null;
}
