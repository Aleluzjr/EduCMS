import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe, HttpStatus, HttpCode, Query, Req, UseGuards } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { QueryDocumentsDto } from './dto/query-documents.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PoliciesGuard } from '../auth/guards/policies.guard';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../entities/user.entity';
import { Request } from 'express';

@Controller('api/documents')
@UseGuards(JwtAuthGuard, PoliciesGuard)
export class DocumentsController {
  constructor(private readonly service: DocumentsService) {}

  @Get()
  @RequirePermissions('documents:read')
  async findAll(
    @CurrentUser() currentUser: User,
    @Query() query: QueryDocumentsDto
  ) {
    return this.service.findAll(currentUser);
  }

  @Get(':id')
  @RequirePermissions('documents:read')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: User
  ) {
    return this.service.findOne(id, currentUser);
  }

  // Novo endpoint para dados customizados
  @Get(':id/custom')
  @RequirePermissions('documents:read')
  async findOneCustom(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: User,
    @Query('includeMedia') includeMedia?: string
  ) {
    const includeMediaFlag = includeMedia !== 'false';
    return this.service.findOneCustom(id, includeMediaFlag);
  }

  @Get(':id/with-media')
  @RequirePermissions('documents:read')
  async findOneWithMedia(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: User
  ) {
    return this.service.findWithMedia(id, currentUser);
  }

  // Endpoint para dados resumidos
  @Get(':id/summary')
  @RequirePermissions('documents:read')
  async findOneSummary(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: User
  ) {
    const document = await this.service.findOne(id, currentUser);
    
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
  @RequirePermissions('documents:write')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createDocumentDto: CreateDocumentDto,
    @CurrentUser() currentUser: User,
    @Req() req: Request
  ) {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    
    return this.service.create(createDocumentDto, currentUser, ip, userAgent);
  }

  @Put(':id')
  @RequirePermissions('documents:write')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDocumentDto: UpdateDocumentDto,
    @CurrentUser() currentUser: User,
    @Req() req: Request
  ) {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    
    return this.service.update(id, updateDocumentDto, currentUser, ip, userAgent);
  }

  @Delete(':id')
  @RequirePermissions('documents:write')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: User,
    @Req() req: Request
  ) {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    
    return this.service.remove(id, currentUser, ip, userAgent);
  }
}
