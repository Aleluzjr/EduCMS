import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SlideTemplate } from '../entities/slide-template.entity';

@Injectable()
export class SlideTemplatesService {
  constructor(
    @InjectRepository(SlideTemplate)
    private readonly repo: Repository<SlideTemplate>,
  ) {}

  findAll() {
    return this.repo.find();
  }

  findOne(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  async create(data: Partial<SlideTemplate>) {
    try {
      // Gerar templateKey automaticamente baseado no nome
      const templateKey = `slides.${data.name?.toLowerCase().replace(/\s+/g, '-')}`;
      
      // Verificar se já existe um template com a mesma chave
      const existingTemplate = await this.repo.findOne({ where: { templateKey } });
      if (existingTemplate) {
        throw new ConflictException(`Já existe um template com o nome '${data.name}'`);
      }
      
      const template = this.repo.create({
        ...data,
        templateKey
      });
      return await this.repo.save(template);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException(`Já existe um template com a chave '${data.name?.toLowerCase().replace(/\s+/g, '-')}'`);
      }
      throw error;
    }
  }

  async update(id: number, data: Partial<SlideTemplate>) {
    try {
      // Verificar se o template existe
      const existingTemplate = await this.repo.findOne({ where: { id } });
      if (!existingTemplate) {
        throw new Error('Template não encontrado');
      }

      // Se o nome foi alterado, verificar se não conflita com outro template
      if (data.name) {
        const newTemplateKey = `slides.${data.name.toLowerCase().replace(/\s+/g, '-')}`;
        
        // Verificar se já existe outro template com a mesma chave
        const conflictingTemplate = await this.repo.findOne({ 
          where: { templateKey: newTemplateKey },
          select: ['id']
        });
        
        if (conflictingTemplate && conflictingTemplate.id !== id) {
          throw new ConflictException(`Já existe um template com o nome '${data.name}'`);
        }
        
        data.templateKey = newTemplateKey;
      }

      await this.repo.update(id, data);
      
      // Retornar o template atualizado
      return await this.repo.findOne({ where: { id } });
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException(`Já existe um template com a chave '${data.name?.toLowerCase().replace(/\s+/g, '-')}'`);
      }
      throw error;
    }
  }

  remove(id: number) {
    return this.repo.delete(id);
  }

  // Método para atualizar templates existentes com templateKey
  async updateExistingTemplates() {
    const templates = await this.repo.find();
    
    for (const template of templates) {
      if (!template.templateKey) {
        const templateKey = `slides.${template.name.toLowerCase().replace(/\s+/g, '-')}`;
        await this.repo.update(template.id, { templateKey });
      }
    }
    
    return this.repo.find();
  }
}
