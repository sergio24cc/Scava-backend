import { UserRole } from '../../user/enums/role.enum';

/**
 * Estructura del Payload codificado dentro del JSON Web Token (JWT).
 * - sub: Subject del token, almacena el ID único del usuario autenticado.
 * - email: Correo electrónico del usuario.
 * - role: Rol asignado al usuario para control de acceso (RBAC).
 */
export interface JwtPayload {
  sub: number;
  email: string;
  role: UserRole;
}
