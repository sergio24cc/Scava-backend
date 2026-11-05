import { PartialType } from '@nestjs/mapped-types';
import { CreateCourseDto } from './create-course.dto.js';

/**
 * DTO para la actualización parcial de un curso (UpdateCourseDto)
 * Hereda todas las propiedades de CreateCourseDto haciéndolas opcionales automáticamente.
 */
export class UpdateCourseDto extends PartialType(CreateCourseDto) {}
