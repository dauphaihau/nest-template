import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { RequestLoggingInterceptor } from './common/interceptors/request-logging.interceptor';
import { parseCorsAllowedOrigins } from './config/cors.config';
import { AppModule } from './modules/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const corsAllowedOrigins = parseCorsAllowedOrigins(process.env);

  // Configure cross-cutting HTTP behavior once at bootstrap time.
  if (corsAllowedOrigins.length > 0) {
    app.enableCors({
      origin: corsAllowedOrigins,
    });
  }

  app.enableShutdownHooks();
  app.setGlobalPrefix(process.env.API_PREFIX ?? 'api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector)),
    new RequestLoggingInterceptor(),
  );
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
