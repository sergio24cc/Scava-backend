import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../user/enums/role.enum.js';

/**
 * Clave de metadatos utilizada por Reflector para almacenar y leer los roles requeridos.
 */
export const ROLES_KEY = 'roles';

/**
 * Decorador personalizado @Roles()
 * Permite asociar uno o más roles permitidos a un endpoint o controlador completo.
 * Acepta tanto el enum UserRole como strings literales para máxima flexibilidad.
 * 
 * Ejemplo de uso:
 * @Roles(UserRole.ADMIN, UserRole.DOCENTE)
 * @Get('reportes')
 */
export const Roles = (...roles: (UserRole | string)[]) => SetMetadata(ROLES_KEY, roles);
