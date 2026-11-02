import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from '../user/user.module.js';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { RolesGuard } from './guards/roles.guard.js';

/**
 * Módulo de Autenticación (AuthModule)
 * Configura la infraestructura de autenticación JWT y Passport para la aplicación.
 */
@Module({
  imports: [
    // Importamos UserModule para tener acceso al repositorio y servicio de usuarios
    UserModule,

    // Registramos PassportModule definiendo 'jwt' como la estrategia por defecto
    PassportModule.register({ defaultStrategy: 'jwt' }),

    // Configuración asíncrona de JwtModule inyectando ConfigService para variables de entorno
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret) {
          throw new Error('JWT_SECRET no se encuentra configurada en el archivo de entorno (.env)');
        }

        return {
          secret,
          signOptions: {
            // Tiempo de expiración del access token (por defecto '1h' según las especificaciones)
            expiresIn: (configService.get<string>('JWT_EXPIRATION') || '1h') as any,
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtAuthGuard, RolesGuard],
  // Exportamos los servicios y módulos para que puedan ser consumidos en otros módulos (ej. UsersModule)
  exports: [AuthService, JwtStrategy, PassportModule, JwtModule, JwtAuthGuard, RolesGuard],
})
export class AuthModule {}
