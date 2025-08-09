import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('slide_templates')
export class SlideTemplate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  icon: string;

  @Column({ name: 'template_key', unique: true })
  templateKey: string;

  @Column({ type: 'json', nullable: true })
  fields: any;
}
