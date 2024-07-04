import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';
import { Logger } from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  logger = new Logger();
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    this.logger.error(`Method: ${request.method} | originalUrl: ${request.originalUrl} | error: ${exception}`);
    response.status(status).json({
      error: true,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      exception:
        process.env.NODE_ENV === 'development'
          ? {
              message: exception.message,
              name: exception.name,
              stack: exception.stack,
            }
          : exception.message,
    });
  }
}
