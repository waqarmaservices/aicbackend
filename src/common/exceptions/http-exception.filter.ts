import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { FileLogger } from '../logger/file-logger';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new FileLogger(HttpExceptionFilter.name);
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus() || HttpStatus.INTERNAL_SERVER_ERROR;
    const isDevelopment = process.env.NODE_ENV === 'development';

    // Log the error details
    this.logger.error(
      `HTTP ${status} Error: ${exception.message}`,
      exception.stack,
      `${request.method} ${request.originalUrl}`,
    );

    // Create the response body
    const errorResponse = {
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: exception.message || 'Something went wrong. Please try again',
      ...(isDevelopment && {
        stack: exception.stack,
      }),
    };

    // Send the response
    response.status(status).json(errorResponse);
  }
}
