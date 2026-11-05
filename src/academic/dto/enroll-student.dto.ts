import { IsInt, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { EnrollmentStatus } from '../enums/enrollment-status.enum';

/**
 * DTO para matricular a un estudiante en un curso (EnrollStudentDto)
 * Cumple con la restricción de asociar un curso_id con un estudiante_id.
 */
export class EnrollStudentDto {
  @IsInt({ message: 'El ID del curso debe ser un número entero' })
  @IsNotEmpty({ message: 'El ID del curso es obligatorio' })
  cursoId: number;

  /**
   * ID del estudiante: opcional si el estudiante se auto-matricula con su token JWT,
   * u obligatorio si un docente o administrador realiza la inscripción.
   */
  @IsOptional()
  @IsInt({ message: 'El ID del estudiante debe ser un número entero' })
  estudianteId?: number;

  @IsOptional()
  @IsEnum(EnrollmentStatus, {
    message: `El estado debe ser uno de los permitidos: ${Object.values(EnrollmentStatus).join(', ')}`,
  })
  estado?: EnrollmentStatus;
}
