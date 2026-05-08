import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { parseCorsAllowedOrigins } from './config/cors.config';
import { AppModule } from './modules/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const corsAllowedOrigins = parseCorsAllowedOrigins(process.env);

  if (corsAllowedOrigins.length > 0) {
    app.enableCors({
      origin: corsAllowedOrigins,
    });
  }

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
