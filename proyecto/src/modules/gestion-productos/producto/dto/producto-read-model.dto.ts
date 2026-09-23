import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Read Model DTO: Modelo de lectura optimizado y plano (CQRS).
 * Desacoplado del agregado de escritura Producto para rendimiento de consultas.
 */
export class ProductoReadModelDto {
  @ApiProperty({ example: 123, description: 'ID del producto' })
  id: number;

  @ApiProperty({ example: 'Coca-Cola 2L', description: 'Denominación del producto' })
  denominacion: string;

  @ApiPropertyOptional({ example: 'PROV-001', description: 'Código asignado por el proveedor' })
  codigoProveedor?: string | null;

  @ApiPropertyOptional({ example: '7791234567890', description: 'Código de barra del producto' })
  codigoBarra?: string | null;

  @ApiProperty({ example: 1000.5, description: 'Costo del producto' })
  costo: number;

  @ApiProperty({ example: 1500.75, description: 'Precio de venta al público' })
  precio: number;

  @ApiProperty({ example: 25.0, description: 'Cantidad en stock' })
  stock: number;

  @ApiProperty({ example: 5, description: 'Stock mínimo configurado' })
  stockMinimo: number;

  @ApiProperty({ example: 2, description: 'ID de la Línea' })
  lineaId: number;

  @ApiProperty({ example: 'Gaseosas', description: 'Denominación de la Línea' })
  lineaNombre: string;

  @ApiProperty({ example: 1, description: 'ID de la SuperLínea' })
  superLineaId: number;

  @ApiProperty({ example: 'Bebidas', description: 'Nombre de la SuperLínea' })
  superLineaNombre: string;

  @ApiPropertyOptional({ example: 3, description: 'ID de la Marca' })
  marcaId?: number | null;

  @ApiPropertyOptional({ example: 'Coca-Cola', description: 'Nombre de la Marca' })
  marcaNombre?: string | null;

  @ApiPropertyOptional({ example: 2, description: 'Valor numérico de la presentación' })
  presentacionValor?: number | null;

  @ApiPropertyOptional({ example: 'L', description: 'Unidad de la presentación' })
  presentacionUnidad?: string | null;

  @ApiPropertyOptional({ example: '2 L', description: 'Formato legible de la presentación' })
  presentacionDescripcion?: string | null;
}

export class BuscarProductosResponseDto {
  @ApiProperty({ type: [ProductoReadModelDto] })
  data: ProductoReadModelDto[];

  @ApiProperty({ example: 1, description: 'Total de productos que coinciden con los filtros' })
  total: number;
}
