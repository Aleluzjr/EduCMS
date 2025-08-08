import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
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

        // Log do erro para debugging
        console.error('Erro não tratado:', error);

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