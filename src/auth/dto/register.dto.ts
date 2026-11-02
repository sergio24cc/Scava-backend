import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  Matches,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { UserRole } from '../../user/enums/role.enum.js';

/**
 * DTO para la solicitud de registro de usuarios (RegisterDto)
 * Valida los datos de entrada según el modelo SCAVA antes de ser procesados por AuthService.
 */
export class RegisterDto {
  // Validación de nombre: obligatorio y tipo string con longitud mínima
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MinLength(2, { message: 'El nombre debe contener al menos 2 caracteres' })
  nombre: string;

  // Validación de apellido: obligatorio y tipo string con longitud mínima
  @IsString({ message: 'El apellido debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  @MinLength(2, { message: 'El apellido debe contener al menos 2 caracteres' })
  apellido: string;

  // Validación de nombre de usuario único: obligatorio y mínimo 3 caracteres
  @IsString({ message: 'El nombre de usuario debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre de usuario es obligatorio' })
  @MinLength(3, { message: 'El nombre de usuario debe contener al menos 3 caracteres' })
  usuario: string;

  // Validación de correo: formato RFC válido y obligatorio
  @IsEmail({}, { message: 'El correo electrónico debe tener un formato válido (ej: usuario@correo.com)' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
  email: string;

  /**
   * Validación estricta de contraseña segura:
   * 1. MinLength(8): Longitud mínima de 8 caracteres.
   * 2. Matches con Regex:
   *    - (?=.*[a-z]) : al menos una letra minúscula
   *    - (?=.*[A-Z]) : al menos una letra mayúscula
   *    - (?=.*\d)     : al menos un número
   */
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @MinLength(8, { message: 'La contraseña debe tener una longitud mínima de 8 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/, {
    message: 'La contraseña debe ser segura: mínimo 8 caracteres, al menos una mayúscula, una minúscula y un número',
  })
  password: string;

  // Rol del usuario: opcional (por defecto ESTUDIANTE) y restringido a los valores de UserRole
  @IsOptional()
  @IsEnum(UserRole, {
    message: `El rol debe ser uno de los permitidos: ${Object.values(UserRole).join(', ')}`,
  })
  role?: UserRole;
}
