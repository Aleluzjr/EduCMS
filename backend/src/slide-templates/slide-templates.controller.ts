import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { SlideTemplatesService } from './slide-templates.service';
import { SlideTemplate } from '../entities/slide-template.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PoliciesGuard } from '../auth/guards/policies.guard';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';

@Controller('api/slide-templates')
@UseGuards(JwtAuthGuard, PoliciesGuard)
export class SlideTemplatesController {
  constructor(private readonly service: SlideTemplatesService) {}

  @Get()
  @RequirePermissions('templates:read')
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @RequirePermissions('templates:read')
  findOne(@Param('id') id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @RequirePermissions('templates:write')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() data: Partial<SlideTemplate>) {
    return this.service.create(data);
  }

  @Put(':id')
  @RequirePermissions('templates:write')
  update(@Param('id') id: number, @Body() data: Partial<SlideTemplate>) {
    return this.service.update(id, data);
  }

  @Delete(':id')
  @RequirePermissions('templates:write')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: number) {
    return this.service.remove(id);
  }

  @Post('update-template-keys')
  @RequirePermissions('templates:write')
  updateTemplateKeys() {
    return this.service.updateExistingTemplates();
  }
}
