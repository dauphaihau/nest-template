import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { GraphQLModule } from '@nestjs/graphql';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { join } from 'node:path';
import { SendWelcomeEmailOnUserCreatedListener } from '../common/listeners/send-welcome-email-on-user-created.listener';
import { validateAppEnv } from '../config/app-env.config';
import { buildDatabaseConfig } from '../config/database.config';
import { AuthModule } from './domains/auth/auth.module';
import { HealthModule } from './domains/health/health.module';
import { UserModule } from './domains/user/user.module';
import { MailModule } from './infra/mail/mail.module';
import { RateLimitModule } from './infra/rate-limit/rate-limit.module';
import { StorageModule } from './infra/storage/storage.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateAppEnv,
    }),
    EventEmitterModule.forRoot(),

    // infra
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      path: '/graphql',
      context: ({ req }) => ({ req }),
    }),
    MikroOrmModule.forRoot({
      ...buildDatabaseConfig(process.env),
      autoLoadEntities: true,
      registerRequestContext: false,
    }),
    MikroOrmModule.forMiddleware(),
    MailModule,
    RateLimitModule,
    StorageModule,

    // domains
    AuthModule,
    HealthModule,
    UserModule,
  ],
  providers: [SendWelcomeEmailOnUserCreatedListener],
})
export class AppModule {}
