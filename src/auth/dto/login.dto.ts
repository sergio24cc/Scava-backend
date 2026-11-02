import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

/**
 * DTO para la solicitud de inicio de sesión (LoginDto)
 * Valida que tanto el correo como la contraseña sean provistos obligatoriamente en la petición.
 */
export class LoginDto {
  // Correo del usuario registrado: debe cumplir formato email y ser obligatorio
  @IsEmail({}, { message: 'El correo electrónico debe tener un formato válido' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio para iniciar sesión' })
  email: string;

  // Contraseña en texto plano para cotejar contra el hash de la base de datos
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria para iniciar sesión' })
  password: string;
}
