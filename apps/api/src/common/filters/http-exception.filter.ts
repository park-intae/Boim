import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiResponse } from '@boim/shared-types';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = 'Internal Server Error';
    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null && 'message' in res) {
        const rawMsg = (res as { message?: unknown }).message;
        if (Array.isArray(rawMsg)) {
          message = rawMsg.map((m) => String(m)).join(', ');
        } else if (typeof rawMsg === 'string') {
          message = rawMsg;
        } else {
          message = exception.message;
        }
      } else {
        message = exception.message;
      }
    }

    if (process.env.NODE_ENV === 'production') {
      console.error(
        `[HttpExceptionFilter] Status ${status} - Error: ${message}`,
      );
    } else {
      console.error(
        `[HttpExceptionFilter] Status ${status} - Error: ${message}`,
        exception,
      );
    }

    const errorResponse: ApiResponse = {
      success: false,
      error: {
        code: status.toString(),
        message: message,
      },
    };

    response.status(status).json(errorResponse);
  }
}
