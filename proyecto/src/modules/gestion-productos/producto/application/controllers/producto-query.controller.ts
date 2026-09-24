import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/modules/gestion-usuario/auth/auth.guard';
import { Roles } from 'src/modules/gestion-usuario/auth/roles.decorator';
import { ProductoQueryService } from '../services/producto-query.service';
import { BuscarProductosQueryDto } from '../../dto/buscar-productos-query.dto';
import { BuscarProductosResponseDto } from '../../dto/producto-read-model.dto';

/**
 * Controlador de Consultas (CQRS Read Model) para Productos.
 *
 * Expone endpoints de lectura optimizados desacoplados de los endpoints
 * de mutación del agregado de escritura.
 */
@ApiTags('Gestion Productos - Consultas')
@Controller(['productos', 'producto'])
@UseGuards(AuthGuard)
export class ProductoQueryController {
  constructor(private readonly queryService: ProductoQueryService) {}

  /**
   * Búsqueda dinámica y paginada de productos con filtros combinados y ordenamiento.
   */
  @Get('buscar')
  @Roles('Root', 'Administrador', 'Empleado', 'Repartidor', 'Repositor')
  @ApiOperation({
    summary: 'Búsqueda dinámica y combinada de productos (CQRS Read Model)',
    description:
      'Permite filtrar productos por denominación, nombre/ID de línea, nombre/ID de superlínea, marca, ' +
      'alerta de stock, con ordenamiento configurable y paginación. ' +
      'Incluye margen calculado, alerta de stock bajo, y datos del último cambio de precio.',
  })
  @ApiOkResponse({
    description: 'Listado paginado de productos en modelo de lectura optimizado y enriquecido.',
    type: BuscarProductosResponseDto,
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  buscar(
    @Query() query: BuscarProductosQueryDto,
  ): Promise<BuscarProductosResponseDto> {
    return this.queryService.buscar(query);
  }

  /**
   * Historial completo de cambios de precio de un producto específico.
   */
  @Get(':id/historial-precios')
  @Roles('Root', 'Administrador', 'Empleado')
  @ApiOperation({
    summary: 'Historial de precios de un producto',
    description:
      'Retorna todos los registros de cambio de precio del producto ordenados por fecha descendente. ' +
      'Incluye precio anterior, precio nuevo, tipo de operación, motivo y usuario responsable.',
  })
  @ApiParam({ name: 'id', description: 'ID del producto', type: Number })
  @ApiOkResponse({ description: 'Array de registros del historial de precios' })
  obtenerHistorialPrecios(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.queryService.obtenerHistorialPrecios(id);
  }
}
