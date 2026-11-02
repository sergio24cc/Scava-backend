import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, Logger, ClassSerializerInterceptor } from '@nestjs/common';
import { AppModule } from './app.module.js';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';

/**
 * Función principal de arranque (bootstrap)
 * Centraliza las directivas de seguridad global: CORS, ValidationPipe, Serialización y Manejo de Errores.
 */
async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // 1. Configuración de CORS (Cross-Origin Resource Sharing)
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // 2. Sanitización y validación estricta de datos de entrada
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

  // 3. Serialización global para activación de decoradores @Exclude()
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // 4. Filtro global de excepciones HTTP para respuestas estandarizadas
  app.useGlobalFilters(new HttpExceptionFilter());

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  logger.log(`🚀 Servidor ejecutándose en: http://localhost:${port}`);
  logger.log(`🛡️  Seguridad activa: CORS, ValidationPipe, Serialización @Exclude y Filtro Global de Errores`);
}
await bootstrap();
