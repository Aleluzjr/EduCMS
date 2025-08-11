import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SlideTemplatesController } from './slide-templates.controller';
import { SlideTemplatesService } from './slide-templates.service';
import { SlideTemplate } from '../entities/slide-template.entity';
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
  imports: [TypeOrmModule.forFeature([SlideTemplate]), PermissionsModule],
  controllers: [SlideTemplatesController],
  providers: [SlideTemplatesService],
  exports: [SlideTemplatesService],
})
export class SlideTemplatesModule {} 