import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { buildDatabaseConfig } from '../config/database.config';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MikroOrmModule.forRoot({
      ...buildDatabaseConfig(process.env),
      autoLoadEntities: true,
    }),
    AuthModule,
  ],
})
export class AppModule {}
