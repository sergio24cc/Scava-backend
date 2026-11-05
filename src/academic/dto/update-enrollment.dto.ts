import { IsEnum, IsNotEmpty } from 'class-validator';
import { EnrollmentStatus } from '../enums/enrollment-status.enum.js';

/**
 * DTO para actualizar el estado de una matrícula (UpdateEnrollmentDto)
 * Permite cambiar el estado (ej: de 'activa' a 'retirada' o 'completada').
 */
export class UpdateEnrollmentDto {
  @IsEnum(EnrollmentStatus, {
    message: `El nuevo estado debe ser: ${Object.values(EnrollmentStatus).join(', ')}`,
  })
  @IsNotEmpty({ message: 'El estado es obligatorio para actualizar la matrícula' })
  estado: EnrollmentStatus;
}
