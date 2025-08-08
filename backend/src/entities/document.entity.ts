import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Media } from './media.entity';

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'document_id', unique: true })
  documentId: string;

  @Column()
  name: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'published_at', type: 'timestamp', nullable: true })
  publishedAt: Date | null;

  @Column({ type: 'json', nullable: true })
  slides: any;

  @OneToMany(() => Media, media => media.document)
  media: Media[];
}
