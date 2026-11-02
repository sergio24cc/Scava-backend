import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard de Autenticación JWT (JwtAuthGuard)
 * Extiende del guard nativo de Passport ('jwt') para proteger rutas que requieren sesión activa.
 * 
 * Flujo:
 * 1. Extrae el Bearer token del header 'Authorization'.
 * 2. Invoca la estrategia JwtStrategy para validar la firma y obtener el usuario.
 * 3. Si el token es inválido o no existe, lanza un error 401 Unauthorized de forma automática.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  /**
   * Sobrescritura opcional de handleRequest para personalizar el mensaje de error
   * en caso de ausencia o fallo de autenticación del token.
   */
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err || !user) {
      throw err || new UnauthorizedException('Acceso no autorizado: Debe proporcionar un token JWT válido');
    }
    return user;
  }
}
