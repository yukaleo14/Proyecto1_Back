import { DomainExceptionFilter } from './domain-exception.filter';
import { DatosProductoInvalidosException } from '../../gestion-productos/producto/domain/exceptions/datos-producto-invalidos.exception';
import { ArgumentsHost, HttpStatus } from '@nestjs/common';

describe('DomainExceptionFilter', () => {
  let filter: DomainExceptionFilter;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;
  let mockGetResponse: jest.Mock;
  let mockGetRequest: jest.Mock;
  let mockArgumentsHost: ArgumentsHost;

  beforeEach(() => {
    filter = new DomainExceptionFilter();
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockGetResponse = jest.fn().mockReturnValue({ status: mockStatus });
    mockGetRequest = jest.fn().mockReturnValue({ url: '/api/producto', method: 'POST' });

    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: mockGetResponse,
        getRequest: mockGetRequest,
      }),
    } as unknown as ArgumentsHost;
  });

  it('debe capturar DatosProductoInvalidosException y responder con HTTP 400 Bad Request', () => {
    const exception = new DatosProductoInvalidosException('El costo debe ser mayor a 0.');

    filter.catch(exception, mockArgumentsHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        error: 'Bad Request',
        message: 'El costo debe ser mayor a 0.',
        path: '/api/producto',
      }),
    );
  });
});
