import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  type Relation,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Course } from './course.entity';
import { EnrollmentStatus } from '../enums/enrollment-status.enum';

/**
 * Entidad Enrollment (Mapeada a la tabla 'matriculas' del modelo SCAVA)
 * Utiliza Relation<T> para prevenir problemas de dependencias circulares en ESM (Node.js).
 */
@Entity('matriculas')
@Unique(['cursoId', 'estudianteId'])
export class Enrollment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Course, (course) => course.matriculas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'curso_id' })
  curso: Relation<Course>;

  @Column({ name: 'curso_id', type: 'int' })
  cursoId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'estudiante_id' })
  estudiante: Relation<User>;

  @Column({ name: 'estudiante_id', type: 'int' })
  estudianteId: number;

  @CreateDateColumn({ name: 'fecha_matricula' })
  fechaMatricula: Date;

  @Column({
    type: 'enum',
    enum: EnrollmentStatus,
    default: EnrollmentStatus.ACTIVA,
  })
  estado: EnrollmentStatus;
}
