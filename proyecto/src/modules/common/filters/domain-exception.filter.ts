import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { DatosProductoInvalidosException } from '../../gestion-productos/producto/domain/exceptions/datos-producto-invalidos.exception';
import { OperacionInvalidaException } from '../../gestion-productos/producto/domain/exceptions/operacion-invalida.exception';
import { SuperLineaConLineasAsociadasException } from '../../gestion-productos/super-linea/domain/exceptions/super-linea-con-lineas-asociadas.exception';
import { DatosSuperLineaInvalidosException } from '../../gestion-productos/super-linea/domain/exceptions/datos-super-linea-invalidos.exception';
import { LineaSinSuperLineaException } from '../../gestion-productos/linea/domain/exceptions/linea-sin-super-linea.exception';

@Catch(
  DatosProductoInvalidosException,
  OperacionInvalidaException,
  SuperLineaConLineasAsociadasException,
  DatosSuperLineaInvalidosException,
  LineaSinSuperLineaException,
)
export class DomainExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DomainExceptionFilter.name);

  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // OperacionInvalidaException usa 422 Unprocessable Entity
    const status =
      exception instanceof OperacionInvalidaException
        ? HttpStatus.UNPROCESSABLE_ENTITY
        : HttpStatus.BAD_REQUEST;

    this.logger.warn(
      `[DomainExceptionFilter] Excepción de dominio capturada: "${exception.message}" en ${request?.method} ${request?.url}`,
    );

    const payload: Record<string, unknown> = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request?.url,
      error: status === HttpStatus.UNPROCESSABLE_ENTITY ? 'Unprocessable Entity' : 'Bad Request',
      message: exception.message,
    };

    // Si es OperacionInvalidaException, incluir detalle de productos con error
    if (exception instanceof OperacionInvalidaException && exception.productosConError.length > 0) {
      payload['productosConError'] = exception.productosConError;
    }

    response.status(status).json(payload);
  }
}
