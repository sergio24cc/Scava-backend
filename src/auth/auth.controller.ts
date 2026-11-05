import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GetUser } from './decorators/get-user.decorator';
import { User } from '../user/entities/user.entity';

/**
 * Controlador de Autenticación (AuthController)
 * Expone los endpoints públicos de registro y login, y la ruta protegida de perfil.
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/register
   * Endpoint público para el registro de nuevos usuarios en el sistema.
   * Valida la estructura mediante RegisterDto y responde con código 201 Created.
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  /**
   * POST /auth/login
   * Endpoint público para autenticar credenciales existentes.
   * Verifica el correo y la contraseña, emite un token JWT y responde con código 200 OK.
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  /**
   * GET /auth/profile
   * Endpoint protegido que requiere un Bearer Token válido (JwtAuthGuard).
   * Utiliza el decorador personalizado @GetUser() para extraer los datos del usuario autenticado.
   */
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@GetUser() user: User) {
    return user;
  }
}
