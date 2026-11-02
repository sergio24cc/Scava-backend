import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { User } from '../../user/entities/user.entity.js';

/**
 * Decorador de parámetro @GetUser()
 * Extrae limpiamente el usuario autenticado desde el objeto Request (request.user).
 * 
 * Uso:
 * - @GetUser() user: User           -> Retorna la entidad User completa
 * - @GetUser('email') email: string -> Retorna únicamente el campo 'email'
 */
export const GetUser = createParamDecorator(
  (data: keyof User | undefined, ctx: ExecutionContext) => {
    // Obtenemos el objeto Request de Express
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as User;

    // Validación preventiva: el decorador debe usarse en rutas protegidas por JwtAuthGuard
    if (!user) {
      throw new InternalServerErrorException(
        'Usuario no encontrado en la petición. Asegúrese de aplicar @UseGuards(JwtAuthGuard) en el endpoint.',
      );
    }

    // Retorna una propiedad específica o el usuario completo
    return data ? user[data] : user;
  },
);
