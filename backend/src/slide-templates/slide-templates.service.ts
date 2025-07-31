import { Injectable } from '@nestjs/common';
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

  create(data: Partial<SlideTemplate>) {
    const template = this.repo.create(data);
    return this.repo.save(template);
  }

  update(id: number, data: Partial<SlideTemplate>) {
    return this.repo.update(id, data);
  }

  remove(id: number) {
    return this.repo.delete(id);
  }
}
