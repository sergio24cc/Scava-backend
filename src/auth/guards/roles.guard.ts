import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator.js';
import { UserRole } from '../../user/enums/role.enum.js';
import { User } from '../../user/entities/user.entity.js';

/**
 * Guard de Autorización Basado en Roles (RolesGuard)
 * Diseñado para combinarse con JwtAuthGuard:
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * 
 * Flujo de ejecución:
 * 1. Lee los roles permitidos mediante Reflector desde el manejador de la ruta o la clase.
 * 2. Si no hay roles definidos con @Roles(), permite el acceso libre a cualquier usuario autenticado.
 * 3. Extrae al usuario autenticado inyectado previamente por JwtAuthGuard en request.user.
 * 4. Verifica si el rol del usuario coincide con alguno de los roles autorizados.
 * 5. Lanza 403 ForbiddenException si el rol no tiene permisos suficientes.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Obtenemos los roles requeridos para este endpoint específico
    const requiredRoles = this.reflector.getAllAndOverride<(UserRole | string)[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si la ruta no tiene el decorador @Roles(), significa que cualquier usuario autenticado puede acceder
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // 2. Extraemos el usuario autenticado del request (inyectado por JwtStrategy)
    const { user } = context.switchToHttp().getRequest<{ user: User }>();

    // Si no hay usuario en el request (JwtAuthGuard no fue ejecutado previamente)
    if (!user) {
      throw new ForbiddenException(
        'Usuario no autenticado en la petición: Asegúrese de aplicar JwtAuthGuard antes de RolesGuard',
      );
    }

    // 3. Verificamos si el rol del usuario se encuentra en la lista de roles autorizados
    const hasPermission = requiredRoles.includes(user.role);

    if (!hasPermission) {
      throw new ForbiddenException(
        `Acceso denegado: Se requiere uno de los siguientes roles [${requiredRoles.join(', ')}]. Su rol actual es '${user.role}'`,
      );
    }

    return true;
  }
}
