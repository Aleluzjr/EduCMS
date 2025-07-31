import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('fields')
export class Field {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'template_id' })
  templateId: number;

  @Column()
  name: string;

  @Column()
  type: string;

  @Column()
  label: string;

  @Column({ type: 'boolean', default: false })
  required: boolean;

  @Column({ name: 'default_value', nullable: true })
  defaultValue: string;

  @Column({ nullable: true })
  accept: string;

  @Column({ type: 'jsonb', nullable: true })
  fields: any;
}
