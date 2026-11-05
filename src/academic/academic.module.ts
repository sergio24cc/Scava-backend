import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { Enrollment } from './entities/enrollment.entity';
import { LearningTopic } from './entities/learning-topic.entity';
import { User } from '../user/entities/user.entity';
import { AcademicService } from './academic.service';
import { CoursesController } from './courses.controller';
import { EnrollmentsController } from './enrollments.controller';
import { TopicsController } from './topics.controller';

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
