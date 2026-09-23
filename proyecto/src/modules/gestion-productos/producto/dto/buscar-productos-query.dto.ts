import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

/**
 * DTO de Consulta para búsqueda dinámica y combinada de productos (CQRS Read Model).
 * Soporta filtros insensibles a mayúsculas/minúsculas combinados con lógica AND.
 */
export class BuscarProductosQueryDto {
  @ApiPropertyOptional({
    description: 'Filtro parcial por denominación de producto (búsqueda insensible a mayúsculas).',
    example: 'coca',
  })
  @IsOptional()
  @IsString()
  denominacion?: string;

  @ApiPropertyOptional({
    description: 'Filtro parcial por nombre de la Línea asociada.',
    example: 'gaseosas',
  })
  @IsOptional()
  @IsString()
  lineaNombre?: string;

  @ApiPropertyOptional({
    description: 'Filtro parcial por nombre de la SuperLínea asociada.',
    example: 'bebidas',
  })
  @IsOptional()
  @IsString()
  superLineaNombre?: string;

  @ApiPropertyOptional({
    description: 'Alias corto para el filtro por nombre de la SuperLínea.',
    example: 'beb',
  })
  @IsOptional()
  @IsString()
  superlinea?: string;

  @ApiPropertyOptional({
    description: 'Cantidad de registros a omitir para paginación.',
    default: 0,
    example: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  skip?: number = 0;

  @ApiPropertyOptional({
    description: 'Cantidad de registros a obtener por página.',
    default: 50,
    example: 50,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  take?: number = 50;
}
