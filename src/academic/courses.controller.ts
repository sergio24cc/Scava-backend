import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AcademicService } from './academic.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { EnrollStudentDto } from './dto/enroll-student.dto';
import { CreateTopicDto } from './dto/create-topic.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../user/entities/user.entity';
import { UserRole } from '../user/enums/role.enum';

/**
 * Controlador de Cursos (CoursesController)
 * Expone endpoints REST para la gestión de asignaturas, matrículas y temas asociados.
 */
@Controller('courses')
@UseGuards(JwtAuthGuard)
export class CoursesController {
  constructor(private readonly academicService: AcademicService) {}

  /**
   * POST /courses
   * Crea un nuevo curso. Restringido a DOCENTE y ADMIN.
   */
  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.DOCENTE, UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createCourseDto: CreateCourseDto,
    @GetUser() currentUser: User,
  ) {
    return this.academicService.createCourse(createCourseDto, currentUser);
  }

  /**
   * GET /courses
   * Lista cursos disponibles. Admite filtro opcional por ?docenteId=X.
   */
  @Get()
  findAll(@Query('docenteId') docenteId?: string) {
    const id = docenteId ? parseInt(docenteId, 10) : undefined;
    return this.academicService.findAllCourses(id);
  }

  /**
   * GET /courses/:id
   * Obtiene el detalle de un curso con su docente y temas.
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.academicService.findCourseById(id);
  }

  /**
   * PATCH /courses/:id
   * Actualiza un curso. Solo permitido para el docente titular o ADMIN.
   */
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.DOCENTE, UserRole.ADMIN)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCourseDto: UpdateCourseDto,
    @GetUser() currentUser: User,
  ) {
    return this.academicService.updateCourse(id, updateCourseDto, currentUser);
  }

  /**
   * DELETE /courses/:id
   * Elimina un curso. Solo permitido para el docente titular o ADMIN.
   */
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.DOCENTE, UserRole.ADMIN)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() currentUser: User,
  ) {
    return this.academicService.removeCourse(id, currentUser);
  }

  /**
   * POST /courses/:id/enroll
   * Matricula al usuario autenticado (estudiante) o a un estudiante específico (admin/docente).
   */
  @Post(':id/enroll')
  @HttpCode(HttpStatus.CREATED)
  enroll(
    @Param('id', ParseIntPipe) courseId: number,
    @Body() body: Partial<EnrollStudentDto>,
    @GetUser() currentUser: User,
  ) {
    const enrollDto: EnrollStudentDto = {
      cursoId: courseId,
      estudianteId: body.estudianteId,
      estado: body.estado,
    };
    return this.academicService.enrollStudent(enrollDto, currentUser);
  }

  /**
   * GET /courses/:id/students
   * Lista los estudiantes matriculados en el curso. (Solo Docente titular o ADMIN).
   */
  @Get(':id/students')
  @UseGuards(RolesGuard)
  @Roles(UserRole.DOCENTE, UserRole.ADMIN)
  findStudents(
    @Param('id', ParseIntPipe) courseId: number,
    @GetUser() currentUser: User,
  ) {
    return this.academicService.findEnrollmentsByCourse(courseId, currentUser);
  }

  /**
   * POST /courses/:id/topics
   * Crea un tema curricular dentro del curso. (Docente titular o ADMIN).
   */
  @Post(':id/topics')
  @UseGuards(RolesGuard)
  @Roles(UserRole.DOCENTE, UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  createTopic(
    @Param('id', ParseIntPipe) courseId: number,
    @Body() createTopicDto: Omit<CreateTopicDto, 'cursoId'>,
    @GetUser() currentUser: User,
  ) {
    const fullDto: CreateTopicDto = {
      ...createTopicDto,
      cursoId: courseId,
    };
    return this.academicService.createTopic(fullDto, currentUser);
  }

  /**
   * GET /courses/:id/topics
   * Obtiene los temas de un curso. Aplica Regla RN-04 para estudiantes (deben estar matriculados).
   */
  @Get(':id/topics')
  findTopics(
    @Param('id', ParseIntPipe) courseId: number,
    @GetUser() currentUser: User,
  ) {
    return this.academicService.findTopicsByCourse(courseId, currentUser);
  }
}
