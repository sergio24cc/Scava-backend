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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from './user.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from './enums/role.enum.js';

/**
 * Controlador de Gestión de Usuarios (UserController)
 * Implementa las operaciones CRUD complementarias con protección de rutas y roles (RBAC).
 */
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * POST /users
   * Creación directa de usuarios (uso administrativo).
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  /**
   * GET /users
   * Lista todos los usuarios registrados.
   * Restringido exclusivamente a usuarios con rol ADMIN.
   */
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.userService.findAll();
  }

  /**
   * GET /users/:id
   * Obtiene la información de un usuario específico por su ID.
   * Requiere estar autenticado con un token JWT válido.
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  /**
   * PATCH /users/:id
   * Actualiza parcialmente la información de un usuario.
   * Requiere estar autenticado con un token JWT válido.
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(id, updateUserDto);
  }

  /**
   * DELETE /users/:id
   * Elimina un usuario por su ID de la base de datos.
   * Restringido exclusivamente a usuarios con rol ADMIN.
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }
}
