# SCAVA - Sistema de Co-aprendizaje Virtual Adaptativo
> **Estándar MOCAVI** · Backend desarrollado con NestJS, TypeScript y TypeORM.

---

## 📌 Descripción del Proyecto

**SCAVA** es una plataforma educativa adaptativa diseñada bajo el **Estándar MOCAVI** que integra agentes pedagógicos de inteligencia artificial, rutas de aprendizaje secuenciales y seguimiento del progreso del estudiante.

---

## 🛠️ Stack Tecnológico

- **Framework**: [NestJS 12](https://nestjs.com/)
- **Lenguaje**: [TypeScript](https://www.typescriptlang.org/) (ESM nativo)
- **Base de Datos**: MariaDB / MySQL
- **ORM**: [TypeORM 1.x](https://typeorm.io/)
- **Autenticación**: Passport JWT (`@nestjs/jwt`, `@nestjs/passport`)
- **Seguridad**: `bcrypt`, `class-validator`, `class-transformer`
- **Control de Acceso**: RBAC (`admin`, `docente`, `estudiante`, `investigador`)

---

## 🚀 Módulos Implementados

### 1. Autenticación y Autorización (`AuthModule`)
- Registro de usuarios con contraseña segura (mínimo 8 caracteres, mayúscula, minúscula y número).
- Inicio de sesión con emisión de JWT (`accessToken`, expiración 1h).
- Estrategia `JwtStrategy` con verificación en tiempo real del estado activo en BD.
- Guards: `JwtAuthGuard`, `RolesGuard` y decoradores personalizados `@Roles()` y `@GetUser()`.
- Serialización segura: `@Exclude()` de `class-transformer` para que la contraseña nunca viaje en JSON.

### 2. Módulo de Usuarios (`UserModule`)
- Entidad `User` mapeada a la tabla `usuarios` del modelo SCAVA.
- Operaciones CRUD con control de acceso por roles.

### 3. Módulo Académico (`AcademicModule`)
- **Cursos (`cursos`)**: Asignaturas con asignación y titularidad docente.
- **Matrículas (`matriculas`)**: Resuelve la relación N:M estudiante-curso con restricción única compuesta `UQ (curso_id, estudiante_id)`.
- **Temas de Aprendizaje (`temas_aprendizaje`)**: Unidades curriculares con fechas y orden secuencial.
- **Regla RN-04**: Control estricto de acceso. Un estudiante solo puede acceder a los temas de los cursos en los que tiene matrícula activa.

### 4. Seguridad y Filtros Globales
- **CORS** habilitado.
- **ValidationPipe** global con `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`.
- **HttpExceptionFilter**: Respuestas de error estandarizadas con timestamp, ruta y método HTTP.

---

## ⚙️ Instalación y Configuración

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/sergio24cc/Scava-DSI-I-II-III.git
   cd Scava-DSI-I-II-III
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Configurar variables de entorno:
   Copiar `.env.example` a `.env` y configurar las credenciales de base de datos y JWT:
   ```bash
   cp .env.example .env
   ```

4. Iniciar en modo desarrollo:
   ```bash
   npm run start:dev
   ```

5. Compilar para producción:
   ```bash
   npm run build
   npm run start:prod
   ```
