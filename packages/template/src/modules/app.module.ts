import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { validateAppEnv } from '../config/app-env.config';
import { buildDatabaseConfig } from '../config/database.config';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateAppEnv,
    }),
    MikroOrmModule.forRoot({
      ...buildDatabaseConfig(process.env),
      autoLoadEntities: true,
    }),
    AuthModule,
    HealthModule,
  ],
})
export class AppModule {}
