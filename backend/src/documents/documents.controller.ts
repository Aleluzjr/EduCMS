import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe, HttpStatus, HttpCode, Query } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

@Controller('api/documents')
export class DocumentsController {
  constructor(private readonly service: DocumentsService) {}

  @Get()
  async findAll(@Query('withMedia') withMedia?: string) {
    if (withMedia === 'true') {
      return this.service.findAll();
    }
    return this.service.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  // Novo endpoint para dados customizados
  @Get(':id/custom')
  async findOneCustom(
    @Param('id', ParseIntPipe) id: number,
    @Query('includeMedia') includeMedia?: string
  ) {
    const includeMediaFlag = includeMedia !== 'false';
    return this.service.findOneCustom(id, includeMediaFlag);
  }

  @Get(':id/with-media')
  async findOneWithMedia(@Param('id', ParseIntPipe) id: number) {
    return this.service.findWithMedia(id);
  }

  // Endpoint para dados resumidos
  @Get(':id/summary')
  async findOneSummary(@Param('id', ParseIntPipe) id: number) {
    const document = await this.service.findOne(id);
    
    return {
      id: document.id,
      documentId: document.documentId,
      name: document.name,
      status: document.publishedAt ? 'published' : 'draft',
      createdAt: document.createdAt,
      mediaCount: document.media ? document.media.length : 0,
      slidesCount: document.slides ? document.slides.length : 0
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDocumentDto: CreateDocumentDto) {
    return this.service.create(createDocumentDto);
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateDocumentDto: UpdateDocumentDto) {
    return this.service.update(id, updateDocumentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
