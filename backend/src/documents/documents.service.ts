import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Document } from '../entities/document.entity';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private readonly repo: Repository<Document>,
  ) {}

  async findAll(): Promise<Document[]> {
    return this.repo.find({
      relations: ['media'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Document> {
    const document = await this.repo.findOne({ 
      where: { id },
      relations: ['media'],
    });
    if (!document) {
      throw new NotFoundException(`Documento com ID ${id} não encontrado`);
    }
    return document;
  }

  // Método para retornar dados customizados
  async findOneCustom(id: number, includeMedia: boolean = true): Promise<any> {
    const queryBuilder = this.repo.createQueryBuilder('document');
    
    queryBuilder
      .select([
        'document.id',
        'document.documentId',
        'document.name',
        'document.createdAt',
        'document.updatedAt',
        'document.publishedAt',
        'document.slides'
      ])
      .where('document.id = :id', { id });

    if (includeMedia) {
      queryBuilder
        .leftJoinAndSelect('document.media', 'media')
        .addSelect([
          'media.id',
          'media.mediaId',
          'media.filename',
          'media.originalName',
          'media.mimeType',
          'media.size',
          'media.url',
          'media.createdAt'
        ]);
    }

    const document = await queryBuilder.getOne();
    
    if (!document) {
      throw new NotFoundException(`Documento com ID ${id} não encontrado`);
    }

    // Transformar os dados antes de retornar
    return this.transformDocumentData(document);
  }

  // Método para transformar os dados
  private transformDocumentData(document: any): any {
    return {
      id: document.id,
      documentId: document.documentId,
      name: document.name,
      status: document.publishedAt ? 'published' : 'draft',
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
      publishedAt: document.publishedAt,
      slides: document.slides || [],
      media: document.media ? document.media.map(media => ({
        id: media.id,
        mediaId: media.mediaId,
        filename: media.filename,
        originalName: media.originalName,
        mimeType: media.mimeType,
        size: media.size,
        url: media.url,
        createdAt: media.createdAt
      })) : [],
      _links: {
        self: `/api/documents/${document.id}`,
        media: `/api/documents/${document.id}/with-media`,
        update: `/api/documents/${document.id}`,
        delete: `/api/documents/${document.id}`
      }
    };
  }

  async create(createDocumentDto: CreateDocumentDto): Promise<Document> {
    const documentData = {
      ...createDocumentDto,
      documentId: createDocumentDto.documentId || uuidv4(),
      slides: createDocumentDto.slides || []
    };
    
    const doc = this.repo.create(documentData);
    return this.repo.save(doc);
  }

  async update(id: number, updateDocumentDto: UpdateDocumentDto): Promise<Document> {
    const document = await this.findOne(id);
    
    const updateData = {
      ...updateDocumentDto,
      updatedAt: new Date()
    };
    
    await this.repo.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const document = await this.findOne(id);
    await this.repo.remove(document);
  }

  async findWithMedia(id: number): Promise<Document> {
    const document = await this.repo.findOne({ 
      where: { id },
      relations: ['media'],
    });
    if (!document) {
      throw new NotFoundException(`Documento com ID ${id} não encontrado`);
    }
    return document;
  }
}
