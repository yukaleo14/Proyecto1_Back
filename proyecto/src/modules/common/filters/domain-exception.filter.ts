import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { DatosProductoInvalidosException } from '../../gestion-productos/producto/domain/exceptions/datos-producto-invalidos.exception';

@Catch(DatosProductoInvalidosException)
export class DomainExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DomainExceptionFilter.name);

  catch(exception: DatosProductoInvalidosException, host: ArgumentsHost) {
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
