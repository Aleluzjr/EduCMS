import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SlideTemplatesController } from './slide-templates.controller';
import { SlideTemplatesService } from './slide-templates.service';
import { SlideTemplate } from '../entities/slide-template.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SlideTemplate])],
  controllers: [SlideTemplatesController],
  providers: [SlideTemplatesService],
  exports: [SlideTemplatesService],
})
export class SlideTemplatesModule {} 