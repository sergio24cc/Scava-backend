import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './entities/course.entity.js';
import { Enrollment } from './entities/enrollment.entity.js';
import { LearningTopic } from './entities/learning-topic.entity.js';
import { User } from '../user/entities/user.entity.js';
import { AcademicService } from './academic.service.js';
import { CoursesController } from './courses.controller.js';
import { EnrollmentsController } from './enrollments.controller.js';
import { TopicsController } from './topics.controller.js';

/**
 * Módulo Académico (AcademicModule)
 * Configura controladores, servicios y repositorios para la gestión de la estructura académica en SCAVA.
 */
@Module({
  imports: [TypeOrmModule.forFeature([Course, Enrollment, LearningTopic, User])],
  controllers: [CoursesController, EnrollmentsController, TopicsController],
  providers: [AcademicService],
  exports: [AcademicService, TypeOrmModule],
})
export class AcademicModule {}
