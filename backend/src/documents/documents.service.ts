import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Document, DocumentStatus } from '../entities/document.entity';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { User, UserRole } from '../entities/user.entity';
import { AuditService } from '../audit/audit.service';
import { AuditAction, AuditEntity } from '../entities/audit-log.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private readonly repo: Repository<Document>,
    private auditService: AuditService,
  ) {}

  async findAll(currentUser: User): Promise<Document[]> {
    if (currentUser.role === UserRole.ADMIN) {
      return this.repo.find({
        relations: ['media', 'owner'],
        order: { createdAt: 'DESC' },
      });
    } else {
      // EDITOR só vê seus próprios documentos
      return this.repo.find({
        where: { ownerId: currentUser.id },
        relations: ['media'],
        order: { createdAt: 'DESC' },
      });
    }
  }

  async findOne(id: number, currentUser: User): Promise<Document> {
    const document = await this.repo.findOne({ 
      where: { id },
      relations: ['media', 'owner'],
    });
    if (!document) {
      throw new NotFoundException(`Documento com ID ${id} não encontrado`);
    }

    // EDITOR só pode ver seus próprios documentos
    if (currentUser.role === UserRole.EDITOR && document.ownerId !== currentUser.id) {
      throw new ForbiddenException('Acesso negado: você só pode visualizar seus próprios documentos');
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

  async create(createDocumentDto: CreateDocumentDto, currentUser: User, ip: string, userAgent: string): Promise<Document> {
    const documentData = {
      ...createDocumentDto,
      documentId: createDocumentDto.documentId || uuidv4(),
      slides: createDocumentDto.slides || [],
      ownerId: currentUser.id,
      status: DocumentStatus.RASCUNHO
    };
    
    const doc = this.repo.create(documentData);
    const savedDoc = await this.repo.save(doc);
    
    // Registrar auditoria
    await this.auditService.log({
      userId: currentUser.id,
      action: AuditAction.CREATE,
      entity: AuditEntity.DOCUMENT,
      entityId: savedDoc.id,
      ip,
      userAgent,
      metadata: { documentId: savedDoc.documentId, name: savedDoc.name }
    });
    
    return savedDoc;
  }

  async update(id: number, updateDocumentDto: UpdateDocumentDto, currentUser: User, ip: string, userAgent: string): Promise<Document> {
    const document = await this.findOne(id, currentUser);
    
    // EDITOR só pode editar seus próprios documentos
    if (currentUser.role === UserRole.EDITOR && document.ownerId !== currentUser.id) {
      throw new ForbiddenException('Acesso negado: você só pode editar seus próprios documentos');
    }
    
    const updateData = {
      ...updateDocumentDto,
      updatedAt: new Date()
    };
    
    await this.repo.update(id, updateData);
    
    // Registrar auditoria
    await this.auditService.log({
      userId: currentUser.id,
      action: AuditAction.UPDATE,
      entity: AuditEntity.DOCUMENT,
      entityId: id,
      ip,
      userAgent,
      metadata: { documentId: document.documentId, changes: updateDocumentDto }
    });
    
    return this.findOne(id, currentUser);
  }

  async remove(id: number, currentUser: User, ip: string, userAgent: string): Promise<void> {
    const document = await this.findOne(id, currentUser);
    
    // Apenas ADMIN pode excluir documentos
    if (currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Acesso negado: apenas administradores podem excluir documentos');
    }
    
    // Soft delete
    await this.repo.softDelete(id);
    
    // Registrar auditoria
    await this.auditService.log({
      userId: currentUser.id,
      action: AuditAction.DELETE,
      entity: AuditEntity.DOCUMENT,
      entityId: id,
      ip,
      userAgent,
      metadata: { documentId: document.documentId, action: 'soft_delete' }
    });
  }

  async findWithMedia(id: number, currentUser: User): Promise<Document> {
    return this.findOne(id, currentUser);
  }
}
