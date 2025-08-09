import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { SlideTemplatesService } from './slide-templates.service';
import { SlideTemplate } from '../entities/slide-template.entity';

@Controller('api/slide-templates')
export class SlideTemplatesController {
  constructor(private readonly service: SlideTemplatesService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() data: Partial<SlideTemplate>) {
    return this.service.create(data);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() data: Partial<SlideTemplate>) {
    return this.service.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.remove(id);
  }

  @Post('update-template-keys')
  updateTemplateKeys() {
    return this.service.updateExistingTemplates();
  }
}
