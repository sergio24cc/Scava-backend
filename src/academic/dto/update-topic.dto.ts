import { PartialType } from '@nestjs/mapped-types';
import { CreateTopicDto } from './create-topic.dto.js';

/**
 * DTO para la actualización parcial de un tema de aprendizaje (UpdateTopicDto)
 * Hereda todas las propiedades de CreateTopicDto haciéndolas opcionales.
 */
export class UpdateTopicDto extends PartialType(CreateTopicDto) {}
