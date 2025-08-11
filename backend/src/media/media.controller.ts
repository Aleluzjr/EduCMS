import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PoliciesGuard } from '../auth/guards/policies.guard';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';

@Controller('api/media')
@UseGuards(JwtAuthGuard, PoliciesGuard)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post()
  @RequirePermissions('media:write')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const randomName = uuidv4();
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
          new FileTypeValidator({ fileType: '.(jpg|jpeg|png|gif|pdf|doc|docx)' }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body() body: any,
  ) {
    const mediaData = {
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      path: file.path,
      url: `/uploads/${file.filename}`,
      documentId: body.documentId ? parseInt(body.documentId) : null,
      metadata: {
        encoding: file.encoding,
        fieldname: file.fieldname,
      },
    };

    return this.mediaService.create(mediaData);
  }

  @Get()
  @RequirePermissions('media:read')
  async findAll(@Query('documentId') documentId?: string) {
    if (documentId) {
      return this.mediaService.findByDocumentId(parseInt(documentId));
    }
    return this.mediaService.findAll();
  }

  @Get('stats')
  @RequirePermissions('media:read')
  async getStats() {
    return this.mediaService.getMediaStats();
  }

  @Get(':id')
  @RequirePermissions('media:read')
  async findOne(@Param('id') id: string) {
    return this.mediaService.findOne(+id);
  }

  @Patch(':id')
  @RequirePermissions('media:write')
  async update(@Param('id') id: string, @Body() updateMediaDto: any) {
    return this.mediaService.update(+id, updateMediaDto);
  }

  @Delete(':id')
  @RequirePermissions('media:write')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    return this.mediaService.remove(+id);
  }
} 