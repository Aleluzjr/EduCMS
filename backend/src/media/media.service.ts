import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Media } from '../entities/media.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(Media)
    private mediaRepository: Repository<Media>,
  ) {}

  async create(createMediaDto: any): Promise<Media> {
    const media = new Media();
    media.mediaId = uuidv4();
    media.filename = createMediaDto.filename;
    media.originalName = createMediaDto.originalName;
    media.mimeType = createMediaDto.mimeType;
    media.size = createMediaDto.size;
    media.path = createMediaDto.path;
    media.url = createMediaDto.url;
    media.documentId = createMediaDto.documentId;
    media.metadata = createMediaDto.metadata;
    media.status = 'active';
    
    return this.mediaRepository.save(media);
  }

  async findAll(): Promise<Media[]> {
    return this.mediaRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Media> {
    const media = await this.mediaRepository.findOne({ where: { id } });
    if (!media) {
      throw new NotFoundException(`Mídia com ID ${id} não encontrada`);
    }
    return media;
  }

  async findByDocumentId(documentId: number): Promise<Media[]> {
    return this.mediaRepository.find({
      where: { documentId },
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: number, updateMediaDto: any): Promise<Media> {
    const media = await this.findOne(id);
    Object.assign(media, updateMediaDto);
    return this.mediaRepository.save(media);
  }

  async remove(id: number): Promise<void> {
    const media = await this.findOne(id);
    await this.mediaRepository.remove(media);
  }

  async findByMimeType(mimeType: string): Promise<Media[]> {
    return this.mediaRepository.find({
      where: { mimeType },
      order: { createdAt: 'DESC' },
    });
  }

  async getMediaStats(): Promise<any> {
    const total = await this.mediaRepository.count();
    const byType = await this.mediaRepository
      .createQueryBuilder('media')
      .select('media.mimeType', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('media.mimeType')
      .getRawMany();

    return {
      total,
      byType,
    };
  }
} 