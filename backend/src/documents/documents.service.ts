import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from '../entities/document.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private readonly repo: Repository<Document>,
  ) {}

  findAll() {
    return this.repo.find();
  }

  findOne(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  async create(data: Partial<Document>) {
    // Gera um document_id único se não fornecido
    const documentData = {
      ...data,
      documentId: data.documentId || uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
      slides: data.slides || []
    };
    
    const doc = this.repo.create(documentData);
    return this.repo.save(doc);
  }

  async update(id: number, data: Partial<Document>) {
    // Atualiza o updatedAt
    const updateData = {
      ...data,
      updatedAt: new Date()
    };
    
    await this.repo.update(id, updateData);
    return this.findOne(id);
  }

  remove(id: number) {
    return this.repo.delete(id);
  }
}
