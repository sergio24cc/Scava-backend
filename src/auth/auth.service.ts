import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { JwtPayload } from './interfaces/jwt-payload.interface.js';
import { User } from '../user/entities/user.entity.js';
import { UserRole } from '../user/enums/role.enum.js';

/**
 * Servicio de Autenticación (AuthService)
 * Gestiona el ciclo de vida de autenticación: registro, verificación de credenciales y firma de JWT.
 */
@Injectable()
export class AuthService {
  // Número de rondas de sal para el algoritmo bcrypt
  private readonly SALT_ROUNDS = 10;

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Método register():
   * 1. Valida unicidad de correo y nombre de usuario delegando a UserService.
   * 2. Encripta la contraseña de forma asíncrona mediante bcrypt con 10 rondas de sal.
   * 3. Persiste el nuevo registro en la base de datos MariaDB/MySQL.
   * 4. Emite el token JWT de bienvenida y retorna los datos del usuario sin exponer la contraseña.
   */
  async register(registerDto: RegisterDto): Promise<{
    user: Omit<User, 'password'>;
    accessToken: string;
  }> {
    // Delegamos la creación a UserService (que ejecuta la encriptación bcrypt y validación de duplicados)
    const user = await this.userService.create(registerDto);

    // Generamos el access token inicial para permitir autenticación inmediata
    const accessToken = this.generateJwtToken(user.id, user.email, user.role);

    return {
      user,
      accessToken,
    };
  }

  /**
   * Método validateUser():
   * Valida un usuario por su correo electrónico:
   * 1. Verifica si el usuario existe en el sistema.
   * 2. Comprueba si el usuario se encuentra activo (isActive === true).
   * 3. Si se provee la contraseña en texto plano, la compara contra el hash almacenado en la BD con bcrypt.compare.
   * Retorna la entidad User completa o lanza una excepción UnauthorizedException.
   */
  async validateUser(email: string, passwordPlain?: string): Promise<User> {
    // Obtenemos el usuario incluyendo el hash de la contraseña (select: false en la entidad)
    const user = await this.userService.findByEmailWithPassword(email);

    // Verificación 1: Existencia del usuario
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas: correo o contraseña incorrectos');
    }

    // Verificación 2: Estado activo del usuario
    if (!user.isActive) {
      throw new UnauthorizedException('Acceso denegado: su cuenta de usuario se encuentra inactiva');
    }

    // Verificación 3: Cotejo de contraseña si fue provista
    if (passwordPlain) {
      const isPasswordValid = await bcrypt.compare(passwordPlain, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Credenciales inválidas: correo o contraseña incorrectos');
      }
    }

    return user;
  }

  /**
   * Método login():
   * 1. Valida las credenciales del usuario invocando validateUser().
   * 2. Desestructura la entidad para excluir la contraseña.
   * 3. Firma un nuevo JSON Web Token (JWT) con el payload { sub, email, role }.
   * 4. Retorna el perfil seguro del usuario y el token de acceso.
   */
  async login(loginDto: LoginDto): Promise<{
    user: Omit<User, 'password'>;
    accessToken: string;
  }> {
    // Validamos la existencia, estado activo y contraseña
    const validatedUser = await this.validateUser(loginDto.email, loginDto.password);

    // Excluimos la propiedad password del objeto resultante
    const { password: _, ...userWithoutPassword } = validatedUser;

    // Generamos el token de acceso JWT
    const accessToken = this.generateJwtToken(
      validatedUser.id,
      validatedUser.email,
      validatedUser.role,
    );

    return {
      user: userWithoutPassword as Omit<User, 'password'>,
      accessToken,
    };
  }

  /**
   * Método auxiliar para generar y firmar el JWT:
   * Empaqueta el ID del usuario en 'sub' (estándar RFC 7519), correo y rol.
   */
  private generateJwtToken(userId: number, email: string, role: UserRole): string {
    const payload: JwtPayload = {
      sub: userId,
      email,
      role,
    };

    return this.jwtService.sign(payload);
  }
}
