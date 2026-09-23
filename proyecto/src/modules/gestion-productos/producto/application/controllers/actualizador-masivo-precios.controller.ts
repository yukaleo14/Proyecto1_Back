import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ActualizadorMasivoPreciosService } from '../../domain/services/actualizador-masivo-precios.service';
import { AjusteMontoFijoDto, AjustePorcentualDto } from '../../dto/ajuste-precio.dto';

/**
 * Endpoints para la actualización masiva de precios.
 *
 * Cada operación expone dos rutas:
 *  - /preview  → Simula el ajuste y retorna los precios proyectados sin persistir.
 *  - /ejecutar → Aplica el ajuste en una transacción atómica. Retorna error 422
 *                si algún precio resultante sería ≤ 0.
 */
@ApiTags('Precios Masivos')
@Controller('productos/precios')
export class ActualizadorMasivoPreciosController {
  constructor(
    private readonly actualizadorService: ActualizadorMasivoPreciosService,
  ) {}

  // ──────────────────────────────────────────────────────────────────────────
  // AJUSTE PORCENTUAL GLOBAL
  // ──────────────────────────────────────────────────────────────────────────

  @Post('global/preview')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Simulación de ajuste porcentual global',
    description:
      'Calcula el efecto de un ajuste porcentual sobre todos los productos activos. ' +
      'No modifica la base de datos.',
  })
  @ApiBody({ type: AjustePorcentualDto })
  @ApiResponse({ status: 200, description: 'Lista de productos con precio actual y proyectado' })
  async previewGlobal(@Body() dto: AjustePorcentualDto) {
    return this.actualizadorService.simularAjustePorcentajeGlobal(dto.porcentaje);
  }

  @Post('global/ejecutar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Ejecutar ajuste porcentual global',
    description:
      'Aplica un ajuste porcentual a todos los productos activos en una transacción atómica. ' +
      'Si algún precio resultaría ≤ 0, la operación se cancela completamente.',
  })
  @ApiBody({ type: AjustePorcentualDto })
  @ApiResponse({ status: 200, description: 'Precios actualizados exitosamente' })
  @ApiResponse({ status: 422, description: 'Precio inválido detectado — operación cancelada' })
  async ejecutarGlobal(@Body() dto: AjustePorcentualDto) {
    const resultado = await this.actualizadorService.ejecutarAjustePorcentajeGlobal(
      dto.porcentaje,
      dto.usuarioId,
    );
    return {
      mensaje: `Ajuste porcentual global aplicado correctamente a ${resultado.length} producto(s).`,
      productosActualizados: resultado.length,
      detalle: resultado,
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // AJUSTE POR MONTO FIJO EN LÍNEA
  // ──────────────────────────────────────────────────────────────────────────

  @Post('linea/:lineaId/preview')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Simulación de ajuste por monto fijo en una Línea',
    description: 'Calcula el efecto de sumar/restar un monto fijo a los productos de una Línea.',
  })
  @ApiParam({ name: 'lineaId', description: 'ID de la Línea objetivo', type: Number })
  @ApiBody({ type: AjusteMontoFijoDto })
  @ApiResponse({ status: 200, description: 'Lista de productos con precio actual y proyectado' })
  async previewPorLinea(
    @Param('lineaId', ParseIntPipe) lineaId: number,
    @Body() dto: AjusteMontoFijoDto,
  ) {
    return this.actualizadorService.simularAjusteMontoFijoPorLinea(lineaId, dto.monto);
  }

  @Post('linea/:lineaId/ejecutar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Ejecutar ajuste por monto fijo en una Línea',
    description:
      'Aplica un ajuste de monto fijo a todos los productos de la Línea indicada. ' +
      'Transacción atómica: aborta si algún precio resultaría ≤ 0.',
  })
  @ApiParam({ name: 'lineaId', description: 'ID de la Línea objetivo', type: Number })
  @ApiBody({ type: AjusteMontoFijoDto })
  @ApiResponse({ status: 200, description: 'Precios actualizados exitosamente' })
  @ApiResponse({ status: 422, description: 'Precio inválido detectado — operación cancelada' })
  async ejecutarPorLinea(
    @Param('lineaId', ParseIntPipe) lineaId: number,
    @Body() dto: AjusteMontoFijoDto,
  ) {
    const resultado = await this.actualizadorService.ejecutarAjusteMontoFijoPorLinea(
      lineaId,
      dto.monto,
      dto.usuarioId,
    );
    return {
      mensaje: `Ajuste de monto fijo aplicado a ${resultado.length} producto(s) de la línea ${lineaId}.`,
      productosActualizados: resultado.length,
      detalle: resultado,
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // AJUSTE PORCENTUAL POR SUPER LÍNEA
  // ──────────────────────────────────────────────────────────────────────────

  @Post('super-linea/:superLineaId/preview')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Simulación de ajuste porcentual por SuperLínea',
    description:
      'Calcula el efecto de un ajuste porcentual sobre todos los productos ' +
      'cuya Línea pertenece a la SuperLínea indicada.',
  })
  @ApiParam({ name: 'superLineaId', description: 'ID de la SuperLínea objetivo', type: Number })
  @ApiBody({ type: AjustePorcentualDto })
  @ApiResponse({ status: 200, description: 'Lista de productos con precio actual y proyectado' })
  async previewPorSuperLinea(
    @Param('superLineaId', ParseIntPipe) superLineaId: number,
    @Body() dto: AjustePorcentualDto,
  ) {
    return this.actualizadorService.simularAjustePorcentajePorSuperLinea(
      superLineaId,
      dto.porcentaje,
    );
  }

  @Post('super-linea/:superLineaId/ejecutar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Ejecutar ajuste porcentual por SuperLínea',
    description:
      'Aplica un ajuste porcentual a todos los productos cuya Línea pertenece ' +
      'a la SuperLínea indicada. Transacción atómica: aborta si algún precio resultaría ≤ 0.',
  })
  @ApiParam({ name: 'superLineaId', description: 'ID de la SuperLínea objetivo', type: Number })
  @ApiBody({ type: AjustePorcentualDto })
  @ApiResponse({ status: 200, description: 'Precios actualizados exitosamente' })
  @ApiResponse({ status: 422, description: 'Precio inválido detectado — operación cancelada' })
  async ejecutarPorSuperLinea(
    @Param('superLineaId', ParseIntPipe) superLineaId: number,
    @Body() dto: AjustePorcentualDto,
  ) {
    const resultado = await this.actualizadorService.ejecutarAjustePorcentajePorSuperLinea(
      superLineaId,
      dto.porcentaje,
      dto.usuarioId,
    );
    return {
      mensaje: `Ajuste porcentual aplicado a ${resultado.length} producto(s) de la super-línea ${superLineaId}.`,
      productosActualizados: resultado.length,
      detalle: resultado,
    };
  }
}
