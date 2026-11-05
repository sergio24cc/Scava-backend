import {
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
  IsBoolean,
  IsInt,
} from 'class-validator';

/**
 * DTO para la creación de un nuevo curso (CreateCourseDto)
 * Valida los datos requeridos para registrar una asignatura en el sistema SCAVA.
 */
export class CreateCourseDto {
  @IsString({ message: 'El nombre del curso debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre del curso es obligatorio' })
  @MinLength(3, { message: 'El nombre del curso debe tener al menos 3 caracteres' })
  nombre: string;

  @IsString({ message: 'El área de conocimiento debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El área es obligatoria (ej: Matemáticas, Ciencias, Tecnología)' })
  area: string;

  @IsString({ message: 'El grado o nivel académico debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El grado es obligatorio (ej: 10°, 11°, Semestre 1)' })
  grado: string;

  @IsString({ message: 'El período académico debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El período académico es obligatorio (ej: 2026-1, 2026-2)' })
  periodoAcademico: string;

  /**
   * ID del docente titular: opcional si quien crea el curso es el propio docente autenticado,
   * o requerido si un administrador está asignando el curso a un docente específico.
   */
  @IsOptional()
  @IsInt({ message: 'El ID del docente debe ser un número entero' })
  docenteId?: number;

  @IsOptional()
  @IsBoolean({ message: 'El estado activo debe ser un valor booleano' })
  activo?: boolean;
}
