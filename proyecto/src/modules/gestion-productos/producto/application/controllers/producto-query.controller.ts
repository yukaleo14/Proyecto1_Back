import {
  Controller,
  Get,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/modules/gestion-usuario/auth/auth.guard';
import { Roles } from 'src/modules/gestion-usuario/auth/roles.decorator';
import { ProductoQueryService } from '../services/producto-query.service';
import { BuscarProductosQueryDto } from '../../dto/buscar-productos-query.dto';
import { BuscarProductosResponseDto } from '../../dto/producto-read-model.dto';

/**
 * Controlador de Consultas (CQRS Read Model) para Productos.
 *
 * Expone el endpoint optimizado GET /api/productos/buscar desacoplado
 * de los endpoints de mutación del agregado de escritura.
 */
@ApiTags('Gestion Productos - Consultas')
@Controller(['productos', 'producto'])
@UseGuards(AuthGuard)
export class ProductoQueryController {
  constructor(private readonly queryService: ProductoQueryService) {}

  @Get('buscar')
  @Roles('Root', 'Administrador', 'Empleado', 'Repartidor', 'Repositor')
  @ApiOperation({
    summary: 'Búsqueda dinámica y combinada de productos (CQRS Read Model)',
    description:
      'Permite filtrar productos por denominación, nombre de línea y nombre de superlínea con búsqueda insensible a mayúsculas/minúsculas y combinación lógica AND.',
  })
  @ApiOkResponse({
    description: 'Listado paginado de productos en modelo de lectura optimizado.',
    type: BuscarProductosResponseDto,
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  buscar(
    @Query() query: BuscarProductosQueryDto,
  ): Promise<BuscarProductosResponseDto> {
    return this.queryService.buscar(query);
  }
}
