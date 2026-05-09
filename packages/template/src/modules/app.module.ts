import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { validateAppEnv } from '../config/app-env.config';
import { buildDatabaseConfig } from '../config/database.config';
import { AuthModule } from './domains/auth/auth.module';
import { HealthModule } from './domains/health/health.module';
import { MailModule } from './infra/mail/mail.module';
import { StorageModule } from './infra/storage/storage.module';

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

    // infra
    MailModule,
    StorageModule,

    // domains
    AuthModule,
    HealthModule,
  ],
})
export class AppModule {}
