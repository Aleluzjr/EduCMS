
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DocumentsModule } from './documents/documents.module';
import { FieldsModule } from './fields/fields.module';
import { SlideTemplatesModule } from './slide-templates/slide-templates.module';
import { UploadModule } from './upload/upload.module';
import { MediaModule } from './media/media.module';
import { DbTestController } from './db-test.controller';
import { databaseConfig } from './config/database.config';
import { HttpExceptionInterceptor } from './common/interceptors/http-exception.interceptor';
import { ValidationPipe } from './common/pipes/validation.pipe';

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig),
    DocumentsModule,
    FieldsModule,
    SlideTemplatesModule,
    UploadModule,
    MediaModule,
  ],
  controllers: [
    AppController,
    DbTestController,
  ],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpExceptionInterceptor,
    },
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class AppModule {}
