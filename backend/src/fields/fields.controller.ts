import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { FieldsService } from './fields.service';
import { Field } from '../entities/field.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PoliciesGuard } from '../auth/guards/policies.guard';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';

@Controller('api/fields')
@UseGuards(JwtAuthGuard, PoliciesGuard)
export class FieldsController {
  constructor(private readonly service: FieldsService) {}

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
  create(@Body() data: Partial<Field>) {
    return this.service.create(data);
  }

  @Put(':id')
  @RequirePermissions('templates:write')
  update(@Param('id') id: number, @Body() data: Partial<Field>) {
    return this.service.update(id, data);
  }

  @Delete(':id')
  @RequirePermissions('templates:write')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: number) {
    return this.service.remove(id);
  }
}
