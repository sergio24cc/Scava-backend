import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Filtro Global de Excepciones HTTP (HttpExceptionFilter)
 * Intercepta todas las excepciones lanzadas en la aplicación (UnauthorizedException, ConflictException,
 * ForbiddenException, NotFoundException, BadRequestException, etc.) y unifica la estructura de respuesta.
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse: any = exception.getResponse();

    // Normalizamos el mensaje de error (string simple o array de validaciones de class-validator)
    const message =
      typeof exceptionResponse === 'object' && exceptionResponse.message
        ? exceptionResponse.message
        : exception.message;

    const errorName =
      typeof exceptionResponse === 'object' && exceptionResponse.error
        ? exceptionResponse.error
        : exception.name;

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      error: errorName,
      message,
    };

    // Registro en log para trazabilidad en el servidor
    this.logger.warn(
      `[${request.method}] ${request.url} - Status ${status} - Error: ${JSON.stringify(message)}`,
    );

    response.status(status).json(errorResponse);
  }
}
