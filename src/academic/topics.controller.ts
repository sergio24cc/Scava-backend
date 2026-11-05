import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { AcademicService } from './academic.service.js';
import { UpdateTopicDto } from './dto/update-topic.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { GetUser } from '../auth/decorators/get-user.decorator.js';
import { User } from '../user/entities/user.entity.js';
import { UserRole } from '../user/enums/role.enum.js';

/**
 * Controlador de Temas de Aprendizaje (TopicsController)
 * Gestiona consultas detalladas, edición y eliminación de temas curriculares.
 */
@Controller('topics')
@UseGuards(JwtAuthGuard)
export class TopicsController {
  constructor(private readonly academicService: AcademicService) {}

  /**
   * GET /topics/:id
   * Obtiene la información de un tema específico. Aplica RN-04 si quien consulta es estudiante.
   */
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() currentUser: User,
  ) {
    return this.academicService.findTopicById(id, currentUser);
  }

  /**
   * PATCH /topics/:id
   * Modifica un tema de aprendizaje. Solo permitido para el docente titular o ADMIN.
   */
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.DOCENTE, UserRole.ADMIN)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTopicDto: UpdateTopicDto,
    @GetUser() currentUser: User,
  ) {
    return this.academicService.updateTopic(id, updateTopicDto, currentUser);
  }

  /**
   * DELETE /topics/:id
   * Elimina un tema de aprendizaje. Solo permitido para el docente titular o ADMIN.
   */
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.DOCENTE, UserRole.ADMIN)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() currentUser: User,
  ) {
    return this.academicService.removeTopic(id, currentUser);
  }
}
