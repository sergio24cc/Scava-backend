import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './entities/course.entity';
import { Enrollment } from './entities/enrollment.entity';
import { LearningTopic } from './entities/learning-topic.entity';
import { User } from '../user/entities/user.entity';
import { UserRole } from '../user/enums/role.enum';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { EnrollStudentDto } from './dto/enroll-student.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { EnrollmentStatus } from './enums/enrollment-status.enum';

/**
 * Servicio Académico (AcademicService)
 * Gestiona el ciclo de vida de Cursos, Matrículas de Estudiantes y Temas Curriculares.
 * Implementa la Regla de Negocio RN-04 (Control de Acceso basado en Matrícula).
 */
@Injectable()
export class AcademicService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,

    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,

    @InjectRepository(LearningTopic)
    private readonly topicRepository: Repository<LearningTopic>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // =========================================================================
  // GESTIÓN DE CURSOS
  // =========================================================================

  /**
   * Crea un nuevo curso en el sistema.
   * - Si quien lo crea es un DOCENTE, se le asigna automáticamente la titularidad.
   * - Si quien lo crea es un ADMIN, puede especificar el 'docenteId' en el DTO.
   */
  async createCourse(createCourseDto: CreateCourseDto, currentUser: User): Promise<Course> {
    let docenteId: number;

    if (currentUser.role === UserRole.DOCENTE) {
      docenteId = currentUser.id;
    } else if (currentUser.role === UserRole.ADMIN) {
      if (!createCourseDto.docenteId) {
        throw new BadRequestException('Un administrador debe especificar el docenteId asignado al curso');
      }
      const docente = await this.userRepository.findOne({
        where: { id: createCourseDto.docenteId },
      });
      if (!docente) {
        throw new NotFoundException(`Docente con ID ${createCourseDto.docenteId} no encontrado`);
      }
      if (docente.role !== UserRole.DOCENTE) {
        throw new BadRequestException('El usuario asignado al curso debe tener el rol de docente');
      }
      docenteId = docente.id;
    } else {
      throw new ForbiddenException('Solo los docentes y administradores pueden crear cursos');
    }

    const course = this.courseRepository.create({
      ...createCourseDto,
      docenteId,
    });

    return this.courseRepository.save(course);
  }

  /**
   * Lista todos los cursos disponibles en el sistema con opción de filtrar por docente.
   */
  async findAllCourses(docenteId?: number): Promise<Course[]> {
    const query = this.courseRepository.createQueryBuilder('curso')
      .leftJoinAndSelect('curso.docente', 'docente')
      .leftJoinAndSelect('curso.temas', 'temas')
      .orderBy('curso.createdAt', 'DESC');

    if (docenteId) {
      query.andWhere('curso.docenteId = :docenteId', { docenteId });
    }

    return query.getMany();
  }

  /**
   * Obtiene los detalles de un curso por su ID.
   */
  async findCourseById(id: number): Promise<Course> {
    const course = await this.courseRepository.findOne({
      where: { id },
      relations: {
        docente: true,
        temas: true,
      },
    });

    if (!course) {
      throw new NotFoundException(`Curso con ID ${id} no encontrado`);
    }

    return course;
  }

  /**
   * Actualiza la información de un curso verificando permisos de propiedad (Docente titular o ADMIN).
   */
  async updateCourse(id: number, updateCourseDto: UpdateCourseDto, currentUser: User): Promise<Course> {
    const course = await this.findCourseById(id);

    // Validación de permisos: Solo el docente creador o un admin pueden modificar el curso
    if (currentUser.role !== UserRole.ADMIN && course.docenteId !== currentUser.id) {
      throw new ForbiddenException('No tiene permisos para modificar este curso (no es el docente titular)');
    }

    const updatedCourse = await this.courseRepository.preload({
      id,
      ...updateCourseDto,
    });

    if (!updatedCourse) {
      throw new NotFoundException(`Curso con ID ${id} no encontrado`);
    }

    return this.courseRepository.save(updatedCourse);
  }

  /**
   * Elimina un curso del sistema.
   */
  async removeCourse(id: number, currentUser: User): Promise<{ message: string }> {
    const course = await this.findCourseById(id);

    if (currentUser.role !== UserRole.ADMIN && course.docenteId !== currentUser.id) {
      throw new ForbiddenException('No tiene permisos para eliminar este curso');
    }

    await this.courseRepository.remove(course);
    return { message: `Curso '${course.nombre}' (ID: ${id}) eliminado correctamente` };
  }

  // =========================================================================
  // GESTIÓN DE MATRÍCULAS (RN-04)
  // =========================================================================

  /**
   * Matricula a un estudiante en un curso.
   * - Valida existencia del curso y que esté activo.
   * - Valida que el estudiante exista y tenga rol 'estudiante'.
   * - Cumple la restricción UQ (curso_id, estudiante_id) lanzando ConflictException si ya está matriculado.
   */
  async enrollStudent(enrollDto: EnrollStudentDto, currentUser: User): Promise<Enrollment> {
    const course = await this.findCourseById(enrollDto.cursoId);
    if (!course.activo) {
      throw new BadRequestException('No es posible matricularse en un curso inactivo');
    }

    // Determinamos el estudiante: si es el propio estudiante quien invoca el endpoint o si es un admin/docente
    let studentId: number;
    if (currentUser.role === UserRole.ESTUDIANTE) {
      studentId = currentUser.id;
    } else {
      if (!enrollDto.estudianteId) {
        throw new BadRequestException('Debe proporcionar el estudianteId que se va a matricular');
      }
      studentId = enrollDto.estudianteId;
    }

    const student = await this.userRepository.findOne({ where: { id: studentId } });
    if (!student) {
      throw new NotFoundException(`Estudiante con ID ${studentId} no encontrado`);
    }
    if (student.role !== UserRole.ESTUDIANTE) {
      throw new BadRequestException('El usuario a matricular debe tener el rol de estudiante');
    }

    // Verificamos si ya existe una matrícula previa (Restricción UQ)
    const existingEnrollment = await this.enrollmentRepository.findOne({
      where: {
        cursoId: course.id,
        estudianteId: student.id,
      },
    });

    if (existingEnrollment) {
      throw new ConflictException(`El estudiante '${student.usuario}' ya se encuentra matriculado en el curso '${course.nombre}'`);
    }

    const enrollment = this.enrollmentRepository.create({
      cursoId: course.id,
      estudianteId: student.id,
      estado: enrollDto.estado || EnrollmentStatus.ACTIVA,
    });

    return this.enrollmentRepository.save(enrollment);
  }

  /**
   * Consulta los cursos en los que un estudiante específico está matriculado.
   */
  async findEnrollmentsByStudent(studentId: number): Promise<Enrollment[]> {
    return this.enrollmentRepository.find({
      where: { estudianteId: studentId },
      relations: {
        curso: {
          docente: true,
        },
      },
      order: { fechaMatricula: 'DESC' },
    });
  }

  /**
   * Consulta la lista de estudiantes inscritos en un curso determinado.
   */
  async findEnrollmentsByCourse(courseId: number, currentUser: User): Promise<Enrollment[]> {
    const course = await this.findCourseById(courseId);

    // Solo el docente titular del curso o un administrador pueden ver la lista completa de alumnos
    if (currentUser.role !== UserRole.ADMIN && course.docenteId !== currentUser.id) {
      throw new ForbiddenException('No tiene permisos para ver la lista de matriculados de este curso');
    }

    return this.enrollmentRepository.find({
      where: { cursoId: courseId },
      relations: {
        estudiante: true,
      },
      order: { fechaMatricula: 'ASC' },
    });
  }

  /**
   * Actualiza el estado de la matrícula (ej: de activa a retirada o completada).
   */
  async updateEnrollmentStatus(id: number, updateDto: UpdateEnrollmentDto): Promise<Enrollment> {
    const enrollment = await this.enrollmentRepository.findOne({ where: { id } });
    if (!enrollment) {
      throw new NotFoundException(`Matrícula con ID ${id} no encontrada`);
    }

    enrollment.estado = updateDto.estado;
    return this.enrollmentRepository.save(enrollment);
  }

  /**
   * Regla de Negocio RN-04:
   * Valida si un estudiante tiene una matrícula activa en el curso al que pertenece un tema.
   * Lanza ForbiddenException si no está matriculado.
   */
  async validateStudentAccessToCourse(studentId: number, courseId: number): Promise<boolean> {
    const enrollment = await this.enrollmentRepository.findOne({
      where: {
        cursoId: courseId,
        estudianteId: studentId,
        estado: EnrollmentStatus.ACTIVA,
      },
    });

    if (!enrollment) {
      throw new ForbiddenException(
        'Regla RN-04: Acceso denegado. El estudiante no tiene una matrícula activa en este curso',
      );
    }

    return true;
  }

  // =========================================================================
  // GESTIÓN DE TEMAS DE APRENDIZAJE
  // =========================================================================

  /**
   * Crea un nuevo tema curricular en un curso.
   * Valida que quien crea el tema sea el docente titular del curso o un administrador.
   */
  async createTopic(createTopicDto: CreateTopicDto, currentUser: User): Promise<LearningTopic> {
    const course = await this.findCourseById(createTopicDto.cursoId);

    if (currentUser.role !== UserRole.ADMIN && course.docenteId !== currentUser.id) {
      throw new ForbiddenException('Solo el docente titular del curso puede crear temas en él');
    }

    const topic = this.topicRepository.create({
      ...createTopicDto,
      docenteId: currentUser.id,
      fechaInicio: new Date(createTopicDto.fechaInicio),
      fechaFin: new Date(createTopicDto.fechaFin),
    });

    return this.topicRepository.save(topic);
  }

  /**
   * Obtiene los temas de un curso.
   * Si es un estudiante, valida RN-04 (matrícula activa) y solo muestra los temas publicados.
   */
  async findTopicsByCourse(courseId: number, currentUser: User): Promise<LearningTopic[]> {
    if (currentUser.role === UserRole.ESTUDIANTE) {
      await this.validateStudentAccessToCourse(currentUser.id, courseId);

      return this.topicRepository.find({
        where: { cursoId: courseId, publicado: true },
        order: { orden: 'ASC' },
      });
    }

    return this.topicRepository.find({
      where: { cursoId: courseId },
      order: { orden: 'ASC' },
    });
  }

  /**
   * Obtiene un tema específico por su ID.
   * Si es estudiante, valida la regla RN-04.
   */
  async findTopicById(id: number, currentUser?: User): Promise<LearningTopic> {
    const topic = await this.topicRepository.findOne({
      where: { id },
      relations: {
        curso: true,
      },
    });

    if (!topic) {
      throw new NotFoundException(`Tema con ID ${id} no encontrado`);
    }

    if (currentUser && currentUser.role === UserRole.ESTUDIANTE) {
      await this.validateStudentAccessToCourse(currentUser.id, topic.cursoId);
      if (!topic.publicado) {
        throw new ForbiddenException('Este tema aún no ha sido publicado por el docente');
      }
    }

    return topic;
  }

  /**
   * Actualiza un tema de aprendizaje.
   */
  async updateTopic(id: number, updateTopicDto: UpdateTopicDto, currentUser: User): Promise<LearningTopic> {
    const topic = await this.findTopicById(id);
    const course = await this.findCourseById(topic.cursoId);

    if (currentUser.role !== UserRole.ADMIN && course.docenteId !== currentUser.id) {
      throw new ForbiddenException('No tiene permisos para modificar este tema');
    }

    const updatePayload: any = { ...updateTopicDto };
    if (updateTopicDto.fechaInicio) {
      updatePayload.fechaInicio = new Date(updateTopicDto.fechaInicio);
    }
    if (updateTopicDto.fechaFin) {
      updatePayload.fechaFin = new Date(updateTopicDto.fechaFin);
    }

    const updated = await this.topicRepository.preload({
      id,
      ...updatePayload,
    });

    if (!updated) {
      throw new NotFoundException(`Tema con ID ${id} no encontrado`);
    }

    return this.topicRepository.save(updated);
  }

  /**
   * Elimina un tema curricular.
   */
  async removeTopic(id: number, currentUser: User): Promise<{ message: string }> {
    const topic = await this.findTopicById(id);
    const course = await this.findCourseById(topic.cursoId);

    if (currentUser.role !== UserRole.ADMIN && course.docenteId !== currentUser.id) {
      throw new ForbiddenException('No tiene permisos para eliminar este tema');
    }

    await this.topicRepository.remove(topic);
    return { message: `Tema '${topic.titulo}' (ID: ${id}) eliminado correctamente` };
  }
}
