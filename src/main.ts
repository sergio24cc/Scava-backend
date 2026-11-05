import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, Logger, ClassSerializerInterceptor } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

/**
 * Funcion principal de arranque (bootstrap)
 * Centraliza las directivas de seguridad global: CORS, ValidationPipe, Serializacion y Manejo de Errores.
 */
async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // 1. Configuracion de CORS (Cross-Origin Resource Sharing)
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // 2. Sanitizacion y validacion estricta de datos de entrada
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,            // Descarta propiedades no definidas en los DTOs
      forbidNonWhitelisted: true, // Rechaza peticiones con propiedades no autorizadas
      transform: true,            // Convierte payloads a instancias de clase DTO
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // 3. Serializacion global para activacion de decoradores @Exclude()
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // 4. Filtro global de excepciones HTTP para respuestas estandarizadas
  app.useGlobalFilters(new HttpExceptionFilter());

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  logger.log('Servidor ejecutandose en: http://localhost:' + port);
  logger.log('Seguridad activa: CORS, ValidationPipe, Serializacion @Exclude y Filtro Global de Errores');
}

bootstrap().catch((err) => {
  console.error('Error al iniciar el servidor:', err);
  process.exit(1);
});