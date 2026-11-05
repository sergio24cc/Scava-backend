import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { AcademicService } from './academic.service';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../user/entities/user.entity';
import { UserRole } from '../user/enums/role.enum';

/**
 * Controlador de Matrículas (EnrollmentsController)
 * Gestiona consultas de cursos inscritos y actualización de estados de matrícula.
 */
@Controller('enrollments')
@UseGuards(JwtAuthGuard)
export class EnrollmentsController {
  constructor(private readonly academicService: AcademicService) {}

  /**
   * GET /enrollments/my-courses
   * Permite al estudiante autenticado consultar todos los cursos en los que está matriculado.
   */
  @Get('my-courses')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ESTUDIANTE)
  getMyEnrollments(@GetUser() currentUser: User) {
    return this.academicService.findEnrollmentsByStudent(currentUser.id);
  }

  /**
   * PATCH /enrollments/:id
   * Actualiza el estado de una matrícula (activa, retirada, completada). Solo DOCENTE o ADMIN.
   */
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.DOCENTE, UserRole.ADMIN)
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateEnrollmentDto,
  ) {
    return this.academicService.updateEnrollmentStatus(id, updateDto);
  }
}
