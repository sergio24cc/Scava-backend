import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  type Relation,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Enrollment } from './enrollment.entity';
import { LearningTopic } from './learning-topic.entity';

/**
 * Entidad Course (Mapeada a la tabla 'cursos' del modelo SCAVA)
 * Utiliza Relation<T> para prevenir problemas de dependencias circulares en ESM (Node.js).
 */
@Entity('cursos')
export class Course {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { eager: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'docente_id' })
  docente: Relation<User>;

  @Column({ name: 'docente_id', type: 'int' })
  docenteId: number;

  @Column({ type: 'varchar', length: 150 })
  nombre: string;

  @Column({ type: 'varchar', length: 100 })
  area: string;

  @Column({ type: 'varchar', length: 50 })
  grado: string;

  @Column({ name: 'periodo_academico', type: 'varchar', length: 50 })
  periodoAcademico: string;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => Enrollment, (enrollment) => enrollment.curso)
  matriculas: Relation<Enrollment>[];

  @OneToMany(() => LearningTopic, (topic) => topic.curso)
  temas: Relation<LearningTopic>[];
}
