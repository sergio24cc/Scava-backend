import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../user/user.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { User } from '../../user/entities/user.entity';

/**
 * Estrategia JWT (JwtStrategy)
 * Intercepta las solicitudes HTTP, extrae el token Bearer del header Authorization,
 * valida su firma criptográfica y decodifica el payload para autenticar al usuario.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET no está definida en las variables de entorno (.env)');
    }

    super({
      // 1. Extrae el token en formato Bearer desde el header Authorization
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // 2. No ignora la expiración: tokens expirados lanzarán 401 Unauthorized automáticamente
      ignoreExpiration: false,
      // 3. Clave secreta con la que se firmó el token
      secretOrKey: jwtSecret,
    });
  }

  /**
   * Método validate():
   * Invocado automáticamente por Passport una vez verificado que el JWT es válido y vigente.
   * 1. Recibe el payload decodificado ({ sub, email, role }).
   * 2. Consulta en la base de datos si el usuario aún existe.
   * 3. Verifica que la cuenta de usuario continúe activa.
   * 4. El objeto retornado es inyectado por NestJS en request.user.
   */
  async validate(payload: JwtPayload): Promise<User> {
    // Buscamos al usuario por su ID (payload.sub)
    const user = await this.userService.findOne(payload.sub).catch(() => null);

    // Si el usuario fue eliminado de la base de datos tras la emisión del token
    if (!user) {
      throw new UnauthorizedException('Token no válido: el usuario asociado no existe en el sistema');
    }

    // Si el usuario fue desactivado/bloqueado por un administrador
    if (!user.isActive) {
      throw new UnauthorizedException('Acceso denegado: la cuenta de usuario se encuentra inactiva');
    }

    // Al retornar 'user', queda disponible en cualquier controlador mediante req.user o el decorador @GetUser()
    return user;
  }
}
