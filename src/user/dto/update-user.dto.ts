import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  Matches,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { UserRole } from '../enums/role.enum.js';

/**
 * DTO para la actualización parcial de usuarios (UpdateUserDto)
 * Utiliza @IsOptional() en todas sus propiedades para permitir modificar solo los campos enviados.
 */
export class UpdateUserDto {
  // Nombre opcional a actualizar
  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  nombre?: string;

  // Apellido opcional a actualizar
  @IsOptional()
  @IsString({ message: 'El apellido debe ser una cadena de texto' })
  @MinLength(2, { message: 'El apellido debe tener al menos 2 caracteres' })
  apellido?: string;

  // Nombre de usuario opcional a actualizar
  @IsOptional()
  @IsString({ message: 'El nombre de usuario debe ser una cadena de texto' })
  @MinLength(3, { message: 'El nombre de usuario debe tener al menos 3 caracteres' })
  usuario?: string;

  // Correo electrónico opcional a actualizar
  @IsOptional()
  @IsEmail({}, { message: 'El correo electrónico debe tener un formato válido' })
  email?: string;

  // Nueva contraseña opcional: si se provee, debe cumplir la misma regla de seguridad estricta
  @IsOptional()
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @MinLength(8, { message: 'La nueva contraseña debe tener al menos 8 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/, {
    message: 'La nueva contraseña debe contener al menos una mayúscula, una minúscula y un número',
  })
  password?: string;

  // Rol opcional a actualizar (generalmente reservado para administradores)
  @IsOptional()
  @IsEnum(UserRole, {
    message: `El rol debe ser válido: ${Object.values(UserRole).join(', ')}`,
  })
  role?: UserRole;

  // Estado activo/inactivo opcional
  @IsOptional()
  @IsBoolean({ message: 'El estado activo debe ser un valor booleano (true/false)' })
  isActive?: boolean;
}
