import {
  IsNotEmpty,
  IsString,
  MinLength,
  IsInt,
  Min,
  IsDateString,
  IsOptional,
  IsBoolean,
} from 'class-validator';

/**
 * DTO para la creación de un tema de aprendizaje (CreateTopicDto)
 * Define una unidad de aprendizaje dentro de un curso específico.
 */
export class CreateTopicDto {
  @IsInt({ message: 'El ID del curso debe ser un número entero' })
  @IsNotEmpty({ message: 'El ID del curso es obligatorio' })
  cursoId: number;

  @IsString({ message: 'El título del tema debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El título del tema es obligatorio' })
  @MinLength(3, { message: 'El título debe tener al menos 3 caracteres' })
  titulo: string;

  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La descripción del tema es obligatoria' })
  descripcion: string;

  @IsInt({ message: 'El orden debe ser un número entero' })
  @Min(1, { message: 'El orden secuencial debe ser como mínimo 1' })
  @IsNotEmpty({ message: 'El orden del tema es obligatorio' })
  orden: number;

  @IsDateString({}, { message: 'La fecha de inicio debe tener formato ISO (YYYY-MM-DD)' })
  @IsNotEmpty({ message: 'La fecha de inicio es obligatoria' })
  fechaInicio: string;

  @IsDateString({}, { message: 'La fecha de fin debe tener formato ISO (YYYY-MM-DD)' })
  @IsNotEmpty({ message: 'La fecha de fin es obligatoria' })
  fechaFin: string;

  @IsOptional()
  @IsBoolean({ message: 'El estado publicado debe ser booleano' })
  publicado?: boolean;
}
