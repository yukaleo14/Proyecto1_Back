import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { DatosProductoInvalidosException } from '../../gestion-productos/producto/domain/exceptions/datos-producto-invalidos.exception';
import { SuperLineaConLineasAsociadasException } from '../../gestion-productos/super-linea/domain/exceptions/super-linea-con-lineas-asociadas.exception';
import { DatosSuperLineaInvalidosException } from '../../gestion-productos/super-linea/domain/exceptions/datos-super-linea-invalidos.exception';
import { LineaSinSuperLineaException } from '../../gestion-productos/linea/domain/exceptions/linea-sin-super-linea.exception';

@Catch(
  DatosProductoInvalidosException,
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

    const status = HttpStatus.BAD_REQUEST;

    this.logger.warn(
      `[DomainExceptionFilter] Excepción de dominio capturada: "${exception.message}" en ${request?.method} ${request?.url}`,
    );

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request?.url,
      error: 'Bad Request',
      message: exception.message,
    });
  }
}
