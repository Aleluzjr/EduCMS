import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Document } from './document.entity';

@Entity('media')
export class Media {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'media_id', unique: true })
  mediaId: string;

  @Column()
  filename: string;

  @Column()
  originalName: string;

  @Column()
  mimeType: string;

  @Column()
  size: number;

  @Column()
  path: string;

  @Column({ nullable: true })
  url: string;

  @Column({ name: 'document_id', nullable: true })
  documentId: number;

  @ManyToOne(() => Document, { nullable: true })
  @JoinColumn({ name: 'document_id' })
  document: Document;

  @Column({ type: 'json', nullable: true })
  metadata: any;

  @Column({ default: 'active' })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
} 