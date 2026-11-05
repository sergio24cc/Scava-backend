import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { UserRole } from '../enums/role.enum';

/**
 * Entidad User (Mapeada a la tabla 'usuarios' del modelo SCAVA)
 * Incorpora exclusión de campos sensibles mediante class-transformer (@Exclude).
 */
@Entity('usuarios')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'varchar', length: 100 })
  apellido: string;

  @Column({ type: 'varchar', length: 150, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  usuario: string;

  /**
   * Contraseña encriptada:
   * - select: false -> Evita que TypeORM la incluya en consultas SELECT por defecto.
   * - @Exclude()    -> ClassSerializerInterceptor la excluye automáticamente de todas las respuestas JSON.
   */
  @Exclude()
  @Column({ name: 'contrasena_hash', type: 'varchar', length: 255, select: false })
  password: string;

  /**
   * Hash del Refresh Token (Estructura avanzada opcional):
   * Almacena el hash bcrypt del refresh token para validar rotación y revocación segura de sesiones.
   */
  @Exclude()
  @Column({ name: 'refresh_token_hash', type: 'varchar', length: 255, nullable: true, select: false })
  hashedRefreshToken?: string | null;

  @Column({
    name: 'rol',
    type: 'enum',
    enum: UserRole,
    default: UserRole.ESTUDIANTE,
  })
  role: UserRole;

  @Column({ name: 'activo', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
