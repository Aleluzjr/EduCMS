import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog, AuditAction, AuditEntity } from '../entities/audit-log.entity';

export interface AuditData {
  userId: number;
  action: AuditAction;
  entity: AuditEntity;
  entityId?: number;
  metadata?: any;
  ip: string;
  userAgent: string;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  async log(auditData: AuditData): Promise<void> {
    const auditLog = this.auditLogRepository.create({
      ...auditData,
      metadata: auditData.metadata ? JSON.stringify(auditData.metadata) : undefined,
    });

    await this.auditLogRepository.save(auditLog);
  }

  async getAuditLogs(
    userId?: number,
    entity?: AuditEntity,
    entityId?: number,
    action?: AuditAction,
    limit: number = 100,
    offset: number = 0
  ): Promise<{ logs: AuditLog[]; total: number }> {
    const queryBuilder = this.auditLogRepository
      .createQueryBuilder('audit')
      .leftJoinAndSelect('audit.user', 'user')
      .orderBy('audit.createdAt', 'DESC')
      .skip(offset)
      .take(limit);

    if (userId) {
      queryBuilder.andWhere('audit.userId = :userId', { userId });
    }

    if (entity) {
      queryBuilder.andWhere('audit.entity = :entity', { entity });
    }

    if (entityId) {
      queryBuilder.andWhere('audit.entityId = :entityId', { entityId });
    }

    if (action) {
      queryBuilder.andWhere('audit.action = :action', { action });
    }

    const [logs, total] = await queryBuilder.getManyAndCount();

    return { logs, total };
  }
} 