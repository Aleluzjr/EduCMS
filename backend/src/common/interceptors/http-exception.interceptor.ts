import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
  ConflictException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class HttpExceptionInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError(error => {
        // Se já é uma HttpException, retorna como está
        if (error instanceof HttpException) {
          return throwError(() => error);
        }

        // Log do erro para debugging
        console.error('Erro não tratado:', error);

        // Tratar erros específicos do banco de dados
        if (error.code === 'ER_DUP_ENTRY') {
          const message = error.sqlMessage || 'Entrada duplicada';
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
            () => new HttpException(
              {
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'Erro de banco de dados',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Database Error',
              },
              HttpStatus.BAD_REQUEST,
            ),
          );
        }

        // Erro genérico
        return throwError(
          () =>
            new HttpException(
              {
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Erro interno do servidor',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined,
              },
              HttpStatus.INTERNAL_SERVER_ERROR,
            ),
        );
      }),
    );
  }
} 