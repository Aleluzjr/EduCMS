import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('slide_templates')
export class SlideTemplate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  icon: string;

  @Column({ type: 'jsonb', nullable: true })
  fields: any;
}
