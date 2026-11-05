import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  type Relation,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Course } from './course.entity';

/**
 * Entidad LearningTopic (Mapeada a la tabla 'temas_aprendizaje' del modelo SCAVA)
 * Utiliza Relation<T> para prevenir problemas de dependencias circulares en ESM (Node.js).
 */
@Entity('temas_aprendizaje')
export class LearningTopic {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Course, (course) => course.temas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'curso_id' })
  curso: Relation<Course>;

  @Column({ name: 'curso_id', type: 'int' })
  cursoId: number;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'docente_id' })
  docente: Relation<User>;

  @Column({ name: 'docente_id', type: 'int' })
  docenteId: number;

  @Column({ type: 'varchar', length: 200 })
  titulo: string;

  @Column({ type: 'text' })
  descripcion: string;

  @Column({ type: 'int' })
  orden: number;

  @Column({ name: 'fecha_inicio', type: 'date' })
  fechaInicio: Date;

  @Column({ name: 'fecha_fin', type: 'date' })
  fechaFin: Date;

  @Column({ type: 'boolean', default: false })
  publicado: boolean;
}
