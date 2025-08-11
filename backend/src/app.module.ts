
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DocumentsModule } from './documents/documents.module';
import { FieldsModule } from './fields/fields.module';
import { SlideTemplatesModule } from './slide-templates/slide-templates.module';
import { UploadModule } from './upload/upload.module';
import { MediaModule } from './media/media.module';
import { AuthModule } from './auth/auth.module';
import { AuditModule } from './audit/audit.module';
import { UsersModule } from './users/users.module';
import { PermissionsModule } from './permissions/permissions.module';
import { DbTestController } from './db-test.controller';
import { databaseConfig } from './config/database.config';
import { HttpExceptionInterceptor } from './common/interceptors/http-exception.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: databaseConfig,
      inject: [ConfigService],
    }),
    DocumentsModule,
    FieldsModule,
    SlideTemplatesModule,
    UploadModule,
    MediaModule,
    AuthModule,
    AuditModule,
    UsersModule,
    PermissionsModule,
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
  ],
})
export class AppModule {}
