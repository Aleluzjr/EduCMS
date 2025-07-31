import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { FieldsService } from './fields.service';
import { Field } from '../entities/field.entity';

@Controller('api/fields')
export class FieldsController {
  constructor(private readonly service: FieldsService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() data: Partial<Field>) {
    return this.service.create(data);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() data: Partial<Field>) {
    return this.service.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.remove(id);
  }
}
