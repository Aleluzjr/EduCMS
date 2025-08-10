import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn, DeleteDateColumn } from 'typeorm';
import { Media } from './media.entity';
import { User } from './user.entity';

export enum DocumentStatus {
  RASCUNHO = 'RASCUNHO',
  PUBLICADO = 'PUBLICADO'
}

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'document_id', unique: true })
  documentId: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: DocumentStatus,
    default: DocumentStatus.RASCUNHO
  })
  status: DocumentStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'published_at', type: 'timestamp', nullable: true })
  publishedAt: Date | null;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;

  @Column({ type: 'json', nullable: true })
  slides: any;

  // Relacionamentos
  @ManyToOne(() => User, user => user.documents)
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @Column()
  ownerId: number;

  @OneToMany(() => Media, media => media.document)
  media: Media[];
}
