
import { Module } from '@nestjs/common';
// ...existing code...

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Document } from './entities/document.entity';
import { Field } from './entities/field.entity';
import { SlideTemplate } from './entities/slide-template.entity';
import { DocumentsController } from './documents/documents.controller';
import { DocumentsService } from './documents/documents.service';
import { FieldsController } from './fields/fields.controller';
import { FieldsService } from './fields/fields.service';
import { SlideTemplatesController } from './slide-templates/slide-templates.controller';
import { SlideTemplatesService } from './slide-templates/slide-templates.service';
import { DbTestController } from './db-test.controller';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASS || '2539',
      database: process.env.DB_NAME || 'cms',
      autoLoadEntities: true,
      synchronize: false, // Desabilitado para segurança em produção
    }),
    TypeOrmModule.forFeature([Document, Field, SlideTemplate]),
    UploadModule,
  ],
  controllers: [
    AppController,
    DocumentsController,
    FieldsController,
    SlideTemplatesController,
    DbTestController,
  ],
  providers: [
    AppService,
    DocumentsService,
    FieldsService,
    SlideTemplatesService,
  ],
})
export class AppModule {}
