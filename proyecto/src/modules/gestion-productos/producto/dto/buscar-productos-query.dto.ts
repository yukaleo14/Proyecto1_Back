import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

enum OrdenDireccion {
  ASC = 'ASC',
  DESC = 'DESC',
}

enum OrdenCampo {
  denominacion = 'denominacion',
  precio = 'precio',
  stock = 'stock',
  costo = 'costo',
}

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
    description: 'Filtrar por ID exacto de la Marca.',
    example: 3,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  marcaId?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por ID exacto de la Línea.',
    example: 5,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  lineaId?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por ID exacto de la SuperLínea.',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  superLineaId?: number;

  @ApiPropertyOptional({
    description: 'Si es true, retorna solo los productos cuyo stock es menor o igual al stock mínimo configurado.',
    example: true,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  conAlertaStock?: boolean;

  @ApiPropertyOptional({
    description: 'Campo por el cual ordenar los resultados.',
    enum: OrdenCampo,
    default: 'denominacion',
  })
  @IsOptional()
  @IsEnum(OrdenCampo)
  orderBy?: OrdenCampo = OrdenCampo.denominacion;

  @ApiPropertyOptional({
    description: 'Dirección del ordenamiento.',
    enum: OrdenDireccion,
    default: 'ASC',
  })
  @IsOptional()
  @IsEnum(OrdenDireccion)
  order?: OrdenDireccion = OrdenDireccion.ASC;

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
