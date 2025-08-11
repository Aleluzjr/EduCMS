import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class HttpExceptionInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError(error => {
        if (error instanceof HttpException) {
          return throwError(() => error);
        }

        // Log seguro apenas em desenvolvimento
        if (process.env.NODE_ENV === 'development') {
          console.error('Erro não tratado:', {
            name: error.name,
            code: error.code,
            message: error.message,
            stack: error.stack
          });
        }

        // Tratar erros específicos do banco de dados
        if (error.code === 'ER_DUP_ENTRY') {
          const message = 'Entrada duplicada';
          return throwError(
            () => new ConflictException({
              statusCode: HttpStatus.CONFLICT,
              message: message,
              error: 'Conflict'
            })
          );
        }

        // Tratar outros erros de banco de dados
        if (error.code && error.code.startsWith('ER_')) {
          return throwError(
            () => new BadRequestException({
              statusCode: HttpStatus.BAD_REQUEST,
              message: `Erro de banco de dados: ${error.code}`,
              error: 'Bad Request',
              details: process.env.NODE_ENV === 'development' ? error.message : undefined
            }),
          );
        }

        // Erro genérico
        return throwError(
          () =>
            new HttpException(
              {
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Erro interno do servidor',
                error: 'Internal Server Error',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
              },
              HttpStatus.INTERNAL_SERVER_ERROR,
            ),
        );
      }),
    );
  }
} 